import { unlink } from "node:fs/promises";
import pool from "../config/db.js";
import HttpError from "../utils/HttpError.js";

const submissionSelect = `
  SELECT s.id, s.project_id AS projectId, p.name AS projectName,
         s.reporting_year AS reportingYear, s.category, s.sub_category AS subCategory,
         s.energy_value AS energyValue, s.unit, s.description,
         s.evidence_file_name AS evidenceFileName, s.evidence_file_url AS evidenceFileUrl,
         s.status, s.submitted_by AS submittedById, u.name AS submittedByName,
         s.review_comment AS reviewComment, s.created_at AS createdAt, s.updated_at AS updatedAt
  FROM submissions s
  JOIN projects p ON p.id = s.project_id
  JOIN users u ON u.id = s.submitted_by`;

function submissionDto(row, history = undefined) {
  if (!row) return null;
  const result = {
    id: row.id,
    project: { id: row.projectId, name: row.projectName },
    reportingYear: row.reportingYear,
    category: row.category,
    subCategory: row.subCategory,
    energyValue: Number(row.energyValue),
    unit: row.unit,
    description: row.description,
    evidence: {
      fileName: row.evidenceFileName || "",
      fileUrl: row.evidenceFileUrl || "",
    },
    status: row.status,
    submittedBy: { id: row.submittedById, name: row.submittedByName },
    reviewComment: row.reviewComment || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (history) result.history = history.map((item) => ({
    status: item.status,
    comment: item.comment || "",
    changedAt: item.changedAt,
  }));
  return result;
}

function parseProjectId(value) {
  if (value && typeof value === "object") return Number(value.id ?? value.projectId);
  if (typeof value === "string") {
    const normalized = value.trim();
    if (normalized.startsWith("{")) {
      try {
        const parsed = JSON.parse(normalized);
        return Number(parsed.id ?? parsed.projectId);
      } catch {
        return Number.NaN;
      }
    }
    return Number(normalized);
  }
  return Number(value);
}

function parseSubmission(body, user, existingProjectId = null) {
  const projectValue = body.project ?? body.projectId;
  const requestedProjectId = projectValue == null ? existingProjectId : parseProjectId(projectValue);
  const projectId = user.role === "PROJECT_USER" ? Number(user.projectId) : requestedProjectId;
  const reportingYear = Number(body.reportingYear);
  const energyValue = Number(body.energyValue);
  const unit = body.unit || "kWh";
  const category = String(body.category || "ENVIRONMENTAL").toUpperCase();
  const subCategory = String(body.subCategory || "ENERGY").toUpperCase();
  const description = String(body.description || "").trim();

  if (!Number.isInteger(projectId) || projectId <= 0) throw new HttpError(400, "A valid project is required.");
  if (user.role === "PROJECT_USER" && requestedProjectId != null && requestedProjectId !== Number(user.projectId)) {
    throw new HttpError(403, "You can only submit data for your assigned project.");
  }
  if (!Number.isInteger(reportingYear) || reportingYear < 2000 || reportingYear > 2100) {
    throw new HttpError(400, "Reporting year must be between 2000 and 2100.");
  }
  if (!Number.isFinite(energyValue) || energyValue < 0) throw new HttpError(400, "Energy value must be a non-negative number.");
  if (!["kWh", "MWh"].includes(unit)) throw new HttpError(400, "Unit must be kWh or MWh.");
  if (category !== "ENVIRONMENTAL" || subCategory !== "ENERGY") {
    throw new HttpError(400, "This MVP accepts Environmental energy submissions only.");
  }
  if (!description || description.length > 1000) throw new HttpError(400, "Description is required and must be 1000 characters or fewer.");

  return { projectId, reportingYear, category, subCategory, energyValue, unit, description };
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Submission ID must be a positive integer.");
  return id;
}

async function getSubmission(connection, id, lock = false) {
  const [rows] = await connection.execute(
    `${submissionSelect} WHERE s.id = ?${lock ? " FOR UPDATE" : ""}`,
    [id],
  );
  return rows[0] || null;
}

async function getSubmissionWithHistory(id) {
  const connection = await pool.getConnection();
  try {
    const row = await getSubmission(connection, id);
    if (!row) return null;
    const [history] = await connection.execute(
      `SELECT status, comment, created_at AS changedAt
       FROM submission_history WHERE submission_id = ? ORDER BY created_at ASC, id ASC`,
      [id],
    );
    return submissionDto(row, history);
  } finally {
    connection.release();
  }
}

async function removeUploadedFile(file) {
  if (!file?.path) return;
  try {
    await unlink(file.path);
  } catch {
    // The file may already have been removed.
  }
}

export async function listSubmissions(request, response) {
  const { role, projectId } = request.user;
  let sql = `${submissionSelect} `;
  let parameters = [];
  if (role === "PROJECT_USER") {
    if (!projectId) throw new HttpError(403, "Your account is not assigned to a project.");
    sql += "WHERE s.project_id = ? ";
    parameters = [projectId];
  } else if (role === "REVIEWER") {
    sql += "WHERE s.status <> 'APPROVED' ";
  }
  sql += "ORDER BY s.updated_at DESC, s.id DESC";

  const [rows] = await pool.execute(sql, parameters);
  response.json({ success: true, submissions: rows.map((row) => submissionDto(row)) });
}

export async function getSubmissionById(request, response) {
  const id = parseId(request.params.id);
  const submission = await getSubmissionWithHistory(id);
  if (!submission) throw new HttpError(404, "Submission not found.");
  if (request.user.role === "PROJECT_USER" && submission.project.id !== Number(request.user.projectId)) {
    throw new HttpError(404, "Submission not found.");
  }
  response.json({ success: true, submission });
}

export async function createSubmission(request, response) {
  const file = request.file;
  let connection;
  let committed = false;
  try {
    const values = parseSubmission(request.body, request.user);
    const [projects] = await pool.execute("SELECT id FROM projects WHERE id = ? LIMIT 1", [values.projectId]);
    if (!projects.length) throw new HttpError(400, "The selected project does not exist.");

    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `INSERT INTO submissions
       (project_id, reporting_year, category, sub_category, energy_value, unit, description,
        evidence_file_name, evidence_file_url, status, submitted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [
        values.projectId, values.reportingYear, values.category, values.subCategory,
        values.energyValue, values.unit, values.description,
        file?.originalname || null,
        file ? `/uploads/${encodeURIComponent(file.filename)}` : null,
        request.user.id,
      ],
    );
    await connection.execute(
      "INSERT INTO submission_history (submission_id, status, comment, changed_by) VALUES (?, 'PENDING', ?, ?)",
      [result.insertId, "Submission created.", request.user.id],
    );
    await connection.commit();
    committed = true;
    const submission = await getSubmissionWithHistory(result.insertId);
    response.status(201).json({ success: true, submission });
  } catch (error) {
    if (connection && !committed) await connection.rollback();
    if (!committed) await removeUploadedFile(file);
    throw error;
  } finally {
    connection?.release();
  }
}

export async function updateSubmission(request, response) {
  const id = parseId(request.params.id);
  const file = request.file;
  let connection;
  let committed = false;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const current = await getSubmission(connection, id, true);
    if (!current || (request.user.role === "PROJECT_USER" && current.projectId !== Number(request.user.projectId))) {
      throw new HttpError(404, "Submission not found.");
    }
    if (!["PENDING", "CORRECTION_REQUIRED"].includes(current.status)) {
      throw new HttpError(409, "Only pending or correction-required submissions can be edited.");
    }

    const values = parseSubmission(request.body, request.user, current.projectId);
    if (values.projectId !== current.projectId) throw new HttpError(400, "A submission's project cannot be changed.");
    await connection.execute(
      `UPDATE submissions SET reporting_year = ?, category = ?, sub_category = ?, energy_value = ?,
       unit = ?, description = ?, evidence_file_name = ?, evidence_file_url = ?, status = 'PENDING',
       review_comment = NULL WHERE id = ?`,
      [
        values.reportingYear, values.category, values.subCategory, values.energyValue,
        values.unit, values.description,
        file?.originalname || current.evidenceFileName,
        file ? `/uploads/${encodeURIComponent(file.filename)}` : current.evidenceFileUrl,
        id,
      ],
    );
    await connection.execute(
      "INSERT INTO submission_history (submission_id, status, comment, changed_by) VALUES (?, 'PENDING', ?, ?)",
      [id, "Submission updated and resubmitted.", request.user.id],
    );
    await connection.commit();
    committed = true;
    const submission = await getSubmissionWithHistory(id);
    response.json({ success: true, submission });
  } catch (error) {
    if (connection && !committed) await connection.rollback();
    if (!committed) await removeUploadedFile(file);
    throw error;
  } finally {
    connection?.release();
  }
}

export async function reviewSubmission(request, response) {
  const id = parseId(request.params.id);
  const decision = request.body?.decision
    || (request.body?.status === "CORRECTION_REQUIRED" ? "CORRECTION_REQUIRED" : "UNDER_REVIEW");
  if (!["UNDER_REVIEW", "CORRECTION_REQUIRED"].includes(decision)) {
    throw new HttpError(400, "Review decision must be UNDER_REVIEW or CORRECTION_REQUIRED.");
  }
  const comment = String(request.body?.comment ?? request.body?.reviewComment ?? "").trim();
  if (decision === "CORRECTION_REQUIRED" && !comment) {
    throw new HttpError(400, "A comment is required when requesting a correction.");
  }

  const connection = await pool.getConnection();
  let committed = false;
  try {
    await connection.beginTransaction();
    const current = await getSubmission(connection, id, true);
    if (!current) throw new HttpError(404, "Submission not found.");
    if (current.status === "APPROVED") throw new HttpError(409, "An approved submission cannot be reviewed again.");
    await connection.execute(
      "UPDATE submissions SET status = ?, review_comment = ? WHERE id = ?",
      [decision, comment || null, id],
    );
    await connection.execute(
      "INSERT INTO submission_reviews (submission_id, reviewer_id, decision, comment) VALUES (?, ?, ?, ?)",
      [id, request.user.id, decision, comment || null],
    );
    await connection.execute(
      "INSERT INTO submission_history (submission_id, status, comment, changed_by) VALUES (?, ?, ?, ?)",
      [id, decision, comment || "Submission review started.", request.user.id],
    );
    await connection.commit();
    committed = true;
    const submission = await getSubmissionWithHistory(id);
    response.json({ success: true, submission });
  } catch (error) {
    if (!committed) await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function approveSubmission(request, response) {
  const id = parseId(request.params.id);
  const comment = String(request.body?.comment || "").trim();
  const connection = await pool.getConnection();
  let committed = false;
  try {
    await connection.beginTransaction();
    const current = await getSubmission(connection, id, true);
    if (!current) throw new HttpError(404, "Submission not found.");
    if (current.status === "APPROVED") throw new HttpError(409, "Submission is already approved.");
    await connection.execute(
      "UPDATE submissions SET status = 'APPROVED', review_comment = ? WHERE id = ?",
      [comment || "Approved.", id],
    );
    await connection.execute(
      "INSERT INTO submission_reviews (submission_id, reviewer_id, decision, comment) VALUES (?, ?, 'APPROVED', ?)",
      [id, request.user.id, comment || "Approved."],
    );
    await connection.execute(
      "INSERT INTO submission_history (submission_id, status, comment, changed_by) VALUES (?, 'APPROVED', ?, ?)",
      [id, comment || "Approved.", request.user.id],
    );
    await connection.commit();
    committed = true;
    const submission = await getSubmissionWithHistory(id);
    response.json({ success: true, submission });
  } catch (error) {
    if (!committed) await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

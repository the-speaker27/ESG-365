import pool from "../config/db.js";
import HttpError from "../utils/HttpError.js";

const reportingYear = Number(process.env.REPORTING_YEAR || 2026);

function projectScope(user) {
  if (user.role !== "PROJECT_USER") return { clause: "", parameters: [] };
  if (!user.projectId) throw new HttpError(403, "Your account is not assigned to a project.");
  return { clause: " WHERE project_id = ?", parameters: [user.projectId] };
}

export async function getDashboard(request, response) {
  const scope = projectScope(request.user);
  const [submissionRows] = await pool.execute(
    `SELECT COUNT(*) AS totalSubmissions,
       COALESCE(SUM(status = 'PENDING'), 0) AS pending,
       COALESCE(SUM(status = 'UNDER_REVIEW'), 0) AS underReview,
       COALESCE(SUM(status = 'CORRECTION_REQUIRED'), 0) AS correctionRequired,
       COALESCE(SUM(status = 'APPROVED'), 0) AS approved,
       COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN
         CASE WHEN unit = 'MWh' THEN energy_value * 1000 ELSE energy_value END ELSE 0 END), 0) AS totalEnergyConsumption
     FROM submissions${scope.clause}`,
    scope.parameters,
  );
  const [projectRows] = await pool.execute(
    request.user.role === "PROJECT_USER"
      ? "SELECT COUNT(*) AS totalProjects FROM projects WHERE id = ?"
      : "SELECT COUNT(*) AS totalProjects FROM projects",
    request.user.role === "PROJECT_USER" ? [request.user.projectId] : [],
  );
  const [submittedRows] = await pool.execute(
    `SELECT COUNT(DISTINCT project_id) AS projectsSubmitted
     FROM submissions WHERE reporting_year = ?${request.user.role === "PROJECT_USER" ? " AND project_id = ?" : ""}`,
    request.user.role === "PROJECT_USER" ? [reportingYear, request.user.projectId] : [reportingYear],
  );

  const stats = submissionRows[0];
  const totalProjects = Number(projectRows[0].totalProjects);
  const projectsSubmitted = Number(submittedRows[0].projectsSubmitted);
  response.json({
    success: true,
    reportingYear,
    totalProjects,
    projectsSubmitted,
    reportingCoveragePercent: totalProjects ? Math.round((projectsSubmitted / totalProjects) * 100) : 0,
    totalSubmissions: Number(stats.totalSubmissions),
    pending: Number(stats.pending),
    underReview: Number(stats.underReview),
    correctionRequired: Number(stats.correctionRequired),
    approved: Number(stats.approved),
    totalEnergyConsumption: Number(stats.totalEnergyConsumption),
    unit: "kWh",
  });
}

export async function getConsolidation(_request, response) {
  const [rows] = await pool.execute(
    `SELECT p.id AS projectId, p.name AS projectName,
       SUM(CASE WHEN s.unit = 'MWh' THEN s.energy_value * 1000 ELSE s.energy_value END) AS energyValue
     FROM submissions s
     JOIN projects p ON p.id = s.project_id
     WHERE s.status = 'APPROVED' AND s.reporting_year = ?
     GROUP BY p.id, p.name
     ORDER BY p.name ASC`,
    [reportingYear],
  );
  const projects = rows.map((row) => ({
    project: { id: row.projectId, name: row.projectName },
    projectId: row.projectId,
    projectName: row.projectName,
    energyValue: Number(row.energyValue),
    unit: "kWh",
  }));
  const totalEnergyConsumption = projects.reduce((total, project) => total + project.energyValue, 0);

  response.json({
    success: true,
    reportingYear,
    totalEnergyConsumption,
    totalEnergy: totalEnergyConsumption,
    unit: "kWh",
    projects,
  });
}

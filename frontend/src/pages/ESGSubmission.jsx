import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import MockDataNotice from "../components/MockDataNotice.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createSubmission, getAvailableProjects, getSubmissionById, updateSubmission } from "../services/esgApi.js";
import { ENERGY_UNITS, STATUSES } from "../utils/constants.js";

export default function ESGSubmission() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const assignedProjects = getAvailableProjects(user?.projectId);
  const projectChoices = assignedProjects.length
    ? assignedProjects
    : user?.projectId
      ? [{ id: user.projectId, name: `Project ${user.projectId}` }]
      : [];
  const [projectId, setProjectId] = useState(String(projectChoices[0]?.id || ""));
  const [reportingYear, setReportingYear] = useState(String(new Date().getFullYear()));
  const [energyValue, setEnergyValue] = useState("");
  const [unit, setUnit] = useState(ENERGY_UNITS[0]);
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setProjectId(String(projectChoices[0]?.id || ""));
      return undefined;
    }

    let isCurrent = true;
    async function loadForEdit() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getSubmissionById(id);
        const submission = response.data?.submission || response.data;
        if (!isCurrent) return;
        if (!submission) throw new Error("Submission not found.");
        if (submission.status !== STATUSES.CORRECTION_REQUIRED) {
          throw new Error("Only submissions requiring correction can be edited.");
        }
        setExistingSubmission(submission);
        setProjectId(String(submission.project?.id || ""));
        setReportingYear(String(submission.reportingYear || ""));
        setEnergyValue(String(submission.energyValue ?? ""));
        setUnit(submission.unit || ENERGY_UNITS[0]);
        setDescription(submission.description || "");
        setIsMock(response.isMock);
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    loadForEdit();
    return () => { isCurrent = false; };
  }, [id, retryKey]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    const selectedProject = projectChoices.find((project) => String(project.id) === projectId)
      || existingSubmission?.project;
    const values = {
      project: selectedProject,
      reportingYear: Number(reportingYear),
      category: "ENVIRONMENTAL",
      subCategory: "ENERGY",
      energyValue: Number(energyValue),
      unit,
      description: description.trim(),
      evidence: evidence || existingSubmission?.evidence || null,
    };

    try {
      const response = id
        ? await updateSubmission(id, values)
        : await createSubmission(values, user);
      const saved = response.data?.submission || response.data;
      setIsMock(response.isMock);
      setSuccess({ id: saved?.id || id, status: saved?.status || STATUSES.PENDING });
      if (id) setExistingSubmission(saved || existingSubmission);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <Loading message="Loading submission..." />;
  if (error && id && !existingSubmission) {
    return <ErrorMessage message={error} onRetry={() => setRetryKey((key) => key + 1)} />;
  }

  return (
    <section className="page-content form-page">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">ENVIRONMENTAL · ENERGY</p>
          <h1>{id ? "Edit ESG Submission" : "Submit ESG Data"}</h1>
          <p>Report project electricity consumption for one reporting year.</p>
        </div>
      </div>
      {isMock && <MockDataNotice />}
      {error && <p className="inline-error" role="alert">{error}</p>}
      {success && (
        <div className="success-message" role="status">
          <span>Submission saved with status</span>
          <StatusBadge status={success.status} />
          {success.id && <Link className="table-link" to={`/submissions/${success.id}`}>View submission</Link>}
        </div>
      )}
      <form className="workflow-form" onSubmit={handleSubmit}>
        <div className="form-section-heading">
          <h2>Submission Information</h2>
          <p>All fields marked with * are required.</p>
        </div>
        <div className="form-grid">
          <label className="field-group" htmlFor="project">
            <span>Project <b>*</b></span>
            <select
              disabled={projectChoices.length === 1}
              id="project"
              onChange={(event) => setProjectId(event.target.value)}
              required
              value={projectId}
            >
              <option value="" disabled>Select project</option>
              {projectChoices.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label className="field-group" htmlFor="reporting-year">
            <span>Reporting Year <b>*</b></span>
            <input id="reporting-year" max="2100" min="2000" onChange={(event) => setReportingYear(event.target.value)} required type="number" value={reportingYear} />
          </label>
          <label className="field-group" htmlFor="energy-value">
            <span>Electricity / Energy Value <b>*</b></span>
            <input id="energy-value" min="0" onChange={(event) => setEnergyValue(event.target.value)} required step="any" type="number" value={energyValue} />
          </label>
          <label className="field-group" htmlFor="unit">
            <span>Unit <b>*</b></span>
            <select id="unit" onChange={(event) => setUnit(event.target.value)} value={unit}>
              {ENERGY_UNITS.map((energyUnit) => <option key={energyUnit} value={energyUnit}>{energyUnit}</option>)}
            </select>
          </label>
          <label className="field-group field-wide" htmlFor="description">
            <span>Description <b>*</b></span>
            <textarea id="description" maxLength="1000" onChange={(event) => setDescription(event.target.value)} required rows="4" value={description} />
          </label>
          <label className="field-group field-wide" htmlFor="evidence">
            <span>Evidence / Supporting Document</span>
            {existingSubmission?.evidence?.fileName && <small>Current file: {existingSubmission.evidence.fileName}</small>}
            <input accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv" id="evidence" onChange={(event) => setEvidence(event.target.files?.[0] || null)} type="file" />
          </label>
        </div>
        <div className="form-actions">
          <button className="button button-primary" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : id ? "Save Changes" : "Submit ESG Data"}
          </button>
          <button className="button button-secondary" onClick={() => navigate(-1)} type="button">Cancel</button>
        </div>
      </form>
    </section>
  );
}
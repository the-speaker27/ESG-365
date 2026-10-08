import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import MockDataNotice from "../components/MockDataNotice.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import SubmissionTable from "../components/SubmissionTable.jsx";
import { getAssetUrl } from "../services/api.js";
import { approveSubmission, getSubmissionById, getSubmissions, reviewSubmission } from "../services/esgApi.js";
import { STATUSES } from "../utils/constants.js";

export default function ReviewApproval() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [reviewComment, setReviewComment] = useState("");
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    async function loadReviewData() {
      setIsLoading(true);
      setError("");
      try {
        if (id) {
          const response = await getSubmissionById(id);
          if (!isCurrent) return;
          const item = response.data?.submission || response.data || null;
          setSubmission(item);
          setReviewComment(item?.reviewComment || "");
          setIsMock(response.isMock);
        } else {
          const response = await getSubmissions();
          if (!isCurrent) return;
          const data = Array.isArray(response.data) ? response.data : response.data?.submissions || [];
          setSubmissions(data);
          setIsMock(response.isMock);
        }
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    loadReviewData();
    return () => { isCurrent = false; };
  }, [id, retryKey]);

  async function handleDecision(action) {
    setError("");
    setMessage("");
    setIsSaving(true);
    try {
      const response = action === "approve"
        ? await approveSubmission(id)
        : await reviewSubmission(id, reviewComment.trim());
      const updated = response.data?.submission || response.data;
      if (updated?.status) {
        setSubmission((current) => ({ ...current, ...updated }));
        setIsMock(response.isMock);
      } else {
        const refreshed = await getSubmissionById(id);
        setSubmission(refreshed.data?.submission || refreshed.data || submission);
        setIsMock(response.isMock || refreshed.isMock);
      }
      setMessage(action === "approve" ? "Approval response received." : "Correction request sent.");
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <Loading message={id ? "Loading submission for review..." : "Loading review queue..."} />;
  if (error && (!id || !submission)) return <ErrorMessage message={error} onRetry={() => setRetryKey((key) => key + 1)} />;

  if (!id) {
    const columns = [
      { key: "id", label: "Submission ID", render: (row) => `#${row.id}` },
      { key: "project", label: "Project", render: (row) => row.project?.name },
      { key: "reportingYear", label: "Reporting Year" },
      { key: "energyValue", label: "Energy Value", render: (row) => `${Number(row.energyValue).toLocaleString()} ${row.unit || ""}` },
      { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
      { key: "action", label: "Action", render: (row) => <Link className="table-link" to={`/review-approval/${row.id}`}>Review</Link> },
    ];
    return (
      <section className="page-content">
        <div className="page-heading">
          <div><p className="page-eyebrow">REVIEW WORKFLOW</p><h1>Review / Approval</h1><p>Open a submission to inspect evidence and record a decision.</p></div>
        </div>
        {isMock && <MockDataNotice />}
        <section className="content-section"><SubmissionTable columns={columns} rows={submissions} emptyMessage="No submissions are available for review." /></section>
      </section>
    );
  }

  if (!submission) return <div className="empty-state">Submission not found.</div>;
  const evidenceUrl = getAssetUrl(submission.evidence?.fileUrl);

  return (
    <section className="page-content">
      <div className="page-heading page-heading-split">
        <div><p className="page-eyebrow">SUBMISSION #{submission.id}</p><h1>Review / Approval</h1><p>{submission.project?.name} · Reporting year {submission.reportingYear}</p></div>
        <StatusBadge status={submission.status} />
      </div>
      {isMock && <MockDataNotice />}
      {error && <p className="inline-error" role="alert">{error}</p>}
      {message && <p className="success-message" role="status">{message}</p>}
      <div className="review-layout">
        <section className="detail-panel">
          <h2>Submitted Energy Data</h2>
          <dl className="detail-list">
            <div><dt>Project</dt><dd>{submission.project?.name || "-"}</dd></div>
            <div><dt>Reporting Year</dt><dd>{submission.reportingYear || "-"}</dd></div>
            <div><dt>Category / Subcategory</dt><dd>{submission.category} / {submission.subCategory}</dd></div>
            <div><dt>Energy Value</dt><dd>{Number(submission.energyValue).toLocaleString()} {submission.unit}</dd></div>
            <div className="detail-wide"><dt>Description</dt><dd>{submission.description || "-"}</dd></div>
            <div className="detail-wide"><dt>Evidence</dt><dd>{submission.evidence?.fileName || "No document attached."} {evidenceUrl && <a className="table-link" href={evidenceUrl} rel="noreferrer" target="_blank">View / download</a>}</dd></div>
          </dl>
        </section>
        <section className="detail-panel review-panel">
          <h2>Review Decision</h2>
          <label className="field-group" htmlFor="review-comment">
            <span>Review Comment</span>
            <textarea id="review-comment" maxLength="1000" onChange={(event) => setReviewComment(event.target.value)} placeholder="Add a comment for the submitter" rows="6" value={reviewComment} />
          </label>
          {submission.status === STATUSES.APPROVED ? (
            <p className="muted-copy">This submission has been approved.</p>
          ) : (
            <div className="form-actions review-actions">
              <button className="button button-primary" disabled={isSaving} onClick={() => handleDecision("approve")} type="button">{isSaving ? "Sending..." : "Approve"}</button>
              <button className="button button-secondary" disabled={isSaving || !reviewComment.trim()} onClick={() => handleDecision("correction")} type="button">Request Correction</button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
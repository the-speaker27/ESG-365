import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import MockDataNotice from "../components/MockDataNotice.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getAssetUrl } from "../services/api.js";
import { getSubmissionById } from "../services/esgApi.js";
import { STATUSES } from "../utils/constants.js";

export default function SubmissionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    async function loadSubmission() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getSubmissionById(id);
        if (!isCurrent) return;
        setSubmission(response.data?.submission || response.data || null);
        setIsMock(response.isMock);
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    loadSubmission();
    return () => { isCurrent = false; };
  }, [id, retryKey]);

  if (isLoading) return <Loading message="Loading submission details..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => setRetryKey((key) => key + 1)} />;
  if (!submission) return <div className="empty-state">Submission not found.</div>;

  const canEdit = user?.role === "PROJECT_USER" && submission.status === STATUSES.CORRECTION_REQUIRED;
  const evidenceUrl = getAssetUrl(submission.evidence?.fileUrl);

  return (
    <section className="page-content">
      <div className="page-heading page-heading-split">
        <div>
          <p className="page-eyebrow">SUBMISSION #{submission.id}</p>
          <h1>Submission Details</h1>
          <p>{submission.project?.name} · Reporting year {submission.reportingYear}</p>
        </div>
        <div className="heading-actions">
          {canEdit && <Link className="button button-primary" to={`/esg-submission/${submission.id}/edit`}>Edit Submission</Link>}
          {user?.role === "REVIEWER" && <Link className="button button-primary" to={`/review-approval/${submission.id}`}>Review Submission</Link>}
        </div>
      </div>
      {isMock && <MockDataNotice />}
      <div className="details-grid">
        <section className="detail-panel">
          <h2>Submission Information</h2>
          <dl className="detail-list">
            <div><dt>Project</dt><dd>{submission.project?.name || "-"}</dd></div>
            <div><dt>Reporting Year</dt><dd>{submission.reportingYear || "-"}</dd></div>
            <div><dt>Category</dt><dd>{submission.category || "-"}</dd></div>
            <div><dt>Subcategory</dt><dd>{submission.subCategory || "-"}</dd></div>
            <div><dt>Submitted By</dt><dd>{submission.submittedBy?.name || "-"}</dd></div>
          </dl>
        </section>
        <section className="detail-panel">
          <h2>Energy Data</h2>
          <dl className="detail-list">
            <div><dt>Energy Value</dt><dd>{submission.energyValue == null ? "-" : Number(submission.energyValue).toLocaleString()}</dd></div>
            <div><dt>Unit</dt><dd>{submission.unit || "-"}</dd></div>
            <div className="detail-wide"><dt>Description</dt><dd>{submission.description || "-"}</dd></div>
          </dl>
        </section>
        <section className="detail-panel">
          <h2>Evidence</h2>
          {submission.evidence?.fileName ? (
            <p className="evidence-file">
              <span>{submission.evidence.fileName}</span>
              {evidenceUrl && <a className="table-link" href={evidenceUrl} rel="noreferrer" target="_blank">View / download</a>}
            </p>
          ) : <p className="muted-copy">No supporting document attached.</p>}
        </section>
        <section className="detail-panel">
          <h2>Review</h2>
          <dl className="detail-list">
            <div><dt>Status</dt><dd><StatusBadge status={submission.status} /></dd></div>
            <div className="detail-wide"><dt>Review Comment</dt><dd>{submission.reviewComment || "No review comment."}</dd></div>
          </dl>
        </section>
      </div>
    </section>
  );
}
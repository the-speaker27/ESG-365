import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import MockDataNotice from "../components/MockDataNotice.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import SubmissionTable from "../components/SubmissionTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getSubmissions } from "../services/esgApi.js";

function formatDate(value) {
	return value ? new Date(value).toLocaleDateString() : "-";
}

export default function MySubmissions() {
  const { user } = useAuth();
  const isReviewer = user?.role === "REVIEWER";
  const [submissions, setSubmissions] = useState([]);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    async function loadSubmissions() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getSubmissions();
        if (!isCurrent) return;
        const data = Array.isArray(response.data) ? response.data : response.data?.submissions || [];
        const visible = isReviewer ? data : data.filter((item) => item.submittedBy?.id === user?.id);
        setSubmissions(visible);
        setIsMock(response.isMock);
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    loadSubmissions();
    return () => { isCurrent = false; };
  }, [isReviewer, retryKey, user?.id]);

  if (isLoading) return <Loading message="Loading submissions..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => setRetryKey((key) => key + 1)} />;

  const columns = [
    { key: "id", label: "Submission ID", render: (row) => `#${row.id}` },
    { key: "project", label: "Project", render: (row) => row.project?.name },
    { key: "reportingYear", label: "Reporting Year" },
    { key: "energyValue", label: "Energy Value", render: (row) => Number(row.energyValue).toLocaleString() },
    { key: "unit", label: "Unit" },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    ...(!isReviewer ? [{ key: "createdAt", label: "Submitted Date", render: (row) => formatDate(row.createdAt) }] : []),
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div className="table-actions">
          <Link className="table-link" to={`/submissions/${row.id}`}>Details</Link>
          {isReviewer && <Link className="table-link" to={`/review-approval/${row.id}`}>Review</Link>}
        </div>
      ),
    },
  ];

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">{isReviewer ? "REVIEW QUEUE" : "PROJECT REPORTING"}</p>
          <h1>{isReviewer ? "Submissions" : "My Submissions"}</h1>
          <p>{isReviewer ? "Review submitted energy data and open a record to take action." : "Track status and details for your submitted energy data."}</p>
        </div>
      </div>
      {isMock && <MockDataNotice />}
      <section className="content-section">
        <SubmissionTable
          columns={columns}
          rows={submissions}
          emptyMessage={isReviewer ? "No submissions are waiting for review." : "No submissions found. Submit energy data to get started."}
          emptyAction={!isReviewer ? { label: "Submit ESG Data", to: "/esg-submission" } : undefined}
        />
      </section>
    </section>
  );
}
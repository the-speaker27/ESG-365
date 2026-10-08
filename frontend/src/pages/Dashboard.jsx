import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import MockDataNotice from "../components/MockDataNotice.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import SubmissionTable from "../components/SubmissionTable.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboard } from "../services/dashboardApi.js";
import { getSubmissions } from "../services/esgApi.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    async function loadDashboard() {
      setIsLoading(true);
      setError("");
      try {
        const [dashboardResponse, submissionsResponse] = await Promise.all([
          getDashboard(),
          getSubmissions(),
        ]);
        if (!isCurrent) return;
        const submissionData = submissionsResponse.data;
        setDashboard(dashboardResponse.data || {});
        setSubmissions(Array.isArray(submissionData) ? submissionData : submissionData?.submissions || []);
        setIsMock(dashboardResponse.isMock || submissionsResponse.isMock);
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    loadDashboard();
    return () => { isCurrent = false; };
  }, [retryKey]);

  if (isLoading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => setRetryKey((key) => key + 1)} />;

  const cards = [
    { label: "Total Projects", value: dashboard?.totalProjects },
    { label: "Total Submissions", value: dashboard?.totalSubmissions },
    { label: "Pending", value: dashboard?.pending },
    { label: "Under Review", value: dashboard?.underReview },
    { label: "Correction Required", value: dashboard?.correctionRequired },
    { label: "Approved", value: dashboard?.approved },
  ];
  const columns = [
    { key: "id", label: "Submission ID", render: (row) => `#${row.id}` },
    { key: "project", label: "Project", render: (row) => row.project?.name },
    { key: "reportingYear", label: "Reporting Year" },
    { key: "energyValue", label: "Energy Value", render: (row) => Number(row.energyValue).toLocaleString() },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "action", label: "Action", render: (row) => <Link className="table-link" to={`/submissions/${row.id}`}>View</Link> },
  ];

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">Reporting year {dashboard?.reportingYear || new Date().getFullYear()}</p>
          <h1>{user?.role === "ADMIN" ? "Organization Dashboard" : "Reviewer Dashboard"}</h1>
          <p>ESG reporting activity across MEIL projects.</p>
        </div>
      </div>
      {isMock && <MockDataNotice />}
      <div className="summary-grid">
        {cards.map((card) => <SummaryCard key={card.label} {...card} />)}
      </div>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <h2>Recent submissions</h2>
            <p>Latest energy and electricity reporting activity.</p>
          </div>
        </div>
        <SubmissionTable columns={columns} rows={submissions.slice(0, 6)} emptyMessage="No submissions found." />
      </section>
    </section>
  );
}
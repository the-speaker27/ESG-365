import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import MockDataNotice from "../components/MockDataNotice.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import SubmissionTable from "../components/SubmissionTable.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import TrendChart from "../components/TrendChart.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboard } from "../services/dashboardApi.js";
import { DEMO_ACTION_ITEMS, DEMO_CALENDAR, DEMO_ENERGY_SERIES, DEMO_MONTHLY_ENERGY, DEMO_RECENT_ACTIVITY, DEMO_REPORTING_PROGRESS } from "../services/demoData.js";
import { getAvailableProjects, getSubmissions } from "../services/esgApi.js";

export default function ProjectDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  useEffect(() => {
    let isCurrent = true;
    async function loadProjectDashboard() {
      setIsLoading(true);
      setError("");
      try {
        const [dashboardResponse, submissionsResponse] = await Promise.all([getDashboard(), getSubmissions()]);
        if (!isCurrent) return;
        const allSubmissions = Array.isArray(submissionsResponse.data) ? submissionsResponse.data : submissionsResponse.data?.submissions || [];
        setDashboard(dashboardResponse.data || {});
        setSubmissions(allSubmissions.filter((submission) => submission.submittedBy?.id === user?.id));
        setIsMock(dashboardResponse.isMock || submissionsResponse.isMock);
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    loadProjectDashboard();
    return () => { isCurrent = false; };
  }, [retryKey, user?.id]);

  const project = getAvailableProjects(user?.projectId)[0];
  const years = [...new Set(submissions.map((submission) => String(submission.reportingYear)))].sort().reverse();
  const visibleSubmissions = useMemo(() => submissions.filter((submission) => {
    const matchesSearch = `${submission.id} ${submission.project?.name || ""} ${submission.description || ""}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (statusFilter === "ALL" || submission.status === statusFilter) && (yearFilter === "ALL" || String(submission.reportingYear) === yearFilter);
  }), [search, statusFilter, submissions, yearFilter]);

  if (isLoading) return <Loading message="Loading your project dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => setRetryKey((key) => key + 1)} />;

  const projectEnergySeries = DEMO_ENERGY_SERIES[2026][user?.projectId] || DEMO_ENERGY_SERIES[2026].all;
  const monthlySeries = projectEnergySeries.map((value, index) => ({ month: DEMO_MONTHLY_ENERGY[index].month, value }));
  const monthIndex = Math.min(new Date().getMonth(), monthlySeries.length - 1);
  const energyCurrent = monthlySeries[monthIndex];
  const energyPrevious = monthlySeries[Math.max(0, monthIndex - 1)];
  const energyChange = energyPrevious?.value ? ((energyCurrent.value - energyPrevious.value) / energyPrevious.value) * 100 : 0;
  const cards = [
    { label: "Total Submissions", value: dashboard?.totalSubmissions, detail: "All reporting periods", icon: "▤", tone: "green" },
    { label: "Pending", value: dashboard?.pending, detail: "Awaiting review", icon: "◷", tone: "amber" },
    { label: "Under Review", value: dashboard?.underReview, detail: "With the reviewer", icon: "◉", tone: "blue" },
    { label: "Correction Required", value: dashboard?.correctionRequired, detail: "Needs your attention", icon: "!", tone: "red" },
    { label: "Approved", value: dashboard?.approved, detail: "Successfully reviewed", icon: "✓", tone: "green" },
  ];
  const columns = [
    { key: "id", label: "Submission", render: (row) => <strong className="table-primary-text">#{row.id}</strong> },
    { key: "reportingYear", label: "Year" },
    { key: "energyValue", label: "Energy Value", render: (row) => `${Number(row.energyValue).toLocaleString()} ${row.unit || ""}` },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "action", label: "Action", render: (row) => <div className="table-actions"><Link className="table-link" to={`/submissions/${row.id}`}>View</Link>{row.status === "CORRECTION_REQUIRED" && <Link className="table-link" to={`/esg-submission/${row.id}/edit`}>Edit / resubmit</Link>}</div> },
  ];

  return (
    <section className="page-content project-dashboard page-enter">
      <div className="page-heading project-welcome">
        <div><p className="page-eyebrow">PROJECT WORKSPACE · FY {dashboard?.reportingYear || new Date().getFullYear()}</p><h1>Welcome, {user?.name || "Project User"}</h1><p className="project-welcome-name">{project?.name || `Project ${user?.projectId || "Workspace"}`}</p><p className="welcome-status">Your ESG reporting is moving forward. Review open actions and keep this period on track.</p></div>
        <div className="heading-actions"><Link className="button button-primary" to="/esg-submission"><span aria-hidden="true">+</span> Submit ESG Data</Link><Link className="button button-secondary" to="/esg-dashboard">View Analytics <span aria-hidden="true">↗</span></Link></div>
      </div>
      {isMock && <MockDataNotice />}
      <div className="summary-grid project-summary-grid project-kpis">{cards.map((card) => <SummaryCard key={card.label} {...card} />)}</div>

      <div className="project-insight-row">
        <section className="content-section progress-panel"><div className="section-heading"><div><p className="page-eyebrow">DEMONSTRATION DATA</p><h2>ESG Reporting Progress</h2><p>Reporting coverage for FY {dashboard?.reportingYear || 2026}</p></div><strong className="progress-number">{DEMO_REPORTING_PROGRESS.percent}<span>%</span></strong></div><div className="coverage-track progress-animated" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow={DEMO_REPORTING_PROGRESS.percent}><span style={{ width: `${DEMO_REPORTING_PROGRESS.percent}%` }} /></div><div className="progress-breakdown"><span><i className="legend-dot dot-green" />{DEMO_REPORTING_PROGRESS.submitted} submitted</span><span><i className="legend-dot dot-approved" />{DEMO_REPORTING_PROGRESS.approved} approved</span><span><i className="legend-dot dot-pending" />{DEMO_REPORTING_PROGRESS.pending} pending</span><span><i className="legend-dot dot-correction" />{DEMO_REPORTING_PROGRESS.correctionRequired} correction</span></div><p className="demo-caption">Illustrative progress figures, separate from the live submission totals above.</p></section>
        <section className="content-section energy-panel"><div className="section-heading"><div><p className="page-eyebrow">DEMONSTRATION DATA</p><h2>Energy Consumption</h2><p>{energyCurrent.month} {dashboard?.reportingYear || 2026} · kWh</p></div><span className="energy-live-value">{energyCurrent.value.toLocaleString()} <small>kWh</small></span></div><div className="energy-comparison"><span>{energyCurrent.month} vs {energyPrevious.month}</span><strong>{energyChange >= 0 ? "+" : ""}{energyChange.toFixed(1)}%</strong><span className="comparison-note">monthly sample comparison</span></div><TrendChart compact highlightIndex={monthIndex} items={monthlySeries} /></section>
      </div>

      <div className="project-two-column">
        <section className="content-section action-panel"><div className="section-heading"><div><p className="page-eyebrow">NEXT STEPS</p><h2>Action Required</h2><p>Items to keep your reporting on track.</p></div><span className="section-count">{DEMO_ACTION_ITEMS.length}</span></div><div className="action-list">{DEMO_ACTION_ITEMS.map((item) => <article className="action-item" key={item.id}><span className={`action-icon action-icon-${item.status.toLowerCase().replaceAll("_", "-")}`} aria-hidden="true">{item.icon}</span><div className="action-copy"><strong>{item.title}</strong><p>{item.description}</p><StatusBadge status={item.status} /></div><Link className="action-link" to={item.href}>{item.action} <span aria-hidden="true">→</span></Link></article>)}</div><p className="demo-caption">Example actions shown for the presentation dataset.</p></section>
        <section className="content-section activity-panel"><div className="section-heading"><div><p className="page-eyebrow">WORKSPACE UPDATES</p><h2>Recent Activity</h2><p>Recent ESG reporting events.</p></div><span className="demo-tag">DEMO</span></div><ol className="activity-timeline">{DEMO_RECENT_ACTIVITY.map((item) => <li className={`activity-entry activity-${item.tone}`} key={item.id}><span className="activity-icon" aria-hidden="true">{item.icon}</span><div><strong>{item.title}</strong><p>{item.detail}</p><time>{item.time}</time></div></li>)}</ol></section>
      </div>

      <section className="content-section calendar-strip"><div className="section-heading"><div><p className="page-eyebrow">FY 2026 · REPORTING CALENDAR</p><h2>Key reporting dates</h2></div><span className="demo-tag">DEMONSTRATION</span></div><div className="calendar-items">{DEMO_CALENDAR.map((item, index) => <div className="calendar-item" key={item.period}><span className="calendar-step">0{index + 1}</span><div><strong>{item.period}</strong><span>{item.date}</span></div><span className={`calendar-state state-${item.state.toLowerCase()}`}>{item.state}</span></div>)}</div></section>

      <section className="content-section recent-submissions-panel"><div className="section-heading"><div><p className="page-eyebrow">PROJECT ACTIVITY</p><h2>Recent Submissions</h2><p>Your latest submitted ESG data.</p></div><Link className="table-link" to="/my-submissions">View all submissions →</Link></div><div className="table-filters"><label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search submissions" onChange={(event) => setSearch(event.target.value)} placeholder="Search submissions..." value={search} /></label><label className="filter-control">Status<select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="UNDER_REVIEW">Under review</option><option value="CORRECTION_REQUIRED">Correction required</option><option value="APPROVED">Approved</option></select></label><label className="filter-control">Year<select onChange={(event) => setYearFilter(event.target.value)} value={yearFilter}><option value="ALL">All years</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label></div><SubmissionTable columns={columns} rows={visibleSubmissions} emptyMessage="No ESG submissions match these filters. Clear a filter or submit your first ESG data." /></section>

      <Link className="ai-insight-card" to="/ai-assistant"><span className="ai-insight-symbol" aria-hidden="true">✦</span><span><small>AI INSIGHT · DEMONSTRATION</small><strong>Your project has 1 submission requiring correction and 1 submission awaiting review.</strong></span><span className="ai-insight-link">Ask AI Assistant <i aria-hidden="true">→</i></span></Link>
    </section>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import MockDataNotice from "../components/MockDataNotice.jsx";
import SubmissionTable from "../components/SubmissionTable.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import TrendChart from "../components/TrendChart.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { DEMO_ENERGY_SERIES, DEMO_MONTHLY_ENERGY, DEMO_PROJECT_PERFORMANCE, DEMO_REPORTING_PROGRESS, DEMO_SUBMISSION_SERIES } from "../services/demoData.js";
import { getConsolidation, getDashboard } from "../services/dashboardApi.js";

export default function ESGDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [consolidation, setConsolidation] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [projectFilter, setProjectFilter] = useState("all");
  const [metricFilter, setMetricFilter] = useState("energy");
  const [yearFilter, setYearFilter] = useState("");

  useEffect(() => {
    let isCurrent = true;
    async function loadOverview() {
      setIsLoading(true);
      setError("");
      try {
        const dashboardResponse = await getDashboard();
        const consolidationResponse = user?.role === "ADMIN"
          ? await getConsolidation()
          : { data: null, isMock: false };
        if (!isCurrent) return;
        setDashboard(dashboardResponse.data || {});
        setConsolidation(consolidationResponse.data || {});
        setIsMock(dashboardResponse.isMock || consolidationResponse.isMock);
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    loadOverview();
    return () => { isCurrent = false; };
  }, [retryKey, user?.role]);

  if (isLoading) return <Loading message="Loading ESG reporting overview..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => setRetryKey((key) => key + 1)} />;
  if (!dashboard) return <div className="empty-state">No ESG dashboard data is available.</div>;

  const projectRows = Array.isArray(consolidation) ? consolidation : consolidation?.projects || [];
  const selectedYear = yearFilter || String(dashboard.reportingYear || 2026);
  const demoRows = DEMO_PROJECT_PERFORMANCE.filter((project) => projectFilter === "all" || String(project.id) === projectFilter);
  const projectOptions = isMock ? DEMO_PROJECT_PERFORMANCE : projectRows;
  const visibleProjectRows = isMock ? demoRows : projectRows.filter((row) => projectFilter === "all" || String(row.project?.id || row.projectId) === projectFilter);
  const metricSeries = metricFilter === "energy" ? DEMO_ENERGY_SERIES : DEMO_SUBMISSION_SERIES;
  const metricUnit = metricFilter === "energy" ? "kWh" : "submissions";
  const energySeries = isMock
    ? metricSeries[selectedYear]?.[projectFilter] || metricSeries[selectedYear]?.all || []
    : [];
  const monthlyItems = energySeries.map((value, index) => ({ month: DEMO_MONTHLY_ENERGY[index].month, value }));
  const totalSubmissions = Number(dashboard.totalSubmissions || 0);
  const approvalRate = totalSubmissions ? Math.round((Number(dashboard.approved || 0) / totalSubmissions) * 100) : 0;
  const correctionRate = totalSubmissions ? Math.round((Number(dashboard.correctionRequired || 0) / totalSubmissions) * 100) : 0;
  const cards = [
    { label: "Total Projects", value: dashboard.totalProjects, detail: "In reporting scope", icon: "▦", tone: "green" },
    { label: "Total Submissions", value: dashboard.totalSubmissions, detail: "Across all projects", icon: "▤", tone: "green" },
    { label: "Approved", value: dashboard.approved, detail: "Reviewed and accepted", icon: "✓", tone: "green" },
    { label: "Pending", value: dashboard.pending, detail: "Awaiting review", icon: "◷", tone: "amber" },
    { label: "Correction Required", value: dashboard.correctionRequired, detail: "Needs follow-up", icon: "!", tone: "red" },
    { label: "Reporting Completion", value: `${dashboard.reportingCoveragePercent ?? 0}%`, detail: "Coverage reported by service", icon: "◉", tone: "blue" },
  ];
  const columns = [
    { key: "project", label: "Project", render: (row) => row.project?.name || row.name || row.projectName || "-" },
    { key: "completion", label: "Reporting completion", render: (row) => {
      const completion = row.completion;
      return completion == null ? "Not provided" : <div className="table-progress"><span>{completion}%</span><div className="performance-progress"><span style={{ width: `${completion}%` }} /></div></div>;
    } },
    { key: "submissions", label: "Submissions", render: (row) => row.submissions ?? "-" },
    { key: "approved", label: "Approved", render: (row) => row.approved ?? "-" },
    { key: "energyValue", label: "Energy", render: (row) => `${Number(row.energy ?? row.energyValue ?? 0).toLocaleString()} ${row.unit || "kWh"}` },
  ];

  return (
    <section className="page-content">
      <div className="page-heading page-heading-split"><div><p className="page-eyebrow">ORGANIZATION ANALYTICS · FY {dashboard.reportingYear || "-"}</p><h1>ESG Overview</h1><p>Reporting coverage, submission health, and environmental performance.</p></div><span className="demo-tag">{isMock ? "DEMONSTRATION DATA" : "LIVE API DATA"}</span></div>
      {isMock && <MockDataNotice />}
      <div className="filter-bar overview-filters">
        <label className="filter-control">Reporting year<select onChange={(event) => setYearFilter(event.target.value)} value={selectedYear}><option value={String(dashboard.reportingYear || 2026)}>{dashboard.reportingYear || 2026}</option><option value={String((dashboard.reportingYear || 2026) - 1)}>{(dashboard.reportingYear || 2026) - 1}</option></select></label>
        <label className="filter-control">Project<select onChange={(event) => setProjectFilter(event.target.value)} value={projectFilter}><option value="all">All projects</option>{projectOptions.map((project) => <option key={project.id || project.project?.id} value={project.id || project.project?.id}>{project.name || project.project?.name || project.projectName}</option>)}</select></label>
        <label className="filter-control">Metric<select onChange={(event) => setMetricFilter(event.target.value)} value={metricFilter}><option value="energy">Energy consumption</option><option value="submissions">Submission volume</option></select></label>
      </div>
      <div className="summary-grid analytics-kpis">
        {cards.map((card) => <SummaryCard key={card.label} {...card} />)}
      </div>
      <div className="analytics-feature-grid">
        <section className="content-section overall-status-panel"><div className="section-heading"><div><p className="page-eyebrow">OVERALL REPORTING STATUS</p><h2>Reporting coverage</h2><p>Coverage percentage returned by the dashboard service.</p></div><strong className="progress-number">{dashboard.reportingCoveragePercent ?? "-"}<span>{dashboard.reportingCoveragePercent == null ? "" : "%"}</span></strong></div><div className="coverage-track progress-animated" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow={dashboard.reportingCoveragePercent ?? 0}><span style={{ width: `${dashboard.reportingCoveragePercent ?? 0}%` }} /></div><div className="progress-breakdown"><span>{dashboard.projectsSubmitted ?? "-"} projects submitted</span><span>{dashboard.totalProjects ?? "-"} projects in scope</span></div></section>
        <section className="content-section distribution-panel"><div className="section-heading"><div><p className="page-eyebrow">SUBMISSION STATUS</p><h2>Status distribution</h2><p>Current reporting portfolio</p></div></div><div className="distribution-list">{[{ name: "Approved", value: dashboard.approved || 0, color: "approved" }, { name: "Pending", value: dashboard.pending || 0, color: "pending" }, { name: "Under review", value: dashboard.underReview || 0, color: "review" }, { name: "Correction required", value: dashboard.correctionRequired || 0, color: "correction" }].map((item) => <div className="distribution-row" key={item.name}><span>{item.name}</span><div className="distribution-track"><i className={`distribution-fill fill-${item.color}`} style={{ width: `${totalSubmissions ? (item.value / totalSubmissions) * 100 : 0}%` }} /></div><strong>{item.value}</strong></div>)}</div></section>
      </div>
      <section className="content-section project-performance-section"><div className="section-heading"><div><p className="page-eyebrow">PROJECT PERFORMANCE</p><h2>Reporting by project</h2><p>{isMock ? "Illustrative project completion figures." : "Project records returned by the consolidation service."}</p></div><span className="demo-tag">{isMock ? "DEMO" : "API"}</span></div><SubmissionTable columns={columns} rows={visibleProjectRows} emptyMessage="No project performance data is available." /></section>
      <div className="analytics-feature-grid analytics-bottom-grid">
        <section className="content-section analytics-energy-panel"><div className="section-heading"><div><p className="page-eyebrow">{metricFilter === "energy" ? "ENVIRONMENTAL · ENERGY" : "REPORTING ACTIVITY"}</p><h2>{metricFilter === "energy" ? "Energy Consumption Overview" : "Monthly Submission Volume"}</h2><p>{isMock ? `${selectedYear} monthly demonstration series` : `Monthly ${metricUnit} values are not included in the current API response.`}</p></div><strong className="energy-live-value">{metricFilter === "energy" ? Number(consolidation?.totalEnergyConsumption ?? dashboard.totalEnergyConsumption ?? 0).toLocaleString() : Number(dashboard.totalSubmissions || 0).toLocaleString()} <small>{metricFilter === "energy" ? consolidation?.unit || dashboard.unit || "kWh" : "submissions"}</small></strong></div>{isMock ? <TrendChart items={monthlyItems} highlightIndex={9} unit={metricUnit} /> : <div className="chart-unavailable">Monthly {metricUnit} values are not included in the existing API response.</div>}</section>
        <section className="content-section reporting-health-panel"><div className="section-heading"><div><p className="page-eyebrow">REPORTING HEALTH</p><h2>Workflow health</h2><p>Indicators from reporting totals</p></div></div><div className="health-list"><div><span>Submission completion</span><strong>{dashboard.reportingCoveragePercent ?? 0}%</strong><div className="health-track"><i style={{ width: `${dashboard.reportingCoveragePercent ?? 0}%` }} /></div></div><div><span>Approval rate</span><strong>{approvalRate}%</strong><div className="health-track health-green"><i style={{ width: `${approvalRate}%` }} /></div></div><div><span>Correction rate</span><strong>{correctionRate}%</strong><div className="health-track health-amber"><i style={{ width: `${correctionRate}%` }} /></div><small>{dashboard.pending ?? 0} pending reviews</small></div></div></section>
      </div>
      <div className="analytics-footer-note"><span className="ai-insight-symbol" aria-hidden="true">✦</span><span><strong>AI Insight</strong><p>{DEMO_REPORTING_PROGRESS.correctionRequired} correction request and {DEMO_REPORTING_PROGRESS.pending} submissions awaiting review in the presentation dataset.</p></span><Link className="table-link" to="/ai-assistant">Ask AI Assistant →</Link></div>
    </section>
  );
}
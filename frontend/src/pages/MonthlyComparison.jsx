import { useState } from "react";
import { Link } from "react-router-dom";
import TrendChart from "../components/TrendChart.jsx";
import { DEMO_ENERGY_SERIES, DEMO_PROJECT_PERFORMANCE, DEMO_REPORTING_PROGRESS, DEMO_SUBMISSION_SERIES } from "../services/demoData.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MonthlyComparison() {
  const [year, setYear] = useState("2026");
  const [projectId, setProjectId] = useState("all");
  const [metric, setMetric] = useState("energy");
  const metricSeries = metric === "energy" ? DEMO_ENERGY_SERIES : DEMO_SUBMISSION_SERIES;
  const unit = metric === "energy" ? "kWh" : "submissions";
  const series = metricSeries[year][projectId].map((value, index) => ({ month: MONTHS[index], value }));
  const populated = series.filter((item) => item.value > 0);
  const monthIndex = year === String(new Date().getFullYear())
    ? Math.min(new Date().getMonth(), populated.length - 1)
    : populated.length - 1;
  const current = populated[monthIndex];
  const previous = populated[Math.max(0, monthIndex - 1)];
  const change = previous?.value ? ((current.value - previous.value) / previous.value) * 100 : 0;
  const trendDescription = Math.abs(change) < 0.05 ? "unchanged" : change > 0 ? "higher" : "lower";
  const highest = populated.reduce((best, item) => item.value > best.value ? item : best, populated[0]);
  const lowest = populated.reduce((best, item) => item.value < best.value ? item : best, populated[0]);
  const highlightIndex = series.findIndex((item) => item.month === current?.month);

  return (
    <section className="page-content page-enter">
      <div className="page-heading page-heading-split">
        <div><p className="page-eyebrow">ANALYTICS / ENERGY</p><h1>Monthly Comparison</h1><p>Review monthly energy consumption for the selected reporting scope.</p></div>
        <span className="demo-tag">DEMONSTRATION DATA</span>
      </div>
      <div className="filter-bar">
        <label className="filter-control">Reporting year<select value={year} onChange={(event) => setYear(event.target.value)}><option value="2026">2026</option><option value="2025">2025</option></select></label>
        <label className="filter-control">Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="all">All projects</option>{DEMO_PROJECT_PERFORMANCE.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <label className="filter-control">Metric<select value={metric} onChange={(event) => setMetric(event.target.value)}><option value="energy">Energy consumption</option><option value="submissions">Submission volume</option></select></label>
      </div>
      <section className="content-section comparison-chart-section">
        <div className="section-heading"><div><p className="page-eyebrow">{year} · {unit.toUpperCase()}</p><h2>{metric === "energy" ? "Monthly Energy Consumption" : "Monthly Submission Volume"}</h2><p>{projectId === "all" ? "All projects" : DEMO_PROJECT_PERFORMANCE.find((project) => String(project.id) === projectId)?.name}</p></div></div>
        <TrendChart items={series} highlightIndex={highlightIndex} unit={unit} />
      </section>
      <div className="comparison-metrics">
        <article className="comparison-metric"><span>Current month</span><strong>{current?.value.toLocaleString()} <small>{unit}</small></strong><p>{current?.month} {year}</p></article>
        <article className="comparison-metric"><span>Previous month</span><strong>{previous?.value.toLocaleString()} <small>{unit}</small></strong><p>{previous?.month} {year}</p></article>
        <article className={`comparison-metric ${change >= 0 ? "metric-positive" : "metric-negative"}`}><span>Month-on-month change</span><strong>{change >= 0 ? "+" : ""}{change.toFixed(1)}%</strong><p>Compared with the previous month</p></article>
        <article className="comparison-metric"><span>Highest month</span><strong>{highest?.month}</strong><p>{highest?.value.toLocaleString()} {unit}</p></article>
        <article className="comparison-metric"><span>Lowest month</span><strong>{lowest?.month}</strong><p>{lowest?.value.toLocaleString()} {unit}</p></article>
      </div>
      <section className="content-section comparison-summary">
        <div><p className="page-eyebrow">SUMMARY</p><h2>{metric === "energy" ? "Energy use" : "Submission volume"} is {trendDescription} compared with the prior month</h2><p>{current?.value.toLocaleString()} {unit} in {current?.month}, compared with {previous?.value.toLocaleString()} {unit} in {previous?.month}. Values are static demonstration data and are not a calculated ESG disclosure.</p></div>
        <span className="summary-arrow" aria-hidden="true">↗</span>
      </section>
      <Link className="ai-insight-card" to="/ai-assistant"><span className="ai-insight-symbol" aria-hidden="true">✦</span><span><small>AI INSIGHT · DEMONSTRATION</small><strong>{DEMO_REPORTING_PROGRESS.correctionRequired} correction request and {DEMO_REPORTING_PROGRESS.pending} submissions awaiting review in the sample reporting portfolio.</strong></span><span className="ai-insight-link">Ask AI Assistant <i aria-hidden="true">→</i></span></Link>
    </section>
  );
}

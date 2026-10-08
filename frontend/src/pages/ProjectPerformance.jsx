import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import SummaryCard from "../components/SummaryCard.jsx";
import TrendChart from "../components/TrendChart.jsx";
import { DEMO_ENERGY_SERIES, DEMO_MONTHLY_ENERGY, DEMO_PROJECT_PERFORMANCE } from "../services/demoData.js";

export default function ProjectPerformance() {
  const { projectId } = useParams();
  const [query, setQuery] = useState("");
  const projects = DEMO_PROJECT_PERFORMANCE.filter((project) => project.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selectedProject = DEMO_PROJECT_PERFORMANCE.find((project) => String(project.id) === projectId);

  if (projectId) {
    if (!selectedProject) return <div className="empty-state empty-state-rich"><span className="empty-icon" aria-hidden="true">▦</span><strong>Project not found</strong><Link className="table-link" to="/project-performance">Back to project performance</Link></div>;
    const monthlyItems = DEMO_ENERGY_SERIES[2026][selectedProject.id].map((value, index) => ({ month: DEMO_MONTHLY_ENERGY[index].month, value }));
    return (
      <section className="page-content page-enter">
        <div className="page-heading page-heading-split"><div><p className="page-eyebrow">PROJECT PERFORMANCE / {selectedProject.id}</p><h1>{selectedProject.name}</h1><p>Reporting completion and energy activity · FY 2026</p></div><div className="heading-actions"><span className="demo-tag">DEMONSTRATION DATA</span><Link className="button button-secondary" to="/project-performance">All projects</Link></div></div>
        <section className="project-detail-progress content-section"><div className="section-heading"><div><p className="page-eyebrow">REPORTING COMPLETION</p><h2>Project reporting progress</h2></div><strong className="progress-number">{selectedProject.completion}<span>%</span></strong></div><div className="performance-progress" role="meter" aria-label="Reporting completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={selectedProject.completion}><span style={{ width: `${selectedProject.completion}%` }} /></div></section>
        <div className="summary-grid project-detail-kpis"><SummaryCard icon="▤" label="Submissions" value={selectedProject.submissions} /><SummaryCard icon="✓" label="Approved" tone="green" value={selectedProject.approved} /><SummaryCard icon="◷" label="Pending" tone="amber" value={selectedProject.pending} /><SummaryCard icon="!" label="Correction Required" tone="red" value={selectedProject.correctionRequired} /></div>
        <div className="analytics-feature-grid"><section className="content-section analytics-energy-panel"><div className="section-heading"><div><p className="page-eyebrow">DEMONSTRATION DATA</p><h2>Monthly Energy Consumption</h2><p>Static reporting series · kWh</p></div><strong className="energy-live-value">{selectedProject.energy.toLocaleString()} <small>{selectedProject.unit}</small></strong></div><TrendChart items={monthlyItems} unit="kWh" /></section><section className="content-section"><div className="section-heading"><div><p className="page-eyebrow">RELATED RECORD</p><h2>Submission activity</h2><p>Open the linked sample record for its full status and evidence details.</p></div></div><div className="related-submission"><span className="empty-icon" aria-hidden="true">▤</span><div><strong>Submission #{selectedProject.submissionId}</strong><p>Project energy reporting record</p></div><Link className="table-link" to={`/submissions/${selectedProject.submissionId}`}>View details →</Link></div></section></div>
        <Link className="ai-insight-card" to="/ai-assistant"><span className="ai-insight-symbol" aria-hidden="true">✦</span><span><small>AI INSIGHT · DEMONSTRATION</small><strong>Ask for a plain-language summary of {selectedProject.name}'s reporting status.</strong></span><span className="ai-insight-link">Ask AI Assistant <i aria-hidden="true">→</i></span></Link>
      </section>
    );
  }

  return (
    <section className="page-content page-enter">
      <div className="page-heading page-heading-split">
        <div><p className="page-eyebrow">ANALYTICS / PROJECTS</p><h1>Project Performance</h1><p>Submission coverage and energy reporting by project.</p></div>
        <span className="demo-tag">DEMONSTRATION DATA</span>
      </div>
      <div className="performance-toolbar">
        <label className="search-field performance-search"><span aria-hidden="true">⌕</span><input aria-label="Search projects" onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." value={query} /></label>
        <span className="muted-copy">{projects.length} projects</span>
      </div>
      {projects.length ? (
        <div className="performance-list">
          {projects.map((project, index) => (
            <article className="performance-card" key={project.id} style={{ "--stagger": `${index * 55}ms` }}>
              <div className="performance-card-heading">
                <div><p className="page-eyebrow">PROJECT {String(project.id).padStart(3, "0")}</p><h2><Link to={`/project-performance/${project.id}`}>{project.name}</Link></h2></div>
                <strong className="performance-percent">{project.completion}%</strong>
              </div>
              <div className="performance-progress" role="meter" aria-label={`${project.name} reporting completion`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={project.completion}><span style={{ width: `${project.completion}%` }} /></div>
              <div className="performance-stats">
                <div><span>Submissions</span><strong>{project.submissions}</strong></div>
                <div><span>Approved</span><strong className="text-approved">{project.approved}</strong></div>
                <div><span>Pending</span><strong className="text-pending">{project.pending}</strong></div>
                <div><span>Correction</span><strong className="text-correction">{project.correctionRequired}</strong></div>
                <div><span>Energy</span><strong>{project.energy.toLocaleString()} <small>{project.unit}</small></strong></div>
              </div>
              <Link className="performance-action" to={`/project-performance/${project.id}`}>Open project detail <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state empty-state-rich"><span className="empty-icon" aria-hidden="true">⌕</span><strong>No projects match</strong><span>Try another project name.</span></div>
      )}
      <Link className="ai-insight-card" to="/ai-assistant"><span className="ai-insight-symbol" aria-hidden="true">✦</span><span><small>AI INSIGHT · DEMONSTRATION</small><strong>Ask for a summary of project reporting progress and open items.</strong></span><span className="ai-insight-link">Ask AI Assistant <i aria-hidden="true">→</i></span></Link>
    </section>
  );
}

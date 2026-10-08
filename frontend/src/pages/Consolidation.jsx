import { useEffect, useState } from "react";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import MockDataNotice from "../components/MockDataNotice.jsx";
import SubmissionTable from "../components/SubmissionTable.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import { getConsolidation } from "../services/dashboardApi.js";

export default function Consolidation() {
  const [report, setReport] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    async function loadConsolidation() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getConsolidation();
        if (!isCurrent) return;
        setReport(response.data || null);
        setIsMock(response.isMock);
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    loadConsolidation();
    return () => { isCurrent = false; };
  }, [retryKey]);

  if (isLoading) return <Loading message="Loading consolidated data..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => setRetryKey((key) => key + 1)} />;
  if (!report) return <div className="empty-state">No consolidated data is available.</div>;

  const rows = Array.isArray(report) ? report : report.projects || [];
  const totalEnergy = Array.isArray(report) ? null : report.totalEnergyConsumption;
  const reportingYear = Array.isArray(report) ? null : report.reportingYear;
  const unit = Array.isArray(report) ? rows[0]?.unit : report.unit;
  const columns = [
    { key: "project", label: "Project", render: (row) => row.project?.name || row.projectName || "-" },
    { key: "energyValue", label: "Energy Consumption", render: (row) => Number(row.energyValue).toLocaleString() },
    { key: "unit", label: "Unit" },
  ];

  return (
    <section className="page-content">
      <div className="page-heading"><div><p className="page-eyebrow">ADMINISTRATION</p><h1>Consolidation</h1><p>Organization-level energy data returned by the reporting service.</p></div></div>
      {isMock && <MockDataNotice />}
      <div className="summary-grid summary-grid-compact">
        <SummaryCard label="Reporting Year" value={reportingYear || "-"} />
        <SummaryCard label="Total Energy Consumption" value={totalEnergy == null ? "-" : Number(totalEnergy).toLocaleString()} detail={unit} />
      </div>
      <section className="content-section">
        <div className="section-heading"><div><h2>Project energy data</h2><p>Consolidated values are provided by the backend.</p></div></div>
        <SubmissionTable columns={columns} rows={rows} emptyMessage="No project data is available for this reporting year." />
      </section>
    </section>
  );
}
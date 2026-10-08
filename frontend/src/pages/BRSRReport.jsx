import { useEffect, useState } from "react";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import MockDataNotice from "../components/MockDataNotice.jsx";
import { getAssetUrl } from "../services/api.js";
import { getBRSRReport } from "../services/reportApi.js";

export default function BRSRReport() {
  const [report, setReport] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [downloadMessage, setDownloadMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;
    async function loadReport() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getBRSRReport();
        if (!isCurrent) return;
        setReport(response.data?.report || response.data || null);
        setIsMock(response.isMock);
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    loadReport();
    return () => { isCurrent = false; };
  }, [retryKey]);

  if (isLoading) return <Loading message="Loading BRSR report..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => setRetryKey((key) => key + 1)} />;
  if (!report) return <div className="empty-state">No BRSR report data is available.</div>;

  const energy = report.environmental || {};
  const downloadUrl = getAssetUrl(report.reportUrl);

  return (
    <section className="page-content report-page brsr-report page-enter">
      <div className="page-heading page-heading-split">
        <div><p className="page-eyebrow">REPORTING / STATUTORY DISCLOSURE</p><h1>BRSR Report</h1><p>Business Responsibility and Sustainability Reporting · FY {report.reportingYear || "-"}</p></div>
        <div className="heading-actions">
          <a className="button button-secondary" href="#report-preview"><span aria-hidden="true">◉</span> Preview Report</a>
          {downloadUrl ? <a className="button button-primary" href={downloadUrl} rel="noreferrer" target="_blank"><span aria-hidden="true">↓</span> Download Report</a> : <button className="button button-primary" onClick={() => setDownloadMessage("A report file is not available from the reporting service yet.")} type="button"><span aria-hidden="true">↓</span> Download Report</button>}
        </div>
      </div>
      {isMock && <MockDataNotice />}
      {downloadMessage && <p className="inline-error report-download-message" role="status">{downloadMessage}</p>}
      <article className="brsr-document" id="report-preview">
        <header className="brsr-document-header"><div className="brsr-brand"><span className="brsr-brand-mark">E</span><span><strong>ESG-365</strong><small>ESG / BRSR REPORTING</small></span></div><span className="brsr-document-year">REPORTING YEAR <strong>{report.reportingYear || "-"}</strong></span></header>
        <div className="brsr-document-title"><p className="page-eyebrow">BUSINESS RESPONSIBILITY & SUSTAINABILITY REPORT</p><h2>Environmental Performance</h2><p>Annual sustainability reporting summary</p></div>
        <section className="brsr-executive-summary"><p className="page-eyebrow">EXECUTIVE SUMMARY</p><p>MEIL's reporting workspace records environmental energy information and project submission status for FY {report.reportingYear || "-"}. This preview reflects the information currently supplied by the reporting service.</p></section>
        <div className="brsr-report-grid">
          <section className="brsr-report-block"><span className="report-block-number">01</span><div><p className="page-eyebrow">ENVIRONMENTAL PERFORMANCE</p><h3>Energy Consumption</h3><strong className="brsr-energy-value">{Number(energy.energyConsumption || 0).toLocaleString()} <small>{energy.unit || "kWh"}</small></strong><p>Reported energy consumption for the selected financial year.</p></div></section>
          <section className="brsr-report-block"><span className="report-block-number">02</span><div><p className="page-eyebrow">REPORTING COMPLETION</p><h3>Project Coverage</h3><strong className="brsr-energy-value">{report.projectsSubmitted ?? "-"}<small> / {report.projectsCovered ?? "-"} projects</small></strong><p>Project reporting coverage recorded by the reporting service.</p></div></section>
        </div>
        <section className="brsr-approval"><div><p className="page-eyebrow">APPROVAL STATUS</p><h3>{String(report.reportingStatus || "- ").replaceAll("_", " ")}</h3></div><div className="report-metrics"><div><span>Approved</span><strong>{report.approved ?? "-"}</strong></div><div><span>Pending</span><strong>{report.pending ?? "-"}</strong></div><div><span>Correction required</span><strong>{report.correctionRequired ?? "-"}</strong></div></div></section>
        <footer className="brsr-document-footer"><span>ESG-365</span><span>FY {report.reportingYear || "-"} · Preview</span></footer>
      </article>
    </section>
  );
}
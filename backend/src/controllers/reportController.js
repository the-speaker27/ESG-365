import pool from "../config/db.js";

const reportingYear = Number(process.env.REPORTING_YEAR || 2026);

export async function getBRSRReport(_request, response) {
  const [projectRows] = await pool.execute("SELECT COUNT(*) AS totalProjects FROM projects");
  const [statusRows] = await pool.execute(
    `SELECT COUNT(DISTINCT project_id) AS submittedProjects,
       COUNT(DISTINCT CASE WHEN status = 'APPROVED' THEN project_id END) AS approvedProjects,
       COALESCE(SUM(status = 'APPROVED'), 0) AS approved,
       COALESCE(SUM(status = 'PENDING'), 0) AS pending,
       COALESCE(SUM(status = 'UNDER_REVIEW'), 0) AS underReview,
       COALESCE(SUM(status = 'CORRECTION_REQUIRED'), 0) AS correctionRequired,
       COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN
         CASE WHEN unit = 'MWh' THEN energy_value * 1000 ELSE energy_value END ELSE 0 END), 0) AS energyConsumption
     FROM submissions WHERE reporting_year = ?`,
    [reportingYear],
  );
  const totals = statusRows[0];
  const totalProjects = Number(projectRows[0].totalProjects);
  const submitted = Number(totals.submittedProjects);
  const approved = Number(totals.approved);
  const approvedProjects = Number(totals.approvedProjects);
  const reportingStatus = totalProjects > 0 && approvedProjects >= totalProjects ? "COMPLETE" : "IN_PROGRESS";

  response.json({
    success: true,
    reportingYear,
    environmental: {
      energyConsumption: Number(totals.energyConsumption),
      unit: "kWh",
      energyUnit: "kWh",
    },
    reportingStatus,
    reportingStatusDetails: {
      totalProjects,
      submitted,
      approved,
      approvedProjects,
      pending: Number(totals.pending),
      underReview: Number(totals.underReview),
      correctionRequired: Number(totals.correctionRequired),
    },
    projectsCovered: totalProjects,
    projectsSubmitted: submitted,
    approved,
    pending: Number(totals.pending),
    underReview: Number(totals.underReview),
    correctionRequired: Number(totals.correctionRequired),
    reportUrl: null,
  });
}

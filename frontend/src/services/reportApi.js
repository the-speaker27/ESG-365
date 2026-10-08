import { apiFetchWithMock } from "./api.js";

// MOCK DATA - DEVELOPMENT ONLY
const MOCK_BRSR_REPORT = {
	reportingYear: 2026,
	environmental: { energyConsumption: 299000, unit: "kWh" },
	reportingStatus: "IN_PROGRESS",
	projectsCovered: 12,
	projectsSubmitted: 10,
	approved: 17,
	pending: 7,
	correctionRequired: 4,
	reportUrl: null,
};

// REAL BACKEND INTEGRATION
export function getBRSRReport() {
	return apiFetchWithMock("/reports/brsr", {}, () => ({
		...MOCK_BRSR_REPORT,
		environmental: { ...MOCK_BRSR_REPORT.environmental },
	}));
}
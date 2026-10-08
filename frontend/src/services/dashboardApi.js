import { apiFetchWithMock } from "./api.js";

// MOCK DATA - DEVELOPMENT ONLY
const MOCK_DASHBOARD = {
	reportingYear: 2026,
	totalProjects: 12,
	projectsSubmitted: 10,
	reportingCoveragePercent: 83,
	totalSubmissions: 36,
	pending: 7,
	underReview: 8,
	correctionRequired: 4,
	approved: 17,
	totalEnergyConsumption: 1240000,
	unit: "kWh",
};

// MOCK DATA - DEVELOPMENT ONLY
const MOCK_CONSOLIDATION = {
	reportingYear: 2026,
	totalEnergyConsumption: 299000,
	unit: "kWh",
	projects: [
		{ project: { id: 101, name: "Project Alpha" }, energyValue: 125000, unit: "kWh" },
		{ project: { id: 102, name: "Project Beta" }, energyValue: 98000, unit: "kWh" },
		{ project: { id: 103, name: "Project Gamma" }, energyValue: 76000, unit: "kWh" },
	],
};

// REAL BACKEND INTEGRATION
export function getDashboard() {
	return apiFetchWithMock("/dashboard", {}, () => {
		let role = "";
		try {
			role = JSON.parse(localStorage.getItem("user") || "null")?.role || "";
		} catch {
			role = "";
		}

		if (role === "PROJECT_USER") {
			return {
				...MOCK_DASHBOARD,
				totalProjects: 1,
				totalSubmissions: 3,
				pending: 1,
				underReview: 0,
				correctionRequired: 1,
				approved: 1,
				totalEnergyConsumption: 335500,
			};
		}
		return { ...MOCK_DASHBOARD };
	});
}

export function getConsolidation() {
	return apiFetchWithMock("/consolidation", {}, () => ({
		...MOCK_CONSOLIDATION,
		projects: MOCK_CONSOLIDATION.projects.map((item) => ({ ...item, project: { ...item.project } })),
	}));
}
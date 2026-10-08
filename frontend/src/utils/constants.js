export const ROLES = {
	PROJECT_USER: "PROJECT_USER",
	REVIEWER: "REVIEWER",
	ADMIN: "ADMIN",
};

export const STATUSES = {
	PENDING: "PENDING",
	UNDER_REVIEW: "UNDER_REVIEW",
	CORRECTION_REQUIRED: "CORRECTION_REQUIRED",
	APPROVED: "APPROVED",
};

export const ROLE_HOME_PATH = {
	[ROLES.PROJECT_USER]: "/project-dashboard",
	[ROLES.REVIEWER]: "/dashboard",
	[ROLES.ADMIN]: "/dashboard",
};

export const ROLE_NAVIGATION = {
	[ROLES.PROJECT_USER]: [
		{ section: "OVERVIEW", items: [{ label: "Dashboard", path: "/project-dashboard", icon: "⌂" }] },
		{ section: "ESG MANAGEMENT", items: [
			{ label: "Submit ESG Data", path: "/esg-submission", icon: "+" },
			{ label: "My Submissions", path: "/my-submissions", icon: "▤" },
		] },
		{ section: "ANALYTICS", items: [
			{ label: "ESG Overview", path: "/esg-dashboard", icon: "◉" },
			{ label: "Monthly Comparison", path: "/monthly-comparison", icon: "▥" },
			{ label: "Project Performance", path: "/project-performance", icon: "▦" },
		] },
		{ section: "AI & SUPPORT", items: [
			{ label: "AI ESG Assistant", path: "/ai-assistant", icon: "✦" },
			{ label: "Notifications", path: "/notifications", icon: "◌" },
		] },
	],
	[ROLES.REVIEWER]: [
		{ section: "OVERVIEW", items: [{ label: "Dashboard", path: "/dashboard", icon: "⌂" }] },
		{ section: "ESG MANAGEMENT", items: [
			{ label: "Submissions", path: "/submissions", icon: "▤" },
			{ label: "Review Submissions", path: "/review-approval", icon: "✓" },
		] },
		{ section: "ANALYTICS", items: [{ label: "ESG Overview", path: "/esg-dashboard", icon: "◉" }] },
		{ section: "AI & SUPPORT", items: [
			{ label: "AI ESG Assistant", path: "/ai-assistant", icon: "✦" },
			{ label: "Notifications", path: "/notifications", icon: "◌" },
		] },
	],
	[ROLES.ADMIN]: [
		{ section: "OVERVIEW", items: [{ label: "Dashboard", path: "/dashboard", icon: "⌂" }] },
		{ section: "ANALYTICS", items: [
			{ label: "ESG Overview", path: "/esg-dashboard", icon: "◉" },
			{ label: "Monthly Comparison", path: "/monthly-comparison", icon: "▥" },
			{ label: "Project Performance", path: "/project-performance", icon: "▦" },
		] },
		{ section: "REPORTING", items: [
			{ label: "Consolidation", path: "/consolidation", icon: "▧" },
			{ label: "BRSR Report", path: "/brsr-report", icon: "▤" },
		] },
		{ section: "AI & SUPPORT", items: [
			{ label: "AI ESG Assistant", path: "/ai-assistant", icon: "✦" },
			{ label: "Notifications", path: "/notifications", icon: "◌" },
		] },
	],
};

export const ENERGY_UNITS = ["kWh", "MWh"];
import { STATUSES } from "../utils/constants.js";
import { apiFetchWithMock, USE_MOCK_DATA } from "./api.js";

// MOCK DATA - DEVELOPMENT ONLY
export const MOCK_PROJECTS = [
	{ id: 101, name: "Project Alpha" },
	{ id: 102, name: "Project Beta" },
	{ id: 103, name: "Project Gamma" },
];

// MOCK DATA - DEVELOPMENT ONLY
let mockSubmissions = [
	{
		id: 1001,
		project: { id: 101, name: "Project Alpha" },
		reportingYear: 2026,
		category: "ENVIRONMENTAL",
		subCategory: "ENERGY",
		energyValue: 125000,
		unit: "kWh",
		description: "Annual electricity consumption",
		evidence: { fileName: "energy_bill.pdf", fileUrl: "/uploads/energy_bill.pdf" },
		status: STATUSES.PENDING,
		submittedBy: { id: 1, name: "Project User" },
		reviewComment: null,
		createdAt: "2026-10-07T10:00:00Z",
		updatedAt: "2026-10-07T10:00:00Z",
	},
	{
		id: 1002,
		project: { id: 101, name: "Project Alpha" },
		reportingYear: 2025,
		category: "ENVIRONMENTAL",
		subCategory: "ENERGY",
		energyValue: 117500,
		unit: "kWh",
		description: "Annual electricity consumption",
		evidence: { fileName: "electricity_invoice.pdf", fileUrl: "/uploads/electricity_invoice.pdf" },
		status: STATUSES.CORRECTION_REQUIRED,
		submittedBy: { id: 1, name: "Project User" },
		reviewComment: "Please attach the complete annual bill.",
		createdAt: "2026-08-14T09:30:00Z",
		updatedAt: "2026-08-18T12:00:00Z",
	},
	{
		id: 1003,
		project: { id: 102, name: "Project Beta" },
		reportingYear: 2026,
		category: "ENVIRONMENTAL",
		subCategory: "ENERGY",
		energyValue: 98000,
		unit: "kWh",
		description: "Facility electricity usage for the reporting year",
		evidence: { fileName: "beta_energy_statement.pdf", fileUrl: "/uploads/beta_energy_statement.pdf" },
		status: STATUSES.UNDER_REVIEW,
		submittedBy: { id: 12, name: "Amit Kumar" },
		reviewComment: null,
		createdAt: "2026-10-05T08:15:00Z",
		updatedAt: "2026-10-06T11:00:00Z",
	},
	{
		id: 1004,
		project: { id: 103, name: "Project Gamma" },
		reportingYear: 2026,
		category: "ENVIRONMENTAL",
		subCategory: "ENERGY",
		energyValue: 76000,
		unit: "kWh",
		description: "Site electricity consumption",
		evidence: { fileName: "gamma_power_bill.pdf", fileUrl: "/uploads/gamma_power_bill.pdf" },
		status: STATUSES.APPROVED,
		submittedBy: { id: 13, name: "Priya Das" },
		reviewComment: "Evidence verified.",
		createdAt: "2026-09-21T13:00:00Z",
		updatedAt: "2026-09-25T10:20:00Z",
	},
	{
		id: 1005,
		project: { id: 101, name: "Project Alpha" },
		reportingYear: 2025,
		category: "ENVIRONMENTAL",
		subCategory: "ENERGY",
		energyValue: 93000,
		unit: "kWh",
		description: "Annual electricity consumption",
		evidence: { fileName: "beta_2025_bill.pdf", fileUrl: "/uploads/beta_2025_bill.pdf" },
		status: STATUSES.APPROVED,
		submittedBy: { id: 1, name: "Project User" },
		reviewComment: "Approved.",
		createdAt: "2025-12-18T10:20:00Z",
		updatedAt: "2026-01-04T09:00:00Z",
	},
];

function copy(value) {
	return JSON.parse(JSON.stringify(value));
}

function toFormData(values) {
	const body = new FormData();
	const projectField = "project"; // Change to "projectId" if confirmed by the backend contract.
	body.append(projectField, String(values.project?.id ?? values.project ?? ""));
	body.append("reportingYear", String(values.reportingYear));
	body.append("category", values.category);
	body.append("subCategory", values.subCategory);
	body.append("energyValue", String(values.energyValue));
	body.append("unit", values.unit);
	body.append("description", values.description);
	if (typeof Blob !== "undefined" && values.evidence instanceof Blob) {
		body.append("evidence", values.evidence);
	}
	return body;
}

export function getAvailableProjects(projectId) {
	const projects = projectId ? MOCK_PROJECTS.filter((project) => project.id === projectId) : MOCK_PROJECTS;
	return USE_MOCK_DATA ? copy(projects) : [];
}

// REAL BACKEND INTEGRATION
export function getSubmissions() {
	return apiFetchWithMock("/esg/submissions", {}, () => copy(mockSubmissions));
}

export function getSubmissionById(id) {
	return apiFetchWithMock(`/esg/submissions/${id}`, {}, () => {
		return copy(mockSubmissions.find((submission) => String(submission.id) === String(id)) || null);
	});
}

export function createSubmission(values, user) {
	return apiFetchWithMock("/esg/submissions", {
		method: "POST",
		body: toFormData(values),
	}, () => {
		const now = new Date().toISOString();
		const evidence = typeof Blob !== "undefined" && values.evidence instanceof Blob
			? { fileName: values.evidence.name, fileUrl: `/mock-uploads/${encodeURIComponent(values.evidence.name)}` }
			: values.evidence || null;
		const submission = {
			id: Math.max(...mockSubmissions.map((item) => item.id)) + 1,
			project: copy(values.project),
			reportingYear: Number(values.reportingYear),
			category: values.category,
			subCategory: values.subCategory,
			energyValue: Number(values.energyValue),
			unit: values.unit,
			description: values.description,
		evidence,
			status: STATUSES.PENDING,
			submittedBy: { id: user?.id, name: user?.name },
			reviewComment: null,
			createdAt: now,
			updatedAt: now,
		};
		mockSubmissions = [submission, ...mockSubmissions];
		return copy(submission);
	});
}

export function updateSubmission(id, values) {
	return apiFetchWithMock(`/esg/submissions/${id}`, {
		method: "PUT",
		body: toFormData(values),
	}, () => {
		const index = mockSubmissions.findIndex((item) => String(item.id) === String(id));
		if (index < 0) return null;
		const current = mockSubmissions[index];
		const next = {
			...current,
			project: copy(values.project),
			reportingYear: Number(values.reportingYear),
			category: values.category,
			subCategory: values.subCategory,
			energyValue: Number(values.energyValue),
			unit: values.unit,
			description: values.description,
			evidence: typeof Blob !== "undefined" && values.evidence instanceof Blob
				? { fileName: values.evidence.name, fileUrl: `/mock-uploads/${encodeURIComponent(values.evidence.name)}` }
				: current.evidence,
			status: STATUSES.PENDING,
			reviewComment: null,
			updatedAt: new Date().toISOString(),
		};
		mockSubmissions[index] = next;
		return copy(next);
	});
}

export function reviewSubmission(id, reviewComment) {
	return apiFetchWithMock(`/esg/submissions/${id}/review`, {
		method: "PUT",
		body: JSON.stringify({ reviewComment, status: STATUSES.CORRECTION_REQUIRED }),
	}, () => {
		const submission = mockSubmissions.find((item) => String(item.id) === String(id));
		if (!submission) return null;
		Object.assign(submission, { reviewComment, status: STATUSES.CORRECTION_REQUIRED, updatedAt: new Date().toISOString() });
		return copy(submission);
	});
}

export function approveSubmission(id) {
	return apiFetchWithMock(`/esg/submissions/${id}/approve`, {
		method: "PUT",
		body: JSON.stringify({}),
	}, () => {
		const submission = mockSubmissions.find((item) => String(item.id) === String(id));
		if (!submission) return null;
		Object.assign(submission, { status: STATUSES.APPROVED, updatedAt: new Date().toISOString() });
		return copy(submission);
	});
}
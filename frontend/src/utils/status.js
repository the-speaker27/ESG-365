import { STATUSES } from "./constants.js";

export const STATUS_LABELS = {
	[STATUSES.PENDING]: "Pending",
	[STATUSES.UNDER_REVIEW]: "Under review",
	[STATUSES.CORRECTION_REQUIRED]: "Correction required",
	[STATUSES.APPROVED]: "Approved",
};

export function getStatusLabel(status) {
	return STATUS_LABELS[status] || status || "Unknown";
}
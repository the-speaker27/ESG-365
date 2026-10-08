const API_BASE_URL = import.meta.env.VITE_API_URL;
export const USE_MOCK_DATA = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === "true";

class BackendUnavailableError extends Error {}

export function getAssetUrl(fileUrl) {
	if (!fileUrl) return "";
	try {
		return new URL(fileUrl, API_BASE_URL).href;
	} catch {
		return fileUrl;
	}
}

// REAL BACKEND INTEGRATION
export async function apiFetch(path, options = {}) {
	if (!API_BASE_URL) {
		throw new BackendUnavailableError("Backend URL is not configured. Set VITE_API_URL in the frontend environment.");
	}

	const url = `${API_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
	const headers = new Headers(options.headers);
	const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
	if (options.body && !isFormData && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const token = localStorage.getItem("token");
	if (token && !headers.has("Authorization")) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	let response;

	try {
		response = await fetch(url, {
			...options,
			headers,
		});
	} catch {
		throw new BackendUnavailableError("Unable to connect to the backend. Please make sure the API server is running.");
	}

	const responseText = response.status === 204 ? "" : await response.text();
	let data = null;
	if (responseText) {
		try {
			data = JSON.parse(responseText);
		} catch {
			data = responseText;
		}
	}

	if (!response.ok) {
		const detail = typeof data === "string"
			? data.trim()
			: data?.message || data?.error?.message || data?.error;
		throw new Error(detail || `Request failed with status ${response.status}.`);
	}

	return data;
}

// MOCK DATA - DEVELOPMENT ONLY
export async function apiFetchWithMock(path, options, getMockData) {
	try {
		return { data: await apiFetch(path, options), isMock: false };
	} catch (error) {
		if (USE_MOCK_DATA && getMockData && error instanceof BackendUnavailableError) {
			return { data: getMockData(), isMock: true };
		}
		throw error;
	}
}
import { apiFetch, USE_MOCK_DATA } from "./api.js";

// MOCK DATA - DEVELOPMENT ONLY
export const MOCK_USERS = USE_MOCK_DATA
	? [
			{
				id: 1,
				name: "Project User",
				email: "project@example.com",
				role: "PROJECT_USER",
				projectId: 101,
			},
			{ id: 2, name: "ESG Reviewer", email: "reviewer@example.com", role: "REVIEWER" },
			{ id: 3, name: "MEIL Admin", email: "admin@example.com", role: "ADMIN" },
		]
	: [];

export function login(email, password) {
	// REAL BACKEND INTEGRATION
	return apiFetch("/auth/login", {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});
}

export function loginWithMockUser(role) {
	if (!USE_MOCK_DATA) {
		throw new Error("Demo accounts require VITE_USE_MOCK_DATA=true in development.");
	}

	const user = MOCK_USERS.find((mockUser) => mockUser.role === role);
	if (!user) {
		throw new Error("Choose a valid development demo account.");
	}

	return Promise.resolve({ token: `demo-only-${user.role}`, user: { ...user } });
}
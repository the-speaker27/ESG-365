import { createContext, useContext, useState } from "react";
import { login as requestLogin, loginWithMockUser as requestMockLogin } from "../services/authApi.js";

const AuthContext = createContext(null);

function readStoredAuth() {
	try {
		const token = localStorage.getItem("token");
		const user = JSON.parse(localStorage.getItem("user") || "null");
		return token && user ? { token, user } : { token: null, user: null };
	} catch {
		return { token: null, user: null };
	}
}

export function AuthProvider({ children }) {
	const [auth, setAuth] = useState(readStoredAuth);

	function saveAuth(result) {
		if (!result?.token || !result?.user) {
			throw new Error("The server returned an incomplete login response.");
		}

		localStorage.setItem("token", result.token);
		localStorage.setItem("user", JSON.stringify(result.user));
		setAuth({ token: result.token, user: result.user });
		return result.user;
	}

	async function login(email, password) {
		const result = await requestLogin(email, password);
		return saveAuth(result);
	}

	async function loginWithMockUser(role) {
		return saveAuth(await requestMockLogin(role));
	}

	function logout() {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setAuth({ token: null, user: null });
	}

	return (
		<AuthContext.Provider
			value={{
				token: auth.token,
				user: auth.user,
				isAuthenticated: Boolean(auth.token && auth.user),
				login,
				loginWithMockUser,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside an AuthProvider.");
	}
	return context;
}

export default AuthProvider;
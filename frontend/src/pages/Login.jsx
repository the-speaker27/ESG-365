import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { USE_MOCK_DATA } from "../services/api.js";
import { MOCK_USERS } from "../services/authApi.js";
import { ROLE_HOME_PATH } from "../utils/constants.js";

export default function Login() {
  const { user, login, loginWithMockUser, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const authenticatedUser = await login(email.trim(), password);
      navigate(ROLE_HOME_PATH[authenticatedUser.role] || "/", { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDemoLogin(role) {
    setError("");
    setIsLoading(true);
    try {
      const demoUser = await loginWithMockUser(role);
      navigate(ROLE_HOME_PATH[demoUser.role] || "/", { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Unable to open this demo account.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="ESG-365 sign in">
        <aside className="login-brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="brand-eyebrow">ESG-365</p>
          <h1>ESG / BRSR Reporting Software</h1>
          <div className="brand-rule" />
          <p className="brand-caption">Secure reporting workspace</p>
        </aside>

        <section className="login-panel">
          {user ? (
            <div className="auth-complete" role="status">
              <p className="form-eyebrow">Signed in</p>
              <h2>Welcome, {user.name || user.email}</h2>
              <p className="auth-role">{user.role}</p>
              <button className="login-button secondary-button" onClick={logout} type="button">
                Sign out
              </button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <p className="form-eyebrow">Account access</p>
                <h2>Sign in</h2>
                <p>Enter your work account details to continue.</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="email">Email address</label>
                <input
                  autoComplete="username"
                  id="email"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={email}
                />

                <label htmlFor="password">Password</label>
                <input
                  autoComplete="current-password"
                  id="password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={password}
                />

                {error && (
                  <p className="login-error" role="alert">
                    {error}
                  </p>
                )}

                <button className="login-button" disabled={isLoading} type="submit">
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </form>
              <p className="login-footnote">Authorized users only</p>
              {USE_MOCK_DATA && (
                <section className="demo-access" aria-label="Development demo accounts">
                  <p>Demo accounts <span>Development only</span></p>
                  <div className="demo-account-list">
                    {MOCK_USERS.map((mockUser) => (
                      <button
                        disabled={isLoading}
                        key={mockUser.role}
                        onClick={() => handleDemoLogin(mockUser.role)}
                        type="button"
                      >
                        {mockUser.role.replaceAll("_", " ")}
                      </button>
                    ))}
                  </div>
                  <small>Uses local mock identity; it does not call the backend.</small>
                </section>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  );
}
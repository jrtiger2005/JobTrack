
import { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Invalid email or password.");
      }

      localStorage.setItem("token", data.token);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <div className="brand-logo">
          <span className="brand-icon">J</span>
          <span>JobTrack</span>
        </div>

        <div className="brand-content">
          <span className="brand-tag">YOUR CAREER, ORGANIZED</span>
          <h1>Turn your job search into your success story.</h1>
          <p>
            Track applications, manage interviews, and stay
            organized throughout your career journey.
          </p>

          <div className="brand-features">
            <div>✓ Manage all your applications</div>
            <div>✓ Track interview progress</div>
            <div>✓ Stay focused on your goals</div>
          </div>
        </div>

        <p className="brand-footer">
          © 2026 JobTrack. Build your future.
        </p>
      </div>

      <div className="login-form-panel">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="mobile-brand">
            <span className="brand-icon">J</span>
            <span>JobTrack</span>
          </div>

          <span className="form-eyebrow">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p className="form-description">
            Enter your details to access your dashboard.
          </p>

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <div className="password-heading">
            <label htmlFor="password">Password</label>
          </div>

          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <span>→</span>}
          </button>

          <p className="login-security">
            Your career dashboard, all in one place.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

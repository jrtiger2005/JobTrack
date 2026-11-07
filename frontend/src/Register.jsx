
import { useState } from "react";
import "./Login.css";

function Register({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "Registration failed. Please try again."
        );
      }

      alert("Account created successfully! Please log in.");
      onSwitchToLogin();
    } catch (err) {
      setError(err.message);
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
          <span className="brand-tag">START YOUR JOURNEY</span>
          <h1>Your next opportunity starts here.</h1>
          <p>
            Create your account and take control of
            your job search.
          </p>
        </div>

        <p className="brand-footer">
          © 2026 JobTrack. Build your future.
        </p>
      </div>

      <div className="login-form-panel">
        <form className="login-form" onSubmit={handleRegister}>
          <span className="form-eyebrow">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="form-description">
            Join JobTrack and organize your career journey.
          </p>

          <label>Full name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="login-security">
            Already have an account?{" "}
            <button
              type="button"
              className="password-toggle"
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;

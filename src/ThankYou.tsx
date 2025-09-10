// src/ThankYou.tsx
import { Link } from "react-router-dom";
import "./App.css";
import logo from "./assets/logo.svg";

export default function ThankYou() {
  // ✅ Simulation mode flag: controlled entirely by Vercel env var
  const isDryRun =
    (import.meta.env.VITE_EMAIL_DRY_RUN || "false").toLowerCase() === "true";

  return (
    <div className="thankyou-wrapper">
      <div className="thankyou-card">
        {/* Logo */}
        <img
          src={logo}
          alt="Gallagher Art School logo"
          className="thankyou-logo"
        />

        <h1>🎉 Thank You!</h1>
        <p>
          Your signup was successful. We’ll be in touch soon with Gallagher Art
          School class options.
        </p>

        {/* Show notice ONLY when in dry-run mode */}
        {isDryRun && (
          <p className="notice-info">
            ⚠️ Emails are currently being <strong>simulated</strong> (Postmark
            not live yet). You will not receive an actual email.
          </p>
        )}

        <Link to="/" className="thankyou-link">
          <button className="thankyou-button">Back to Home</button>
        </Link>
      </div>
    </div>
  );
}
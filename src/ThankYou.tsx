// src/ThankYou.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import logo from "./assets/logo.svg";

export default function ThankYou() {
  useEffect(() => {
    document.title = "Thank you • Gallagher Art School";
    // Optional: GA4 conversion event (only if gtag is installed)
    window.gtag?.("event", "signup_success", { method: "form" });
  }, []);

  return (
    <div className="thankyou-wrapper">
      <div className="thankyou-card" role="status" aria-live="polite">
        <img src={logo} alt="Gallagher Art School logo" className="thankyou-logo" />
        <h1>🎉 Thank You!</h1>
        <p>
          Your signup was successful. We’ll be in touch soon with Gallagher Art
          School class options.
        </p>
        <Link to="/" className="thankyou-button thankyou-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
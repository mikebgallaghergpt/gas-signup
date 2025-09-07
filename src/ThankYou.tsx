// src/ThankYou.tsx
import { Link } from "react-router-dom";
import "./App.css";
import logo from "./assets/logo.svg"; // <-- use the same SVG logo

export default function ThankYou() {
  return (
    <div className="thankyou-wrapper">
      <div className="thankyou-card">
        {/* Logo at the top */}
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

        <Link to="/" className="thankyou-link">
          <button className="thankyou-button">Back to Home</button>
        </Link>
      </div>
    </div>
  );
}
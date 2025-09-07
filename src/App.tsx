// src/App.tsx
import { useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { useNavigate, Routes, Route } from "react-router-dom";
import "./App.css";
import ThankYou from "./ThankYou";
import logo from "./assets/logo.svg"; // <-- use your SVG logo here

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
};

function SignupForm() {
  const [data, setData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!data.first_name || !data.last_name || !data.email) {
        throw new Error("Please fill in first name, last name, and email.");
      }

      const { error } = await supabase.from("signups").insert({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || null,
      });

      if (error) throw error;

      // ✅ Redirect to Thank You page
      navigate("/thank-you");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      {/* Logo at the top */}
      <img
        src={logo}
        alt="Gallagher Art School logo"
        className="thankyou-logo"
      />

      <h1>Join Gallagher Art School</h1>
      <p>Tell us about yourself and we’ll reach out with class options.</p>

      {errorMsg && (
        <div className="notice notice-error" role="alert" aria-live="assertive">
          {errorMsg}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="first_name">First Name *</label>
          <input
            id="first_name"
            name="first_name"
            value={data.first_name}
            onChange={onChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="last_name">Last Name *</label>
          <input
            id="last_name"
            name="last_name"
            value={data.last_name}
            onChange={onChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            name="email"
            value={data.email}
            onChange={onChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            value={data.phone}
            onChange={onChange}
            placeholder="(555) 123-4567"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SignupForm />} />
      <Route path="/thank-you" element={<ThankYou />} />
    </Routes>
  );
}
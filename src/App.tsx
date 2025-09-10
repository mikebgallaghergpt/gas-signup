// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import "./App.css";
import logo from "./assets/logo.svg";

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  interests: string[];     // new
  availability: string;    // new
  notes?: string;          // new
};

const ALL_INTERESTS = [
  "Drawing",
  "Oil Painting",
  "Watercolor",
  "Sculpture",
  "Kids Classes",
  "Adult Classes",
];

const STEPS = ["Contact", "Interests", "Availability"];

export default function App() {
  // --------- INIT
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [data, setData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    interests: [],
    availability: "",
    notes: "",
  });

  // Log email mode (SIMULATION vs LIVE)
  useEffect(() => {
    const isDry =
      (import.meta.env.VITE_EMAIL_DRY_RUN || "false").toLowerCase() === "true";
    console.log(
      isDry
        ? "📧 Email mode: SIMULATION (Postmark OFF)"
        : "📧 Email mode: LIVE (Postmark ON)"
    );
  }, []);

  // --------- HELPERS
  const canNext = useMemo(() => {
    if (step === 0) {
      return !!(data.first_name && data.last_name && data.email);
    }
    if (step === 1) {
      return data.interests.length > 0;
    }
    if (step === 2) {
      return data.availability.trim().length > 0;
    }
    return true;
  }, [step, data]);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
  }

  function toggleInterest(i: string) {
    setData((d) =>
      d.interests.includes(i)
        ? { ...d, interests: d.interests.filter((x) => x !== i) }
        : { ...d, interests: [...d.interests, i] }
    );
  }

  async function onSubmitFinal() {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      // Save to Supabase
      const { error } = await supabase.from("signups").insert({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || null,
        interests: data.interests,
        availability: data.availability.trim(),
        notes: data.notes?.trim() || null,
      });
      if (error) throw error;

      // Fire email (API handles DRY_RUN)
      try {
        const r = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: data.email,
            subject: "Welcome to Gallagher Art School 🎨",
            text: `Hi ${data.first_name},

Thanks for signing up! You selected: ${data.interests.join(", ") || "—"}.
Availability: ${data.availability || "—"}

We’ll contact you soon with class options.

– Gallagher Art School`,
          }),
        });
        if (!r.ok) {
          const jj = await r.json().catch(() => null);
          console.warn("[send-email] non-200", r.status, jj);
        }
      } catch (mailErr) {
        console.warn("[send-email] threw", mailErr);
      }

      setSuccessMsg(
        "Thanks! You’re on the list. We’ll reach out shortly with class options."
      );
      // Reset to step 0, keep the UX on the success message
      setData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        interests: [],
        availability: "",
        notes: "",
      });
      setStep(0);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // --------- UI
  return (
    <div className="container">
      <img src={logo} alt="Gallagher Art School logo" className="thankyou-logo" />
      <h1>Join Gallagher Art School</h1>
      <p>Tell us about yourself and we’ll reach out with class options.</p>

      {/* Notices */}
      {successMsg && (
        <div className="notice notice-success" role="status" aria-live="polite">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="notice notice-error" role="alert" aria-live="assertive">
          {errorMsg}
        </div>
      )}
      {(import.meta.env.VITE_EMAIL_DRY_RUN || "false").toLowerCase() === "true" && (
        <div className="notice-info">
          ⚠️ Email sending is <b>simulated</b> until Postmark is approved.
        </div>
      )}

      {/* Progress */}
      <ol className="steps" aria-label="Signup progress">
        {STEPS.map((label, idx) => (
          <li key={label} className={idx === step ? "active" : idx < step ? "done" : ""}>
            <span className="step-index">{idx + 1}</span>
            <span className="step-label">{label}</span>
          </li>
        ))}
      </ol>

      {/* Step content */}
      <div className="card">
        {step === 0 && (
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="visually-hidden">Contact</h2>
            <div className="field">
              <label htmlFor="first_name">First Name *</label>
              <input id="first_name" name="first_name" value={data.first_name} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="last_name">Last Name *</label>
              <input id="last_name" name="last_name" value={data.last_name} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" value={data.email} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={data.phone} onChange={onChange} placeholder="(555) 123-4567" />
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="interests-heading">
            <h2 id="interests-heading" className="visually-hidden">Interests</h2>
            <div className="checkbox-grid">
              {ALL_INTERESTS.map((i) => (
                <label key={i} className="checkbox">
                  <input
                    type="checkbox"
                    checked={data.interests.includes(i)}
                    onChange={() => toggleInterest(i)}
                  />
                  <span>{i}</span>
                </label>
              ))}
            </div>
            <div className="field">
              <label htmlFor="notes">Notes (optional)</label>
              <textarea id="notes" name="notes" value={data.notes} onChange={onChange} rows={3} />
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="availability-heading">
            <h2 id="availability-heading" className="visually-hidden">Availability</h2>
            <div className="field">
              <label htmlFor="availability">When are you available? *</label>
              <input
                id="availability"
                name="availability"
                value={data.availability}
                onChange={onChange}
                placeholder="e.g., Weeknights after 6pm, Sat mornings"
                required
              />
            </div>
            <div className="summary">
              <h3>Review</h3>
              <ul>
                <li><b>Name:</b> {data.first_name} {data.last_name}</li>
                <li><b>Email:</b> {data.email}</li>
                {data.phone ? <li><b>Phone:</b> {data.phone}</li> : null}
                <li><b>Interests:</b> {data.interests.join(", ") || "—"}</li>
                <li><b>Availability:</b> {data.availability || "—"}</li>
                {data.notes ? <li><b>Notes:</b> {data.notes}</li> : null}
              </ul>
            </div>
          </section>
        )}

        {/* Nav buttons */}
        <div className="actions">
          {step > 0 && (
            <button type="button" className="btn-secondary" onClick={() => setStep((s) => s - 1)} disabled={loading}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
              disabled={!canNext || loading}
            >
              Next
            </button>
          ) : (
            <button type="button" onClick={onSubmitFinal} disabled={!canNext || loading}>
              {loading ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
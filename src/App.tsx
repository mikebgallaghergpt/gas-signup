// src/App.tsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import "./App.css";
import logo from "./assets/logo.svg";

/* ------------------------- Types ------------------------- */
type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  experience_level: string; // dropdown
};

type Slide = {
  src: string;
  title: string;
  blurb: string;
};

/* --------------------- Carousel Content ------------------ */
/* Uses your files from public/images */
const CAROUSEL: Slide[] = [
  {
    src: "/images/3DDrawing.jpg",
    title: "3D Drawing",
    blurb: "Bring depth and perspective into your sketches.",
  },
  {
    src: "/images/IceCreamCone.webp",
    title: "Still Life",
    blurb: "Learn balance, proportion, and shading with fun objects.",
  },
  {
    src: "/images/Color.webp",
    title: "Color Theory",
    blurb: "Understand how colors interact and create mood.",
  },
  {
    src: "/images/House.webp",
    title: "Pointilism",
    blurb: "Explore Pointilism with dynamic forms.",
  },
  {
    src: "/images/StarryNight.webp",
    title: "Master Studies",
    blurb: "Learn by recreating the techniques of the greats.",
  },
  {
    src: "/images/Year o the Rabbit.webp",
    title: "Master Studies",
    blurb: "Explore Cubism and Abstraction",
  },
];

const EXPERIENCE_OPTIONS = [
  "Beginner",
  "Some experience",
  "Intermediate",
  "Advanced",
];

/* --------------------- Carousel Component ---------------- */
function Carousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // auto-advance every 5s
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % CAROUSEL.length);
    }, 5000) as unknown as number;

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const go = (i: number) =>
    setIndex(((i % CAROUSEL.length) + CAROUSEL.length) % CAROUSEL.length);

  const slide = CAROUSEL[index];

  return (
    <aside className="carousel-pane" aria-label="Art topics carousel">
      <div className="carousel">
        <div className="carousel-viewport">
          {CAROUSEL.map((s, i) => (
            <figure
              key={s.title}
              className={`carousel-slide ${i === index ? "active" : ""}`}
              aria-hidden={i !== index}
            >
              <img src={s.src} alt={s.title} />
              <figcaption>
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="carousel-controls" aria-label="Carousel controls">
          <button
            type="button"
            className="dot-prevnext"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
          >
            ‹
          </button>

          <div className="dots" role="tablist" aria-label="Slides">
            {CAROUSEL.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === index ? "active" : ""}`}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={i === index}
                role="tab"
              />
            ))}
          </div>

          <button
            type="button"
            className="dot-prevnext"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      </div>
    </aside>
  );
}

/* --------------------- Signup Form Component -------------- */
function SignupForm() {
  const [data, setData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    experience_level: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      if (!data.first_name || !data.last_name || !data.email) {
        throw new Error("Please fill in first name, last name, and email.");
      }

      // Save to Supabase
      const { error } = await supabase.from("signups").insert({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || null,
        experience_level: data.experience_level || null,
      });
      if (error) throw error;

      // Fire email (API handles DRY_RUN if you've set EMAIL_DRY_RUN=true in Vercel)
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: data.email,
            subject: "Welcome to Gallagher Art School 🎨",
            text: `Hi ${data.first_name},

Thanks for signing up! We'll contact you soon with class options.

– Gallagher Art School`,
          }),
        });
      } catch (mailErr) {
        console.warn("[send-email] skipped or failed", mailErr);
      }

      setSuccessMsg(
        "Thanks! You’re on the list. We’ll reach out shortly with class options."
      );
      setData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        experience_level: "",
      });
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isDry =
    (import.meta.env.VITE_EMAIL_DRY_RUN || "false").toLowerCase() === "true";

  return (
    <main className="form-pane">
      <img src={logo} alt="Gallagher Art School logo" className="brand-logo" />
      <h1>Join Gallagher Art School</h1>
      <p>Tell us about yourself and we’ll reach out with class options.</p>

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
      {isDry && (
        <div className="notice-info">
          ⚠️ Email sending is <b>simulated</b> until Postmark approves.
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="card">
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

        <div className="field">
          <label htmlFor="experience_level">Art experience level</label>
          <select
            id="experience_level"
            name="experience_level"
            value={data.experience_level}
            onChange={onChange}
          >
            <option value="">Select one…</option>
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Sign Up"}
        </button>
      </form>
    </main>
  );
}

/* ------------------------- App Layout -------------------- */
export default function App() {
  return (
    <div className="shell">
      {/* Left: carousel (desktop), stacks below on small screens */}
      <Carousel />
      {/* Right: signup form */}
      <SignupForm />
    </div>
  );
}
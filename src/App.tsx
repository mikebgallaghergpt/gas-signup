import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import "./styles/global.css";

type Status = "idle" | "loading" | "success" | "error";

export default function App() {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  // simple iframe auto-resize support (safe to keep even when not embedded)
  useEffect(() => {
    const postHeight = () => {
      const h = document.documentElement.scrollHeight;
      window.parent?.postMessage({ type: "gas-resize", height: h }, "*");
    };
    const ro = new ResizeObserver(postHeight);
    ro.observe(document.body);
    window.addEventListener("load", postHeight);
    return () => { ro.disconnect(); window.removeEventListener("load", postHeight); };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return; // double-submit guard
    setStatus("loading");
    setMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      first_name: (fd.get("first_name") || "").toString().trim(),
      last_name: (fd.get("last_name") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      phone: (fd.get("phone") || "").toString().trim(),
      // add more fields here as you design them
    };

    // minimal client validation
    if (!payload.first_name || !payload.last_name) {
      setStatus("error"); setMsg("Please add your first and last name."); return;
    }
    if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
      setStatus("error"); setMsg("Please enter a valid email address."); return;
    }

    try {
      const { error } = await supabase.from("signups").insert([payload]);
      if (error) throw error;

      setStatus("success");
      setMsg("Thanks! We received your info.");
      formRef.current?.reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMsg(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ marginBottom: 8 }}>Join Gallagher Art School</h1>
      <p style={{ marginTop: 0, color: "#666" }}>
        Tell us about yourself and we’ll reach out with class options.
      </p>

      <form ref={formRef} onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor="first_name">First Name *</label>
          <input id="first_name" name="first_name" required />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor="last_name">Last Name *</label>
          <input id="last_name" name="last_name" required />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" placeholder="name@example.com" required />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" placeholder="(555) 123-4567" />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "var(--gas-brand-500, #6D28D9)",
            color: "#fff",
            border: 0,
            cursor: status === "loading" ? "wait" : "pointer"
          }}
          aria-busy={status === "loading"}
        >
          {status === "loading" ? "Submitting…" : "Sign Up"}
        </button>

        {msg && (
          <div
            role={status === "error" ? "alert" : "status"}
            style={{ color: status === "error" ? "#b00020" : "#0a7d29" }}
          >
            {msg}
          </div>
        )}
      </form>
    </main>
  );
}
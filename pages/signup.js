import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { CONFIG } from "../lib/products";

export default function Signup() {
  const router = useRouter();
  const { user } = useAuth();
  const { openDrawer } = useCart();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim(), phone: phone.trim() },
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data?.session) {
      if (router.query.next === "checkout") {
        router.replace("/").then(() => openDrawer("checkout"));
      } else {
        router.replace("/");
      }
    } else {
      // Email confirmation is on for this Supabase project.
      setNotice("Check your inbox to confirm your email, then sign in.");
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div>
          <div className="wordmark" style={{ color: "var(--paper)", marginBottom: 50 }}>
            Field to Family
          </div>
          <p className="quote">
            &ldquo;Farm crates go out before sunrise, so your kitchen never waits on the vegetable
            market.&rdquo;
          </p>
          <div className="quote-by">— how a Field to Family morning works</div>
        </div>
        <div className="badges">
          <span className="abadge">🌱 Direct from local farms</span>
          <span className="abadge">📍 {CONFIG.city} only, for now</span>
          <span className="abadge">💳 Pay on delivery</span>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="sub">Takes under a minute — you&apos;ll use this to order and track deliveries.</p>

          {error && <div className="auth-alert error">{error}</div>}
          {notice && <div className="auth-alert success">{notice}</div>}

          {!notice && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" type="text" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <input id="phone" type="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="password">Password <span className="hint">(at least 6 characters)</span></label>
                <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn-block" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          <div className="auth-switch">
            Already have an account? <Link href={router.query.next ? `/login?next=${router.query.next}` : "/login"}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

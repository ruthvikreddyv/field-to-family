import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { CONFIG } from "../lib/products";

export default function Login() {
  const router = useRouter();
  const { user } = useAuth();
  const { openDrawer } = useCart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (router.query.next === "checkout") {
        router.replace("/").then(() => openDrawer("checkout"));
      } else {
        router.replace("/");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (router.query.next === "checkout") {
      router.replace("/").then(() => openDrawer("checkout"));
    } else {
      router.replace("/");
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
            &ldquo;We used to wonder what would be fresh when it arrived. Now we just wonder what to
            cook with it.&rdquo;
          </p>
          <div className="quote-by">— a family in Gachibowli, ordering since last season</div>
        </div>
        <div className="badges">
          <span className="abadge">🥬 Cut that morning</span>
          <span className="abadge">🚚 Delivered in {CONFIG.city}</span>
          <span className="abadge">🧺 30+ vegetables</span>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="sub">Sign in to order and track your deliveries.</p>

          {error && <div className="auth-alert error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-block" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="auth-switch">
            New to Field to Family? <Link href={router.query.next ? `/signup?next=${router.query.next}` : "/signup"}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

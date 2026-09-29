import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function StaffLogin() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === "admin" || profile.role === "supervisor") {
        router.replace("/admin");
      }
    }
  }, [authLoading, user, profile, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // signInWithPassword never creates an account - if this email/password
    // combination doesn't already exist, it simply fails.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const { data: { user: signedInUser } } = await supabase.auth.getUser();
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", signedInUser.id).single();
    setLoading(false);

    if (!prof || prof.role === "customer") {
      await supabase.auth.signOut();
      setError("This account doesn't have staff access. Ask an admin to add you as staff first.");
      return;
    }
    refreshProfile();
    router.replace("/admin");
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div>
          <div className="wordmark" style={{ color: "var(--paper)", marginBottom: 50 }}>
            Field to Family
          </div>
          <p className="quote">Staff sign in</p>
          <div className="quote-by">For Admins and Supervisors only.</div>
        </div>
        <div className="badges">
          <span className="abadge">Products &amp; pricing</span>
          <span className="abadge">Inventory</span>
          <span className="abadge">Orders</span>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Staff sign in</h1>
          <p className="sub">Use the same email and password as your regular account.</p>
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
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { toE164Indian, isValidIndianMobile } from "../../lib/products";

const RESEND_SECONDS = 30;

export default function StaffLogin() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === "admin" || profile.role === "supervisor") {
        router.replace("/admin");
      }
    }
  }, [authLoading, user, profile, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function sendCode(e) {
    e?.preventDefault();
    setError("");
    if (!isValidIndianMobile(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setLoading(true);
    // shouldCreateUser: false - staff accounts must already exist and be
    // promoted by an existing admin. This login never creates a new account.
    const { error } = await supabase.auth.signInWithOtp({
      phone: toE164Indian(phone),
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("not found") || error.status === 400
          ? "No account found with that number. Ask an admin to add you as staff first."
          : error.message
      );
      return;
    }
    setStep("otp");
    setResendIn(RESEND_SECONDS);
  }

  async function verifyCode(e) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code we texted you.");
      return;
    }
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: toE164Indian(phone),
      token: code,
      type: "sms",
    });
    if (verifyError) {
      setLoading(false);
      setError(verifyError.message);
      return;
    }

    // Verified - but only staff accounts belong on this page.
    const { data: { user: signedInUser } } = await supabase.auth.getUser();
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", signedInUser.id).single();
    setLoading(false);

    if (!prof || prof.role === "customer") {
      await supabase.auth.signOut();
      setError("This account doesn't have staff access. Sign in as a regular customer instead, or ask an admin to add you as staff.");
      setStep("phone");
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
          {step === "phone" && (
            <>
              <h1>Staff sign in</h1>
              <p className="sub">Enter the mobile number your account was set up with.</p>
              {error && <div className="auth-alert error">{error}</div>}
              <form onSubmit={sendCode} noValidate>
                <div className="field">
                  <label htmlFor="phone">Mobile number</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", padding: "0 12px", border: "1px solid var(--line)", borderRadius: 10, color: "var(--ink-soft)", fontSize: 14.5 }}>+91</span>
                    <input
                      id="phone" type="tel" inputMode="numeric" maxLength={10}
                      placeholder="98765 43210" value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn-block" disabled={loading}>
                  {loading ? "Sending code…" : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <h1>Enter the code</h1>
              <p className="sub">We texted a 6-digit code to +91 {phone}.</p>
              {error && <div className="auth-alert error">{error}</div>}
              <form onSubmit={verifyCode} noValidate>
                <div className="field">
                  <label htmlFor="code">6-digit code</label>
                  <input
                    id="code" type="text" inputMode="numeric" maxLength={6} autoFocus
                    placeholder="123456" value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    style={{ fontSize: 20, letterSpacing: 4, textAlign: "center" }}
                  />
                </div>
                <button type="submit" className="btn-block" disabled={loading}>
                  {loading ? "Verifying…" : "Verify & continue"}
                </button>
              </form>
              <div className="auth-switch">
                {resendIn > 0 ? <span>Resend code in {resendIn}s</span> : (
                  <button type="button" className="back-link" onClick={sendCode}>Resend code</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

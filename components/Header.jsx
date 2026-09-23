import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const { user, profile } = useAuth();
  const { count, openDrawer } = useCart();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const initial = (profile?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <header className="site">
      <div className="header-row">
        <Link href="/" className="wordmark">
          Field to Family <span className="tag">F2F · Hyderabad</span>
        </Link>
        <nav className="nav-links">
          <Link href="/" className={router.pathname === "/" ? "active" : ""}>Shop</Link>
          {user && (
            <Link href="/orders" className={router.pathname === "/orders" ? "active" : ""}>My orders</Link>
          )}
        </nav>
        <div className="header-right">
          {user ? (
            <>
              <Link href="/account" className="account-chip">
                <span className="avatar">{initial}</span>
                {profile?.full_name ? profile.full_name.split(" ")[0] : "Account"}
              </Link>
              <button type="button" className="btn-outline" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">Sign in</Link>
              <Link href="/signup" className="btn-primary">Sign up</Link>
            </>
          )}
          <button className="basket-btn" onClick={() => openDrawer("cart")} aria-haspopup="dialog">
            <span>Basket</span>
            <span className="count">{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

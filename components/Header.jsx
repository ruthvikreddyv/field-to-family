import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";
import { formatE164ForDisplay } from "../lib/products";
import { BasketIcon } from "./Icons";

export default function Header() {
  const { user, profile } = useAuth();
  const { count, openDrawer } = useCart();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const isStaff = profile?.role === "admin" || profile?.role === "supervisor";
  const initial = (profile?.full_name || formatE164ForDisplay(user?.phone) || "?").trim().charAt(0).toUpperCase();

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
          {isStaff && (
            <Link href="/admin" className={router.pathname.startsWith("/admin") ? "active" : ""}>Admin</Link>
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
            <Link href="/login" className="btn-primary">Sign in</Link>
          )}
          <button className="basket-btn" onClick={() => openDrawer("cart")} aria-haspopup="dialog">
            <BasketIcon size={16} />
            <span>Basket</span>
            <span className="count">{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

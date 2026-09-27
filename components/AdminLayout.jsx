import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const isAdmin = !!profile?.is_admin;

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) router.replace("/");
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return <div className="center-loading">Checking admin access…</div>;
  }

  return (
    <main className="page wrap">
      <div className="page-head" style={{ paddingBottom: 0 }}>
        <h1>Admin</h1>
        <p>Manage products, stock and orders.</p>
      </div>
      <nav className="cats" style={{ position: "static", margin: "18px 0 0", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ padding: "0 0 12px" }}>
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={"cat-pill" + (router.pathname === t.href ? " active" : "")}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
      <div style={{ paddingTop: 20 }}>{children}</div>
    </main>
  );
}

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Signup() {
  const router = useRouter();
  useEffect(() => {
    router.replace(router.query.next ? `/login?next=${router.query.next}` : "/login");
  }, [router]);
  return <div className="center-loading">Redirecting…</div>;
}

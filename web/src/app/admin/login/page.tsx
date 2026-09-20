"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Login failed.");
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#0a0a0c] text-white px-4">
      <form onSubmit={onSubmit} className="w-full max-w-xs space-y-4">
        <h1 className="text-lg font-mono text-center">PortfoliOS Admin</h1>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-sm font-medium py-2 transition-colors"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

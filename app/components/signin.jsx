"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { SIGN_IN } from "../../lib/graphql/mutations";

export default function SignIn({ onSwitch }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [signIn, { loading }] = useMutation(SIGN_IN);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await signIn({
        variables: { email: form.email, password: form.password },
      });
      localStorage.setItem("token", data.signIn.token);
      router.push("/");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to continue learning.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signin-email" className="text-xs font-medium text-slate-400">Email</label>
          <input
            id="signin-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-[#1e2050] bg-[#0d0d1a] px-3.5 py-2.5 text-sm text-white placeholder-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signin-password" className="text-xs font-medium text-slate-400">Password</label>
          <input
            id="signin-password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-[#1e2050] bg-[#0d0d1a] px-3.5 py-2.5 text-sm text-white placeholder-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex justify-end">
          <a href="/forgot-password" className="text-xs text-indigo-400 hover:underline">
            Forgot password?
          </a>
        </div>

        {error && (
          <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3.5 py-2.5 text-xs text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-indigo-500 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In →"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="border-none bg-transparent p-0 text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
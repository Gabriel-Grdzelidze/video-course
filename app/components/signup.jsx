"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { SIGN_UP_USER, SIGN_UP_INSTRUCTOR } from "../../lib/graphql/mutations";
import { uploadToS3 } from "../../lib/s3-upload";

const ROLES = [
  { value: "user", label: "Student", desc: "I want to learn" },
  { value: "instructor", label: "Instructor", desc: "I want to teach" },
];

const scrollbarStyles = `
  .signup-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .signup-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .signup-scroll::-webkit-scrollbar-thumb {
    background: #4f46e5;
    border-radius: 999px;
  }
  .signup-scroll::-webkit-scrollbar-thumb:hover {
    background: #6366f1;
  }
`;

export default function SignUp({ onSwitch }) {
  const router = useRouter();
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    website: "",
    expertise: "",
  });

  const [signUpUser, { loading: loadingUser }] = useMutation(SIGN_UP_USER);
  const [signUpInstructor, { loading: loadingInstructor }] = useMutation(SIGN_UP_INSTRUCTOR);
  const loading = loadingUser || loadingInstructor || isUploading;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = "";
      if (file) {
        imageUrl = await uploadToS3(file);
      }

      if (role === "user") {
        const { data } = await signUpUser({
          variables: { 
            name: form.name, 
            email: form.email, 
            password: form.password,
            avatar: imageUrl 
          },
        });
        localStorage.setItem("token", data.signUpUser.token);
      } else {
        const expertise = form.expertise
          ? form.expertise.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        const { data } = await signUpInstructor({
          variables: {
            name: form.name,
            email: form.email,
            password: form.password,
            avatar: imageUrl,
            bio: form.bio || null,
            website: form.website || null,
            expertise,
          },
        });
        localStorage.setItem("token", data.signUpInstructor.token);
      }
      setSuccess(`Welcome, ${form.name}! Your account was created. Redirecting…`);
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsUploading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#1e2050] bg-[#0d0d1a] px-3.5 py-2.5 text-sm text-white placeholder-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <>
      <style>{scrollbarStyles}</style>

      <div className="signup-scroll flex flex-col h-full overflow-y-auto pr-1">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Join thousands of learners today.</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => { setRole(r.value); setError(""); }}
              className={`flex flex-col items-start rounded-lg border px-3.5 py-3 text-left transition ${
                role === r.value
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-[#1e2050] bg-[#0d0d1a] hover:border-slate-600"
              }`}
            >
              <span className={`text-sm font-semibold ${role === r.value ? "text-indigo-400" : "text-slate-300"}`}>
                {r.label}
              </span>
              <span className="text-xs text-slate-500">{r.desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="Marco Ricci"
              value={form.name}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {role === "instructor" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Bio</label>
                <textarea
                  name="bio"
                  placeholder="Tell students about yourself…"
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#1e2050] bg-[#0d0d1a] px-3.5 py-2.5 text-sm text-white placeholder-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Website</label>
                <input
                  name="website"
                  type="url"
                  placeholder="https://yoursite.com"
                  value={form.website}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">
                  Expertise <span className="text-slate-600">(comma separated)</span>
                </label>
                <input
                  name="expertise"
                  type="text"
                  placeholder="React, Node.js, Design"
                  value={form.expertise}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </>
          )}

         

          <button
            type="submit"
            disabled={loading || !!success}
            className="mt-1 w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-indigo-500 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Uploading Picture..." : loading ? "Creating account…" : `Create ${role === "instructor" ? "Instructor" : "Student"} Account →`}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="border-none bg-transparent p-0 text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  );
}
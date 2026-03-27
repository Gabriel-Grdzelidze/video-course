'use client'
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import Link from "next/link";

// ── queries & mutations ───────────────────────────────────────────────────────
const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMe {
      id
      name
      email
      avatar
      enrolledCourses {
        id
        title
        slug
        thumbnail
        topic
        level
        instructor {
          id
          user { name }
        }
      }
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $avatar: String) {
    updateProfile(name: $name, avatar: $avatar) {
      id name avatar
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`;

const TOPIC_COLORS: Record<string, string> = {
  "Development":  "bg-blue-500/15 text-blue-300",
  "Design":       "bg-pink-500/15 text-pink-300",
  "AI & ML":      "bg-purple-500/15 text-purple-300",
  "Marketing":    "bg-orange-500/15 text-orange-300",
  "Business":     "bg-emerald-500/15 text-emerald-300",
  "Data Science": "bg-cyan-500/15 text-cyan-300",
  "Video":        "bg-red-500/15 text-red-300",
};

// ── component ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<"account" | "password" | "courses">("account");

  // account form
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [accountSaved, setAccountSaved] = useState(false);
  const [accountError, setAccountError] = useState("");

  // password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { data, loading } = useQuery(GET_MY_PROFILE, {
    onCompleted: (d) => {
      setName(d.getMe?.name ?? "");
      setAvatar(d.getMe?.avatar ?? "");
    },
  });

  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE);
  const [changePassword, { loading: changingPw }] = useMutation(CHANGE_PASSWORD);

  const user = data?.getMe;
  const courses = user?.enrolledCourses ?? [];

  const initials = (name || session?.user?.name || "?")
    .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleSaveAccount = async () => {
    setAccountError("");
    try {
      await updateProfile({ variables: { name: name.trim(), avatar: avatar.trim() || null } });
      await update({ name: name.trim() });
      setAccountSaved(true);
      setTimeout(() => setAccountSaved(false), 2500);
    } catch (e: unknown) {
      setAccountError(e instanceof Error ? e.message : "Failed to save");
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords don't match" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    try {
      const { data } = await changePassword({ variables: { currentPassword, newPassword } });
      if (data?.changePassword?.success) {
        setPasswordMsg({ type: "success", text: "Password changed successfully" });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: data?.changePassword?.message ?? "Failed to change password" });
      }
    } catch (e: unknown) {
      setPasswordMsg({ type: "error", text: e instanceof Error ? e.message : "Failed to change password" });
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* ── header banner ── */}
        <div className="relative bg-[#12121a] border border-white/[0.07] rounded-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 80% 50%, #4f46e5 0%, transparent 60%)" }} />
          <div className="relative flex items-center gap-6">
            {/* avatar */}
            <div className="relative shrink-0">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-2xl font-bold border-2 border-indigo-400/30">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">{user?.name ?? session?.user?.name}</h1>
              <p className="text-white/40 text-sm mb-3">{user?.email ?? session?.user?.email}</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-white/40 px-2.5 py-0.5 rounded-full">
                  Student
                </span>
                <span className="text-[11px] text-white/25">
                  {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── tabs ── */}
        <div className="flex border-b border-white/[0.07] mb-8">
          {([
            { key: "account", label: "Account" },
            { key: "password", label: "Password" },
            { key: "courses", label: `My learning · ${courses.length}` },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-5 py-3 -mb-px text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer
                ${activeTab === key ? "border-indigo-500 text-white" : "border-transparent text-white/35 hover:text-white/60"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ══ ACCOUNT TAB ══════════════════════════════════════════════════ */}
        {activeTab === "account" && (
          <div className="max-w-lg flex flex-col gap-5">
            <Field label="Display name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </Field>

            <Field label="Avatar URL">
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
              />
              {avatar && (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatar} alt="preview" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                  <span className="text-[12px] text-white/30">Preview</span>
                </div>
              )}
            </Field>

            <Field label="Email">
              <input
                value={user?.email ?? session?.user?.email ?? ""}
                disabled
                className="bg-[#1a1a26] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white/30 outline-none cursor-not-allowed"
              />
              <p className="text-[11px] text-white/25 mt-1">Email cannot be changed</p>
            </Field>

            {accountError && (
              <p className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{accountError}</p>
            )}

            <button
              onClick={handleSaveAccount}
              disabled={saving}
              className="flex items-center gap-2 w-fit bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              {accountSaved ? (
                <><CheckIcon /> Saved!</>
              ) : saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}

        {/* ══ PASSWORD TAB ═════════════════════════════════════════════════ */}
        {activeTab === "password" && (
          <div className="max-w-lg flex flex-col gap-5">
            <Field label="Current password">
              <PasswordInput
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrent}
                onToggle={() => setShowCurrent((p) => !p)}
                placeholder="Enter current password"
              />
            </Field>

            <Field label="New password">
              <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                show={showNew}
                onToggle={() => setShowNew((p) => !p)}
                placeholder="Min. 6 characters"
              />
            </Field>

            <Field label="Confirm new password">
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showNew}
                onToggle={() => setShowNew((p) => !p)}
                placeholder="Repeat new password"
              />
            </Field>

            {/* strength bar */}
            {newPassword.length > 0 && (
              <PasswordStrength password={newPassword} />
            )}

            {passwordMsg && (
              <p className={`text-[13px] px-4 py-2.5 rounded-xl border ${
                passwordMsg.type === "success"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-red-400 bg-red-500/10 border-red-500/20"
              }`}>
                {passwordMsg.text}
              </p>
            )}

            <button
              onClick={handleChangePassword}
              disabled={changingPw || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 w-fit bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              {changingPw ? "Changing…" : "Change password"}
            </button>
          </div>
        )}

        {/* ══ COURSES TAB ══════════════════════════════════════════════════ */}
        {activeTab === "courses" && (
          <div>
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#12121a] border border-dashed border-white/[0.08] rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                  </svg>
                </div>
                <p className="text-white/50 font-medium mb-1">No courses yet</p>
                <p className="text-white/25 text-sm mb-6">Browse courses and start learning today</p>
                <Link href="/courses"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                  Browse courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((course: EnrolledCourse) => (
                  <Link key={course.id} href={`/learn/${course.slug}`}
                    className="group bg-[#12121a] hover:bg-[#16161f] border border-white/[0.07] rounded-2xl overflow-hidden transition-colors">
                    <div className="aspect-video bg-[#1e1e2e] flex items-center justify-center overflow-hidden">
                      {course.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
                          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                        </svg>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-snug">{course.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TOPIC_COLORS[course.topic] ?? "bg-white/5 text-white/40"}`}>
                          {course.topic}
                        </span>
                        <span className="text-[11px] text-white/25">{course.level}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── types ─────────────────────────────────────────────────────────────────────
interface EnrolledCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  topic: string;
  level: string;
}

// ── password strength ─────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= score ? colors[score] : "bg-white/10"}`} />
        ))}
      </div>
      <p className={`text-[12px] transition-colors ${score <= 1 ? "text-red-400" : score === 2 ? "text-amber-400" : score === 3 ? "text-blue-400" : "text-emerald-400"}`}>
        {labels[score]}
      </p>
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-white/55 tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({ value, onChange, show, onToggle, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
      />
      <button type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer bg-transparent border-none">
        {show ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        )}
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-8 py-10 flex flex-col gap-6 animate-pulse">
        <div className="h-36 bg-[#12121a] rounded-2xl" />
        <div className="h-10 bg-[#12121a] rounded-xl w-64" />
        <div className="flex flex-col gap-4 max-w-lg">
          {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-[#12121a] rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import SignIn from ".././components/signin";
import SignUp from ".././components/signup";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#09090f] px-4">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -left-36 -top-36 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-28 -right-28 h-[420px] w-[420px] rounded-full bg-indigo-600/15 blur-[80px]" />

      {/* Logo */}
      <a href="/" className="relative z-10 mb-6 flex items-center gap-2 text-lg font-bold text-white">
        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
        LearnFlow
      </a>

      {/* Card */}
      <div className="relative z-10 flex w-full max-w-[440px] flex-col rounded-2xl border border-[#1e2050] bg-[#12121f] shadow-[0_0_0_1px_rgba(79,82,211,0.08),0_24px_64px_rgba(0,0,0,0.5)]">

        {/* Tabs — shrink-0 so this never moves no matter what */}
        <div className="shrink-0 px-6 pt-6 pb-4">
          <div className="flex gap-1 rounded-xl border border-[#1e2050] bg-[#0d0d1a] p-1">
            <button
              type="button"
              onClick={() => setIsSignIn(true)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                isSignIn ? "bg-indigo-600 text-white" : "bg-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignIn(false)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                !isSignIn ? "bg-indigo-600 text-white" : "bg-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Content — fixed height, scrolls inside, tabs never move */}
        <div className="h-[480px] overflow-y-auto px-6 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isSignIn
            ? <SignIn onSwitch={() => setIsSignIn(false)} />
            : <SignUp onSwitch={() => setIsSignIn(true)} />
          }
        </div>
      </div>
    </div>
  );
}
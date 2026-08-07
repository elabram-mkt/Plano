"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertCircle, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  // If a session already exists (fresh sign-up with confirmation disabled,
  // or completing a Google OAuth redirect back to this page), leave for
  // the dashboard.
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/calendar");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/calendar");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.replace("/calendar");
      return;
    }

    // Email confirmation is required before a session is issued.
    setCheckEmail(true);
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/signup`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsGoogleSubmitting(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-4">
        <div className="w-full max-w-sm bg-slate-900/40 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <MailCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Check your email</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            We sent a confirmation link to <span className="text-slate-200 font-semibold">{email}</span>. Confirm your
            address, then sign in.
          </p>
          <Link
            href="/login"
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-4">
      <div className="w-full max-w-sm bg-slate-900/40 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Create your Plano account</h1>
            <p className="text-xs text-slate-400 mt-1">Plan, schedule, and analyze your social media.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs py-2.5 transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
          >
            {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSubmitting}
          className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold rounded-xl text-xs py-2.5 transition flex items-center justify-center gap-2.5"
        >
          {isGoogleSubmitting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </button>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

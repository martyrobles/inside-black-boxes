"use client";

import { useActionState } from "react";
import {
  signInWithPassword,
  signUpWithPassword,
} from "@/lib/actions/auth";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [signInState, signInAction, signInPending] = useActionState(
    signInWithPassword,
    {},
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUpWithPassword,
    {},
  );

  return (
    <div className="auth-stack">
      <form action={signInAction} className="auth-card">
        <h2 className="auth-card__title">Sign in</h2>
        <input type="hidden" name="next" value={nextPath} />
        <label className="field">
          <span className="label">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="input"
          />
        </label>
        <label className="field">
          <span className="label">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="input"
          />
        </label>
        {signInState.error ? (
          <p className="banner banner--error" role="alert">
            {signInState.error}
          </p>
        ) : null}
        <button
          type="submit"
          className="btn btn--primary"
          disabled={signInPending}
        >
          {signInPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <form action={signUpAction} className="auth-card auth-card--secondary">
        <h2 className="auth-card__title">Create account</h2>
        <p className="muted small">
          Single-user private Lab. Create one account for yourself in Supabase
          Auth.
        </p>
        <label className="field">
          <span className="label">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="input"
          />
        </label>
        <label className="field">
          <span className="label">Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
          />
        </label>
        {signUpState.error ? (
          <p className="banner banner--error" role="alert">
            {signUpState.error}
          </p>
        ) : null}
        {signUpState.message ? (
          <p className="banner banner--success" role="status">
            {signUpState.message}
          </p>
        ) : null}
        <button
          type="submit"
          className="btn btn--ghost"
          disabled={signUpPending}
        >
          {signUpPending ? "Creating…" : "Create account"}
        </button>
      </form>
    </div>
  );
}

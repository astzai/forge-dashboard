"use client";

import { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-sm text-stone-300 font-medium mb-1.5">{label}</div>
      {hint && <p className="text-xs text-stone-500 mb-2">{hint}</p>}
      {children}
    </label>
  );
}

const baseInput =
  "w-full bg-stone-900 border border-stone-800 rounded-md px-3.5 py-2.5 text-stone-100 text-base focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 placeholder:text-stone-600 transition-colors";

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input {...props} className={`${baseInput} ${props.className ?? ""}`} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`${baseInput} leading-relaxed ${props.className ?? ""}`}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select {...props} className={`${baseInput} ${props.className ?? ""}`} />
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-sm transition-colors border ${
        active
          ? "bg-orange-500 border-orange-500 text-stone-950 font-medium"
          : "bg-stone-900 border-stone-800 text-stone-300 hover:border-orange-500/50"
      }`}
    >
      {children}
    </button>
  );
}

export function RadioCard({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-md border transition-colors ${
        active
          ? "bg-orange-500/5 border-orange-500"
          : "bg-stone-900/50 border-stone-800 hover:border-orange-500/40"
      }`}
    >
      <div
        className={`text-sm font-medium ${active ? "text-orange-300" : "text-stone-200"}`}
      >
        {title}
      </div>
      {desc && <div className="text-xs text-stone-500 mt-0.5">{desc}</div>}
    </button>
  );
}

export function PrimaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`bg-orange-500 hover:bg-orange-400 text-stone-950 font-medium px-5 py-3 rounded-md text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`border border-stone-800 hover:border-orange-500/60 text-stone-300 px-5 py-3 rounded-md text-sm transition-colors ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

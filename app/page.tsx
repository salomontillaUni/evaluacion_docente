"use client";

import React from "react";
import Login from "./components/auth/Login";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-linear-to-br from-indigo-50 to-blue-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-125 h-125 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 w-125 h-125 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[80px]" />
      </div>

      <Login />

      <div className="absolute bottom-8 left-0 right-0 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Sistema de Evaluación Docente.</p>
      </div>
    </main>
  );
}

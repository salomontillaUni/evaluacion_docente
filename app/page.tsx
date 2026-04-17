"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, Mail, ChevronRight, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROLE_HOME, type UserRole } from "./lib/auth";
import { getAuthClient, getDb } from "./lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError("");
    setIsLoading(true);

    try {
      const auth = await getAuthClient();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener el rol del usuario desde Firestore
      const db = await getDb();
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      
      let role: UserRole = "estudiante";
      let name = user.displayName || user.email?.split('@')[0] || "Usuario";

      if (userDoc.exists()) {
        const userData = userDoc.data();
        role = userData.role as UserRole;
        name = userData.name || name;
      }

      // Guardar en cookies para compatibilidad con el middleware/rutas existentes
      document.cookie = `role=${role}; path=/; max-age=${60 * 60 * 8}; samesite=lax`;
      document.cookie = `user_name=${encodeURIComponent(name)}; path=/; max-age=${60 * 60 * 8}; samesite=lax`;
      
      router.push(ROLE_HOME[role]);
    } catch (err: any) {
      console.error("Error de login:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Credenciales inválidas. Por favor verifica tu correo y contraseña.");
      } else {
        setError("Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-linear-to-br from-indigo-50 to-blue-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-125 h-125 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 w-125 h-125 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800/50 overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <UserCircle2 className="text-white h-10 w-10" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Bienvenido
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Evaluación Docente - Acceso al portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                  Correo institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="usuario@universidad.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Contraseña
                  </label>
                  <a
                    href="#"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full group relative flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-xl font-medium shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 transition-all disabled:opacity-70 disabled:cursor-wait"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 border-t border-slate-100 dark:border-slate-800/50 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ¿No tienes una cuenta?{" "}
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline transition-colors"
              >
                Contacta a soporte
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Sistema de Evaluación Docente.</p>
        </div>
      </motion.div>
    </main>
  );
}

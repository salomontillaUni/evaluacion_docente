"use client";
import { useState, useEffect } from "react";
import { BrainCircuit, GraduationCap, LogOut, ShieldCheck, UserRound, Menu, X } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_HOME, type UserRole } from "@/app/lib/auth";
import { motion, AnimatePresence } from "motion/react";

const navByRole: Record<
  UserRole,
  { to: string; label: string; icon: ComponentType<{ className?: string }>; description: string }[]
> = {
  estudiante: [
    {
      to: "/views/estudiante",
      label: "Estudiante",
      icon: GraduationCap,
      description: "Evaluar docente",
    },
  ],
  docente: [
    {
      to: "/views/docente",
      label: "Docente",
      icon: UserRound,
      description: "Consultar resultados",
    },
  ],
  admin: [
    {
      to: "/views/admin",
      label: "Administrador",
      icon: ShieldCheck,
      description: "Dashboard y gestión",
    },
  ],
};

function getRoleFromCookie(): UserRole | undefined {
  if (typeof document === "undefined") return undefined;
  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("role="))
    ?.split("=")[1];

  if (cookieValue === "admin" || cookieValue === "docente" || cookieValue === "estudiante") {
    return cookieValue;
  }
  return undefined;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const role = getRoleFromCookie();

  if (!mounted || !role || pathname === "/") return null;

  const navItems = navByRole[role];

  const handleLogout = () => {
    document.cookie = "role=; path=/; max-age=0; samesite=lax";
    document.cookie = "user_name=; path=/; max-age=0; samesite=lax";
    router.push("/");
  };

  const sidebarContent = (isMobile: boolean = false) => (
    <>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-foreground font-bold text-base">EvalNLP</h1>
              <p className="text-xs text-muted-foreground font-medium">Evaluación Docente</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs opacity-75">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <button
          type="button"
          onClick={() => {
            router.push(ROLE_HOME[role]);
            if (isMobile) setIsOpen(false);
          }}
          className="w-full px-4 py-2 text-sm rounded-lg bg-muted hover:bg-accent text-foreground transition-colors cursor-pointer font-medium"
        >
          Ir al inicio de mi rol
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent text-foreground transition-colors cursor-pointer font-medium"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Plataforma NLP v1.0 &copy; 2026
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-foreground">EvalNLP</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer (with Backdrop) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-xs z-40"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 flex flex-col shadow-2xl"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card h-screen shrink-0">
        {sidebarContent(false)}
      </aside>
    </>
  );
}

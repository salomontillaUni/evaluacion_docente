"use client";
import { BrainCircuit, GraduationCap, LogOut, ShieldCheck, UserRound, Users } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_HOME, type UserRole } from "@/app/lib/auth";

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
  const role = getRoleFromCookie();

  if (!role || pathname === "/") return null;

  const navItems = navByRole[role];

  const handleLogout = () => {
    document.cookie = "role=; path=/; max-age=0; samesite=lax";
    document.cookie = "user_name=; path=/; max-age=0; samesite=lax";
    router.push("/");
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-foreground">EvalNLP</h1>
            <p className="text-xs text-muted-foreground">Evaluación Docente con IA</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          // For admin dashboard, only highlight when exactly on /views/admin (not subroutes)
          const isActive =
            item.to === "/views/admin"
              ? pathname === "/views/admin"
              : pathname.startsWith(item.to);

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
                <p className="text-sm">{item.label}</p>
                <p className="text-xs opacity-75">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <button
          type="button"
          onClick={() => router.push(ROLE_HOME[role])}
          className="w-full px-4 py-2 text-sm rounded-lg bg-muted hover:bg-accent text-foreground transition-colors"
        >
          Ir al inicio de mi rol
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Plataforma NLP v1.0 &copy; 2026
        </p>
      </div>
    </aside>
  );
}

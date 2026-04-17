"use client";
import {
  BrainCircuit,
  GraduationCap,
  LogOut,
  ShieldCheck,
  UserRound,
  Users,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { type ComponentType, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_HOME, type UserRole } from "@/app/lib/auth";

const navByRole: Record<
  UserRole,
  {
    to: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    description: string;
  }[]
> = {
  estudiante: [
    {
      to: "/views/estudiante",
      label: "Mis Evaluaciones",
      icon: GraduationCap,
      description: "Evaluar docente",
    },
  ],
  docente: [
    {
      to: "/views/docente",
      label: "Mis Resultados",
      icon: UserRound,
      description: "Consultar resultados",
    },
  ],
  admin: [
    {
      to: "/views/admin",
      label: "Dashboard",
      icon: ShieldCheck,
      description: "Vista general",
    },
    {
      to: "/views/admin/personal",
      label: "Gestión de Personal",
      icon: Users,
      description: "Docentes y estudiantes",
    },
  ],
};

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() ?? "");
  return undefined;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; role: UserRole } | null>(null);

  useEffect(() => {
    const role = getCookie("role") as UserRole | undefined;
    const name = getCookie("user_name") || "Usuario";
    if (role) {
      setUserInfo({ name, role });
    } else {
      setUserInfo(null);
    }
  }, [pathname]); // Refresh on navigation

  if (!userInfo || pathname === "/") return null;

  const navItems = navByRole[userInfo.role];

  const handleLogout = () => {
    document.cookie = "role=; path=/; max-age=0; samesite=lax";
    document.cookie = "user_name=; path=/; max-age=0; samesite=lax";
    router.push("/");
  };

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-foreground font-semibold">EvalNLP</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Plataforma IA</p>
          </div>
        </div>
      </div>

      {/* User Session Info */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userInfo.name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{userInfo.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive =
            item.to === "/views/admin"
              ? pathname === "/views/admin"
              : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              href={item.to}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className={`text-[10px] ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button
          type="button"
          onClick={() => {
            router.push(ROLE_HOME[userInfo.role]);
            setIsOpen(false);
          }}
          className="w-full px-4 py-2 text-xs rounded-lg bg-muted hover:bg-accent text-foreground transition-all duration-200"
        >
          Inicio de rol
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs rounded-lg border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
        <p className="text-[10px] text-muted-foreground text-center pt-2">
          v1.0 &copy; 2026 EvalNLP
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-card border border-border shadow-lg text-foreground"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card">
        <NavContent />
      </aside>

      {/* Sidebar Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <NavContent />
      </aside>
    </>
  );
}
"use client";
import { BrainCircuit, GraduationCap, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


const navItems = [
  { to: "/views/estudiante", label: "Estudiante", icon: GraduationCap, description: "Evaluar docente" },
  { to: "/views/docente", label: "Docente", icon: UserRound, description: "Consultar resultados" },
  { to: "/views/admin", label: "Administrador", icon: ShieldCheck, description: "Dashboard y gestión" },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
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
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <div key={item.to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.to === "/estudiante" && location.pathname === "/"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
            <Link
              href={item.to}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm">{item.label}</p>
                <p className="text-xs opacity-75">{item.description}</p>
              </div>
            </Link>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Plataforma NLP v1.0 &copy; 2026
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
     

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-72 h-full bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-foreground">EvalNLP</h1>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-accent">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.to}>
                    <Link
                    key={item.to}
                    href={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        item.to === "/estudiante" && location.pathname === "/"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-sm">{item.label}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </div>
                  </Link>
                  </div>
                  
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    
  );
}

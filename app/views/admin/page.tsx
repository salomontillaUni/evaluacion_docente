"use client";
import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  UserRound,
  ShieldCheck,
  TrendingUp,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { getDb } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    docentes: 0,
    estudiantes: 0,
    evaluaciones: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const db = await getDb();
        const [docentesSnap, estudiantesSnap] = await Promise.all([
          getDocs(collection(db, "docentes")),
          getDocs(collection(db, "estudiantes")),
        ]);
        setStats({
          docentes: docentesSnap.size,
          estudiantes: estudiantesSnap.size,
          evaluaciones: 42, // Mock for now
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Gestión de Personal",
      description: "Administra los docentes y estudiantes registrados en la plataforma.",
      icon: Users,
      color: "bg-indigo-600",
      href: "/views/admin/personal",
    },
    {
      title: "Resultados Globales",
      description: "Consulta el análisis consolidado de todas las evaluaciones.",
      icon: TrendingUp,
      color: "bg-emerald-600",
      href: "#",
    },
    {
      title: "Configuración",
      description: "Ajusta parámetros de la plataforma y periodos académicos.",
      icon: ShieldCheck,
      color: "bg-amber-600",
      href: "#",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground mt-1">Bienvenido al sistema de gestión EvalNLP</p>
        </div>
        <div className="flex items-center gap-3">
           <Link 
            href="/views/admin/personal"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
           >
             <Plus className="w-4 h-4" />
             Nuevo Registro
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Docentes", value: stats.docentes, icon: UserRound, col: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Estudiantes", value: stats.estudiantes, icon: GraduationCap, col: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Evaluaciones", value: stats.evaluaciones, icon: FileText, col: "text-amber-600", bg: "bg-amber-50" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-5"
          >
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-6 h-6 ${s.col}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? "..." : s.value}
              </p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Link 
              href={card.href}
              className="group block h-full bg-card border border-border rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`w-10 h-10 rounded-lg ${card.color} text-white flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <card.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                {card.title}
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>
              
              {/* Subtle background decoration */}
              <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${card.color} opacity-[0.03] rounded-full blur-2xl`} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Activity/Recent (Optional) */}
      <div className="bg-muted/30 border border-border rounded-3xl p-8 text-center">
        <div className="max-w-md mx-auto">
          <ShieldCheck className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Acceso de Administrador</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Tienes todos los privilegios para gestionar la plataforma. Asegúrate de verificar los datos antes de realizar eliminaciones definitivas.
          </p>
        </div>
      </div>
    </div>
  );
}
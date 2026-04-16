"use client";
import { useState, useEffect } from "react";
import {
  BarChart3,
  ChevronDown,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { periodosAcademicos, sentimientosDistribucion } from "../../components/mockData";
import { motion } from "motion/react";
import { getDb } from "@/app/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const getSentimentBadge = (s: string) => {
  switch (s) {
    case "Positivo": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Negativo": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-amber-100 text-amber-800 border-amber-200";
  }
};

const getSentimentEmoji = (s: string) => {
  switch (s) {
    case "Positivo": return "😊";
    case "Negativo": return "😟";
    default: return "😐";
  }
};

interface Comentario {
  id: string;
  comentario: string;
  sentimiento: string;
  resumen: string;
  created_at: { toDate: () => Date } | null;
}

export default function TeacherView() {
  const [selectedPeriodo, setSelectedPeriodo] = useState(periodosAcademicos[0].id);
  const [isPeriodoOpen, setIsPeriodoOpen] = useState(false);
  const [comentariosDocente, setComentariosDocente] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);

  const currentPeriodo = periodosAcademicos.find((p) => p.id === selectedPeriodo);

  useEffect(() => {
    const fetchEvaluaciones = async () => {
      setLoading(true);
      try {
        const db = await getDb();
        const q = query(
          collection(db, "evaluaciones"),
          where("docente_id", "==", selectedPeriodo)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comentario[];
        setComentariosDocente(data);
      } catch (error) {
        console.error("Error cargando evaluaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluaciones();
  }, [selectedPeriodo]);

  const total = comentariosDocente.length;
  const positivos = comentariosDocente.filter((c) => c.sentimiento === "Positivo").length;
  const neutros = comentariosDocente.filter((c) => c.sentimiento === "Neutro").length;
  const negativos = comentariosDocente.filter((c) => c.sentimiento === "Negativo").length;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-foreground">Mis Resultados</h1>
            <p className="text-sm text-muted-foreground">Consulta tus evaluaciones por período</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <button
            type="button"
            onClick={() => setIsPeriodoOpen(!isPeriodoOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card hover:border-emerald-300 transition-all"
          >
            <span className="text-sm text-foreground">{currentPeriodo?.label}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isPeriodoOpen ? "rotate-180" : ""}`} />
          </button>
          {isPeriodoOpen && (
            <div className="absolute z-20 mt-2 w-full bg-card rounded-xl border border-border shadow-xl overflow-hidden">
              {periodosAcademicos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSelectedPeriodo(p.id); setIsPeriodoOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 transition-colors ${selectedPeriodo === p.id ? "bg-emerald-50 text-emerald-700" : "text-foreground"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Comentarios", value: total.toString(), icon: MessageSquare, color: "bg-indigo-100 text-indigo-600" },
          { label: "Positivos", value: `${pct(positivos)}%`, icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
          { label: "Neutros", value: `${pct(neutros)}%`, icon: Lightbulb, color: "bg-amber-100 text-amber-600" },
          { label: "Negativos", value: `${pct(negativos)}%`, icon: AlertTriangle, color: "bg-red-100 text-red-600" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl border border-border bg-card"
          >
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-foreground mb-1">Distribución de Sentimientos</h3>
          <p className="text-xs text-muted-foreground mb-6">Análisis porcentual de opiniones recibidas</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sentimientosDistribucion} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={12} tick={{ fill: "#9ca3af" }} />
              <YAxis type="category" dataKey="name" fontSize={13} tick={{ fill: "#6b7280" }} width={70} />
              <Tooltip formatter={(value: number) => [`${value}%`, "Porcentaje"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }} />
              <Bar dataKey="porcentaje" radius={[0, 8, 8, 0]} barSize={28}>
                {sentimientosDistribucion.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-foreground mb-1">Resumen Ejecutivo NLP</h3>
          <p className="text-xs text-muted-foreground mb-4">Generado automáticamente por inteligencia artificial</p>
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-800">Fortalezas Identificadas</span>
              </div>
              <ul className="text-sm text-emerald-700 space-y-1.5">
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />Excelente capacidad de comunicación y claridad en las explicaciones</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />Alta disponibilidad para resolver dudas fuera de horario de clase</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />Uso de ejemplos prácticos y laboratorios bien estructurados</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">Áreas de Mejora</span>
              </div>
              <ul className="text-sm text-amber-700 space-y-1.5">
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />Mayor claridad en los criterios de evaluación y rúbricas</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />Incrementar retroalimentación oportuna en proyectos y tareas</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />Incorporar más actividades de trabajo colaborativo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-1">Comentarios Recibidos</h3>
        <p className="text-xs text-muted-foreground mb-4">Todas las evaluaciones son anónimas</p>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando evaluaciones...</p>
        ) : comentariosDocente.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay evaluaciones para este período.</p>
        ) : (
          <div className="space-y-4">
            {comentariosDocente.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    Evaluación anónima ·{" "}
                    {c.created_at ? c.created_at.toDate().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "Fecha no disponible"}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${getSentimentBadge(c.sentimiento)}`}>
                    {getSentimentEmoji(c.sentimiento)} {c.sentimiento}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-3 leading-relaxed">"{c.comentario}"</p>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Resumen NLP</p>
                  <p className="text-sm text-foreground">{c.resumen}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
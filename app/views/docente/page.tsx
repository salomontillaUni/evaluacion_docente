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
import { motion } from "motion/react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

const getSentimentLabel = (s: string) => {
  switch (s?.toLowerCase()) {
    case "positivo": return "Positivo";
    case "negativo": return "Negativo";
    default: return "Neutro";
  }
};

const getSentimentBadge = (s: string) => {
  switch (s?.toLowerCase()) {
    case "positivo": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "negativo": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-amber-100 text-amber-800 border-amber-200";
  }
};

const getSentimentEmoji = (s: string) => {
  switch (s?.toLowerCase()) {
    case "positivo": return "😊";
    case "negativo": return "😟";
    default: return "😐";
  }
};

interface Comentario {
  id: string;
  comentario: string;
  sentimiento: string;
  resumen_nlp: string;
  created_at: string | null;
}

export default function TeacherView() {
  const router = useRouter();
  const [docente, setDocente] = useState<any>(null);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<number | null>(null);
  const [isPeriodoOpen, setIsPeriodoOpen] = useState(false);
  const [comentariosDocente, setComentariosDocente] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEval, setLoadingEval] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      try {
        // 1. Obtener usuario autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push("/");
          return;
        }

        // 2. Obtener el perfil del docente
        const { data: docenteData, error: docenteError } = await supabase
          .from("docentes")
          .select("id, departamento_id, users(full_name)")
          .eq("user_id", user.id)
          .single();

        if (docenteError || !docenteData) {
          setAuthError("El usuario actual no está registrado como docente en el sistema.");
          return;
        }

        const mappedDocente = {
          ...docenteData,
          users: Array.isArray(docenteData.users) ? docenteData.users[0] : docenteData.users
        };
        setDocente(mappedDocente);

        // 3. Obtener los periodos académicos
        const { data: periodosData, error: periodosError } = await supabase
          .from("periodos_academicos")
          .select("id, codigo, estado")
          .order("fecha_inicio", { ascending: false });

        if (periodosError || !periodosData || periodosData.length === 0) {
          setAuthError("No se encontraron períodos académicos registrados.");
          return;
        }

        setPeriodos(periodosData);

        // Buscar periodo activo, si no hay usar el primero
        const activePeriod = periodosData.find(p => p.estado === 'activo') || periodosData[0];
        setSelectedPeriodo(activePeriod.id);
      } catch (error) {
        console.error("Error al inicializar la vista del docente:", error);
        setAuthError("Ocurrió un error al cargar la información del docente.");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, []);

  useEffect(() => {
    if (!docente || !selectedPeriodo) return;

    const fetchEvaluaciones = async () => {
      setLoadingEval(true);
      try {
        const { data, error } = await supabase
          .from("evaluaciones")
          .select("id, comentario, sentimiento, resumen_nlp, created_at")
          .eq("docente_id", docente.id)
          .eq("periodo_id", selectedPeriodo)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error cargando evaluaciones:", error);
          return;
        }

        setComentariosDocente(data || []);
      } catch (error) {
        console.error("Error cargando evaluaciones:", error);
      } finally {
        setLoadingEval(false);
      }
    };

    fetchEvaluaciones();
  }, [selectedPeriodo, docente]);

  const currentPeriodo = periodos.find((p) => p.id === selectedPeriodo);

  const total = comentariosDocente.length;
  const positivos = comentariosDocente.filter((c) => c.sentimiento?.toLowerCase() === "positivo").length;
  const neutros = comentariosDocente.filter((c) => c.sentimiento?.toLowerCase() === "neutro").length;
  const negativos = comentariosDocente.filter((c) => c.sentimiento?.toLowerCase() === "negativo").length;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const sentimientosDistribucion = [
    { name: "Positivo", porcentaje: pct(positivos), fill: "#10b981" },
    { name: "Neutro", porcentaje: pct(neutros), fill: "#f59e0b" },
    { name: "Negativo", porcentaje: pct(negativos), fill: "#ef4444" },
  ];

  const fortalezas = comentariosDocente
    .filter((c) => c.sentimiento?.toLowerCase() === "positivo" && c.resumen_nlp)
    .map((c) => c.resumen_nlp)
    .slice(0, 3);

  const areasMejora = comentariosDocente
    .filter((c) => c.sentimiento?.toLowerCase() === "negativo" && c.resumen_nlp)
    .map((c) => c.resumen_nlp)
    .slice(0, 3);

  if (authError) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Error de Acceso</h2>
          <p className="text-sm text-red-700 mb-6">{authError}</p>
          <button
            onClick={() => {
              document.cookie = "role=; path=/; max-age=0; samesite=lax";
              document.cookie = "user_name=; path=/; max-age=0; samesite=lax";
              router.push("/");
            }}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (loading && !docente) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando tu panel de docente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-foreground font-bold text-xl md:text-2xl">Mis Resultados</h1>
            <p className="text-sm text-muted-foreground">
              Docente: <span className="font-semibold text-foreground">{docente?.users?.full_name}</span>
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <button
            type="button"
            onClick={() => setIsPeriodoOpen(!isPeriodoOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card hover:border-emerald-300 transition-all cursor-pointer text-left"
          >
            <span className="text-sm text-foreground">
              {currentPeriodo ? `Período ${currentPeriodo.codigo}` : "Seleccione un período"}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isPeriodoOpen ? "rotate-180" : ""}`} />
          </button>
          {isPeriodoOpen && (
            <div className="absolute z-20 mt-2 w-full bg-card rounded-xl border border-border shadow-xl overflow-hidden">
              {periodos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSelectedPeriodo(p.id); setIsPeriodoOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 transition-colors ${selectedPeriodo === p.id ? "bg-emerald-50 text-emerald-700" : "text-foreground"}`}
                >
                  Período {p.codigo} {p.estado === "activo" ? "(Activo)" : ""}
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
            className="p-4 rounded-2xl border border-border bg-card shadow-xs"
          >
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h3 className="text-foreground mb-1 font-bold">Distribución de Sentimientos</h3>
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

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h3 className="text-foreground mb-1 font-bold">Resumen Ejecutivo NLP</h3>
          <p className="text-xs text-muted-foreground mb-4">Generado automáticamente por inteligencia artificial</p>
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">Fortalezas Identificadas</span>
              </div>
              <ul className="text-sm text-emerald-700 space-y-1.5">
                {fortalezas.length > 0 ? (
                  fortalezas.map((f, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))
                ) : (
                  <li className="text-emerald-600/80 italic text-xs">
                    {total > 0
                      ? "No se identificaron fortalezas significativas en los comentarios de este período."
                      : "Esperando evaluaciones para este período."}
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Áreas de Mejora</span>
              </div>
              <ul className="text-sm text-amber-700 space-y-1.5">
                {areasMejora.length > 0 ? (
                  areasMejora.map((am, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      {am}
                    </li>
                  ))
                ) : (
                  <li className="text-amber-600/80 italic text-xs">
                    {total > 0
                      ? "¡Excelente! No se identificaron áreas de mejora críticas en este período."
                      : "Esperando evaluaciones para este período."}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-1 font-bold">Comentarios Recibidos</h3>
        <p className="text-xs text-muted-foreground mb-4">Todas las evaluaciones son anónimas</p>

        {loadingEval ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Cargando evaluaciones...</span>
          </div>
        ) : comentariosDocente.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-card">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No hay evaluaciones registradas para este período.</p>
          </div>
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
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Fecha no disponible"}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getSentimentBadge(c.sentimiento)}`}>
                    {getSentimentEmoji(c.sentimiento)} {getSentimentLabel(c.sentimiento)}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-3 leading-relaxed">"{c.comentario}"</p>
                {c.resumen_nlp && (
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Resumen NLP</p>
                    <p className="text-sm text-foreground">{c.resumen_nlp}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
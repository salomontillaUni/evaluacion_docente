"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Download,
  Save,
  Users,
  FileBarChart2,
  TrendingUp,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  LayoutDashboard,
  GraduationCap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { tendenciasMensuales, sentimientosDistribucion } from "../../components/mockData";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "../../lib/supabase";
import StudentManagement from "./StudentManagement";
import TeacherManagement from "./TeacherManagement";
import DepartmentManagement from "./DepartmentManagement";
import { Building2 as BuildingIcon } from "lucide-react";

interface Docente {
  id: string;
  nombre: string;
  materia: string;
}

interface Metricas {
  totalEvaluaciones: number;
  docentesEvaluados: number;
  promedioGeneral: number;
  tasaParticipacion: number;
}

type TabType = "dashboard" | "students" | "teachers" | "depts";

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [docentesSeleccionados, setDocentesSeleccionados] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{ fecha?: string; docentes?: string }>({});
  const [metricas, setMetricas] = useState<Metricas>({
    totalEvaluaciones: 0,
    docentesEvaluados: 0,
    promedioGeneral: 0,
    tasaParticipacion: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real data from Supabase
        const { data: docentesData, error: dError } = await supabase
          .from('docentes')
          .select('id, user_id, users(full_name)');
        
        if (dError) throw dError;

        const formattedDocentes = (docentesData || []).map(d => ({
          id: d.id.toString(),
          nombre: (d.users as any)?.full_name || "Sin nombre",
          materia: "General" // Placeholder, in a real case we'd join with materias
        }));
        
        setDocentes(formattedDocentes);

        const { data: evaluations, error: eError } = await supabase
          .from('evaluaciones')
          .select('id, docente_id');
        
        if (eError) throw eError;

        const evalCount = evaluations?.length || 0;
        const uniqueDocentes = new Set(evaluations?.map(e => e.docente_id)).size;

        setMetricas({
          totalEvaluaciones: evalCount,
          docentesEvaluados: uniqueDocentes,
          promedioGeneral: 4.2,
          tasaParticipacion: formattedDocentes.length > 0
            ? Math.round((uniqueDocentes / formattedDocentes.length) * 100)
            : 0,
        });
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  const toggleDocente = (id: string) => {
    setDocentesSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
    setFormErrors((prev) => ({ ...prev, docentes: undefined }));
  };

  const selectAll = () => {
    if (docentesSeleccionados.length === docentes.length) {
      setDocentesSeleccionados([]);
    } else {
      setDocentesSeleccionados(docentes.map((d) => d.id));
      setFormErrors((prev) => ({ ...prev, docentes: undefined }));
    }
  };

  const handleExport = () => {
    toast.success("Reporte generado exitosamente", {
      description: "El archivo reporte_evaluaciones_2026.xlsx se ha descargado.",
    });
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};
    if (!fechaInicio || !fechaFin) {
      errors.fecha = "Debes seleccionar ambas fechas.";
    } else if (new Date(fechaInicio) >= new Date(fechaFin)) {
      errors.fecha = "La fecha de inicio debe ser anterior a la fecha de fin.";
    }
    if (docentesSeleccionados.length === 0) {
      errors.docentes = "Debes seleccionar al menos un docente.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      const { error } = await supabase
        .from('periodos_academicos')
        .insert([{
          codigo: `PER-${new Date(fechaInicio).getFullYear()}-${Math.random().toString(36).substring(7)}`,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estado: 'abierto'
        }]);

      if (error) throw error;

      toast.success("Período de evaluación guardado", {
        description: `Período del ${new Date(fechaInicio).toLocaleDateString("es-ES")} al ${new Date(fechaFin).toLocaleDateString("es-ES")} creado.`,
      });
    } catch (error) {
      console.error("Error guardando período:", error);
      toast.error("Error al guardar el período");
    }
  };

  const metricasCards = [
    { label: "Total Evaluaciones", value: metricas.totalEvaluaciones.toLocaleString(), icon: FileBarChart2, color: "bg-indigo-100 text-indigo-600", trend: "+12.3%" },
    { label: "Docentes Evaluados", value: metricas.docentesEvaluados.toString(), icon: Users, color: "bg-emerald-100 text-emerald-600", trend: "+5" },
    { label: "Promedio General", value: `${metricas.promedioGeneral}/5.0`, icon: TrendingUp, color: "bg-amber-100 text-amber-600", trend: "+0.3" },
    { label: "Tasa Participación", value: `${metricas.tasaParticipacion}%`, icon: BarChart3, color: "bg-purple-100 text-purple-600", trend: "+4.2%" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel de Administración</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Dashboard de métricas y gestión académica</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25 font-medium"
        >
          <Download className="w-4 h-4" />
          Exportar Datos
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium text-sm ${
            activeTab === "dashboard"
              ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Métricas
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium text-sm ${
            activeTab === "students"
              ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Estudiantes
        </button>
        <button
          onClick={() => setActiveTab("teachers")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium text-sm ${
            activeTab === "teachers"
              ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Users className="w-4 h-4" />
          Docentes
        </button>
        <button
          onClick={() => setActiveTab("depts")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium text-sm ${
            activeTab === "depts"
              ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <BuildingIcon className="w-4 h-4" />
          Departamentos
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "dashboard" ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* ... Dashboard content ... */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {metricasCards.map((m, i) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center`}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">{m.trend}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{m.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold tracking-wider">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Tendencias de Percepción</h3>
                <p className="text-xs text-slate-500 mb-6 font-medium">Evolución mensual de sentimientos</p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={tendenciasMensuales} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="mes" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                    <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }} />
                    <Line type="monotone" dataKey="positivo" name="Positivo" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="negativo" name="Negativo" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Distribución General</h3>
                <p className="text-xs text-slate-500 mb-6 font-medium">Análisis de sentimientos actuales</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sentimientosDistribucion} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                    <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: "12px", border: "none" }} />
                    <Bar dataKey="porcentaje" radius={[6, 6, 0, 0]} barSize={40}>
                      {sentimientosDistribucion.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <div className="px-8 py-6 bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Gestionar Período de Evaluación</h2>
                    <p className="text-sm text-indigo-100/80">Configure las fechas del portal de evaluación</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Configuración Temporal</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">FECHA INICIO</label>
                        <input
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => { setFechaInicio(e.target.value); setFormErrors((p) => ({ ...p, fecha: undefined })); }}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">FECHA FIN</label>
                        <input
                          type="date"
                          value={fechaFin}
                          onChange={(e) => { setFechaFin(e.target.value); setFormErrors((p) => ({ ...p, fecha: undefined })); }}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Asignar Docentes</h4>
                      <button onClick={selectAll} className="text-xs text-indigo-600 font-bold hover:underline">
                        {docentesSeleccionados.length === docentes.length ? "Deseleccionar" : "Seleccionar Todos"}
                      </button>
                    </div>
                    <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-1 gap-2">
                        {docentes.map((d) => (
                          <label key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                            <input type="checkbox" checked={docentesSeleccionados.includes(d.id)} onChange={() => toggleDocente(d.id)} />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{d.nombre}</p>
                              <p className="text-[10px] text-slate-500 font-medium uppercase">{d.materia}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Seleccionados</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{docentesSeleccionados.length}</p>
                    </div>
                  </div>
                  <button onClick={handleSave} className="w-full sm:w-auto px-10 py-3.5 bg-indigo-600 text-white rounded-xl font-bold">Guardar Configuración</button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === "students" ? (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <StudentManagement />
          </motion.div>
        ) : activeTab === "teachers" ? (
          <motion.div
            key="teachers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TeacherManagement />
          </motion.div>
        ) : (
          <motion.div
            key="depts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <DepartmentManagement />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
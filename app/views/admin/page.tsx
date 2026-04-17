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
import { motion } from "motion/react";
import { getDb } from "@/app/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

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

export default function AdminView() {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = await getDb();

        const docentesSnap = await getDocs(collection(db, "docentes"));
        const docentesData = docentesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Docente[];
        setDocentes(docentesData);

        const evalSnap = await getDocs(collection(db, "evaluaciones"));
        const evaluaciones = evalSnap.docs.map((doc) => doc.data());
        const docentesUnicos = new Set(evaluaciones.map((e) => e.docente_id)).size;

        setMetricas({
          totalEvaluaciones: evaluaciones.length,
          docentesEvaluados: docentesUnicos,
          promedioGeneral: 4.2,
          tasaParticipacion: docentesData.length > 0
            ? Math.round((docentesUnicos / docentesData.length) * 100)
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
    } else if (new Date(fechaInicio) < new Date("2024-01-01")) {
      errors.fecha = "La fecha de inicio no puede ser anterior a 2024.";
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
      const db = await getDb();
      await addDoc(collection(db, "periodos"), {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        docentes: docentesSeleccionados,
        estado: "abierto",
        created_at: serverTimestamp(),
      });
      toast.success("Período de evaluación guardado", {
        description: `Período del ${new Date(fechaInicio).toLocaleDateString("es-ES")} al ${new Date(fechaFin).toLocaleDateString("es-ES")} con ${docentesSeleccionados.length} docente(s).`,
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-foreground">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">Dashboard de métricas y gestión de períodos</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25"
        >
          <Download className="w-4 h-4" />
          Exportación de Datos
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricasCards.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${m.color} flex items-center justify-center`}>
                <m.icon className="w-4 h-4" />
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{m.trend}</span>
            </div>
            <p className="text-2xl text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-foreground mb-1">Tendencias de Percepción</h3>
          <p className="text-xs text-muted-foreground mb-6">Evolución mensual de sentimientos estudiantiles</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={tendenciasMensuales} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" fontSize={12} tick={{ fill: "#9ca3af" }} />
              <YAxis fontSize={12} tick={{ fill: "#9ca3af" }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }} formatter={(value: number) => [`${value}%`]} />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
              <Line type="monotone" dataKey="positivo" name="Positivo" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="neutro" name="Neutro" stroke="#eab308" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="negativo" name="Negativo" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-foreground mb-1">Distribución General</h3>
          <p className="text-xs text-muted-foreground mb-6">Porcentaje de sentimientos en todas las evaluaciones</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sentimientosDistribucion} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" fontSize={13} tick={{ fill: "#6b7280" }} />
              <YAxis fontSize={12} tick={{ fill: "#9ca3af" }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value: number) => [`${value}%`, "Porcentaje"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }} />
              <Bar dataKey="porcentaje" radius={[8, 8, 0, 0]} barSize={50}>
                {sentimientosDistribucion.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="px-6 py-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            <h2 className="text-white">Gestionar Período de Evaluación</h2>
          </div>
          <p className="text-sm text-purple-100 mt-1">Configure fechas y asigne docentes al período</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block mb-3 text-foreground">Período de Evaluación</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fecha de Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => { setFechaInicio(e.target.value); setFormErrors((prev) => ({ ...prev, fecha: undefined })); }}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fecha de Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => { setFechaFin(e.target.value); setFormErrors((prev) => ({ ...prev, fecha: undefined })); }}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                />
              </div>
            </div>
            {formErrors.fecha && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formErrors.fecha}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-foreground">Seleccionar Docentes</label>
              <button type="button" onClick={selectAll} className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
                {docentesSeleccionados.length === docentes.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </button>
            </div>
            {docentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Cargando docentes...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docentes.map((d) => {
                  const isSelected = docentesSeleccionados.includes(d.id);
                  return (
                    <label
                      key={d.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200" : "border-border hover:border-indigo-200 hover:bg-indigo-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDocente(d.id)}
                        className="mt-1 w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{d.nombre}</p>
                        <p className="text-xs text-muted-foreground">{d.materia}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {formErrors.docentes && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formErrors.docentes}
              </div>
            )}
            {docentesSeleccionados.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {docentesSeleccionados.length} de {docentes.length} docentes seleccionados
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25"
            >
              <Save className="w-4 h-4" />
              Guardar Evaluación
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
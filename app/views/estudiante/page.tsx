"use client";
import { useState } from "react";
import {
  Send,
  Eraser,
  ChevronDown,
  CheckCircle2,
  BrainCircuit,
  Sparkles,
  FileText,
  MessageSquareText,
} from "lucide-react";
import { toast } from "sonner";
import { docentes } from "../../components/mockData";
import { motion } from "motion/react";

const MAX_CHARS = 1000;

interface AnalysisResult {
  sentimiento: string;
  resumen: string;
  id: string;
}

export default function StudentView() {
  const [selectedDocente, setSelectedDocente] = useState("");
  const [comentario, setComentario] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errors, setErrors] = useState<{
    docente?: string;
    comentario?: string;
  }>({});

  const charsRemaining = MAX_CHARS - comentario.length;
  const selectedDocenteObj = docentes.find((d) => d.id === selectedDocente);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!selectedDocente)
      newErrors.docente = "Debes seleccionar un docente para evaluar.";
    if (!comentario.trim())
      newErrors.comentario = "El comentario no puede estar vacío.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validate()) return;

    setIsAnalyzing(true);
    setResult(null);

    // Simular análisis NLP
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const sentimientos = ["Positivo", "Neutro", "Negativo"];
    const randomSentiment =
      comentario.toLowerCase().includes("excelente") ||
      comentario.toLowerCase().includes("bueno") ||
      comentario.toLowerCase().includes("gran")
        ? "Positivo"
        : comentario.toLowerCase().includes("malo") ||
            comentario.toLowerCase().includes("deficiente") ||
            comentario.toLowerCase().includes("pésimo")
          ? "Negativo"
          : sentimientos[Math.floor(Math.random() * sentimientos.length)];

    const uniqueId = `EVAL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    setResult({
      sentimiento: randomSentiment,
      resumen: `El comentario expresa una opinión ${randomSentiment.toLowerCase()} sobre el desempeño docente de ${selectedDocenteObj?.nombre}. Se identifican ${
        randomSentiment === "Positivo"
          ? "fortalezas en la metodología de enseñanza y comunicación efectiva"
          : randomSentiment === "Negativo"
            ? "áreas de mejora en la comunicación y los métodos de evaluación"
            : "aspectos generales del desempeño sin inclinación marcada"
      }.`,
      id: uniqueId,
    });

    setIsAnalyzing(false);
    toast.success("Análisis completado exitosamente");
  };

  const handleClear = () => {
    setComentario("");
    setResult(null);
    setErrors({});
  };

  const getSentimentColor = (s: string) => {
    switch (s) {
      case "Positivo":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Negativo":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getSentimentIcon = (s: string) => {
    switch (s) {
      case "Positivo":
        return "😊";
      case "Negativo":
        return "😟";
      default:
        return "😐";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-4 md:p-8 max-w-4xl mx-auto min-h-full relative"
    >
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
          <MessageSquareText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Evaluación Docente
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg text-sm md:text-base">
          Comparte tu experiencia académica de forma anónima para ayudarnos a
          construir un mejor entorno educativo.
        </p>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-xl p-6 md:p-8">
        {/* Selector de Docente */}
        <div className="mb-8">
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
            Docente a evaluar
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all bg-white dark:bg-slate-950 text-left cursor-pointer ${
                errors.docente
                  ? "border-red-400 ring-2 ring-red-100"
                  : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              }`}
            >
              <span
                className={
                  selectedDocenteObj
                    ? "text-slate-900 dark:text-white font-medium"
                    : "text-slate-400"
                }
              >
                {selectedDocenteObj
                  ? `${selectedDocenteObj.nombre} — ${selectedDocenteObj.materia}`
                  : "Selecciona un profesor..."}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-indigo-500" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
              >
                {docentes.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedDocente(d.id);
                      setIsDropdownOpen(false);
                      setErrors((prev) => ({ ...prev, docente: undefined }));
                    }}
                    className={`w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${
                      selectedDocente === d.id
                        ? "bg-indigo-50/50 dark:bg-indigo-500/10"
                        : ""
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {d.nombre}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {d.materia} · {d.departamento}
                    </p>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          {errors.docente && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-500 flex items-center gap-1.5 ml-1"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.docente}
            </motion.p>
          )}
        </div>

        {/* Área de Texto */}
        <div className="mb-8">
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
            Tu retroalimentación
          </label>
          <div
            className={`relative rounded-2xl border bg-white dark:bg-slate-950 transition-all ${
              errors.comentario
                ? "border-red-400 ring-2 ring-red-100"
                : "border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10"
            }`}
          >
            <textarea
              value={comentario}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setComentario(e.target.value);
                  if (e.target.value.trim())
                    setErrors((prev) => ({ ...prev, comentario: undefined }));
                }
              }}
              placeholder="Describe tu experiencia de aprendizaje. Puedes incluir aspectos como claridad, materiales, nivel de empatía, o cualquier área que pueda mejorar."
              rows={6}
              className="w-full px-5 py-4 rounded-t-2xl bg-transparent text-slate-900 dark:text-white placeholder-slate-400 resize-none outline-none leading-relaxed"
            />
            <div
              className={`flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium ${
                charsRemaining < 100
                  ? charsRemaining < 20
                    ? "text-red-500"
                    : "text-amber-500"
                  : "text-slate-400"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Máximo {MAX_CHARS} caracteres
              </span>
              <span className="tabular-nums bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                {charsRemaining}
              </span>
            </div>
          </div>
          {errors.comentario && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-500 flex items-center gap-1.5 ml-1"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.comentario}
            </motion.p>
          )}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 mb-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
          >
            <Eraser className="w-5 h-5" />
            Limpiar form
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium shadow-md transition-all text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-wait"
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Analizando con NLP...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Procesar y Enviar
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Resultado del Análisis */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mt-8 rounded-3xl border border-white/20 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl"
        >
          <div className="px-8 py-5 bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-[200%_auto] animate-gradient text-white">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-indigo-100" />
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Análisis Inteligente
              </h2>
            </div>
            <p className="text-indigo-100/80 text-sm mt-1">
              Resultados generados por Procesamiento de Lenguaje Natural
            </p>
          </div>

          <div className="p-8 space-y-8 relative">
            {/* Sentimiento */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Sentimiento
                </label>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    {getSentimentIcon(result.sentimiento)}
                  </div>
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getSentimentColor(result.sentimiento)}`}
                  >
                    {result.sentimiento}
                  </span>
                </div>
              </div>

              {/* Confirmación Badge */}
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl px-5 py-3 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                    Registrado exitosamente
                  </p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 mt-0.5">
                    Ref: <span className="font-mono">{result.id}</span>
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Resumen */}
            <div>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                Resumen generativo
              </label>
              <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl group-hover:w-1.5 transition-all" />
                <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed pl-2">
                  {result.resumen}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

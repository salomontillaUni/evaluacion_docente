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
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <MessageSquareText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-foreground">Evaluación Docente</h1>
            <p className="text-sm text-muted-foreground">
              Comparte tu experiencia de forma anónima
            </p>
          </div>
        </div>
      </div>

      {/* Selector de Docente */}
      <div className="mb-6">
        <label className="block mb-2 text-foreground">
          Seleccionar Docente
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all bg-card text-left ${
              errors.docente
                ? "border-red-400 ring-2 ring-red-100"
                : "border-border hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            }`}
          >
            <span
              className={
                selectedDocenteObj ? "text-foreground" : "text-muted-foreground"
              }
            >
              {selectedDocenteObj
                ? `${selectedDocenteObj.nombre} — ${selectedDocenteObj.materia}`
                : "Elige un docente matriculado..."}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-20 mt-2 w-full bg-card rounded-xl border border-border shadow-xl overflow-hidden">
              {docentes.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setSelectedDocente(d.id);
                    setIsDropdownOpen(false);
                    setErrors((prev) => ({ ...prev, docente: undefined }));
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-border last:border-b-0 ${
                    selectedDocente === d.id ? "bg-indigo-50" : ""
                  }`}
                >
                  <p className="text-sm text-foreground">{d.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.materia} · {d.departamento}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.docente && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
            {errors.docente}
          </p>
        )}
      </div>

      {/* Área de Texto */}
      <div className="mb-6">
        <label className="block mb-2 text-foreground">
          Tu opinión sobre el docente
        </label>
        <div
          className={`relative rounded-xl border transition-all ${
            errors.comentario
              ? "border-red-400 ring-2 ring-red-100"
              : "border-border focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
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
            placeholder="Describe tu experiencia con este docente: su metodología de enseñanza, comunicación, disponibilidad, material de clase, evaluaciones, etc."
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-card text-foreground placeholder-muted-foreground resize-none focus:outline-none"
          />
          <div
            className={`flex items-center justify-between px-4 py-2 border-t border-border text-xs ${
              charsRemaining < 100
                ? charsRemaining < 20
                  ? "text-red-600"
                  : "text-amber-600"
                : "text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Máximo {MAX_CHARS} caracteres
            </span>
            <span className="tabular-nums">{charsRemaining} restantes</span>
          </div>
        </div>
        {errors.comentario && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
            {errors.comentario}
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
        >
          <Eraser className="w-4 h-4" />
          Limpiar
        </button>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25"
        >
          {isAnalyzing ? (
            <>
              <BrainCircuit className="w-4 h-4 animate-spin" />
              Analizando con NLP...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Analizar comentario
            </>
          )}
        </button>
      </div>

      {/* Resultado del Análisis */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-white">Resultado del Análisis</h2>
            </div>
            <p className="text-sm text-indigo-100 mt-1">
              Procesado mediante Procesamiento de Lenguaje Natural
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Sentimiento */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Sentimiento Detectado
              </label>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl">
                  {getSentimentIcon(result.sentimiento)}
                </span>
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm border ${getSentimentColor(result.sentimiento)}`}
                >
                  {result.sentimiento}
                </span>
              </div>
            </div>

            {/* Resumen */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Resumen
              </label>
              <p className="mt-2 text-foreground bg-muted/50 rounded-xl p-4 text-sm leading-relaxed">
                {result.resumen}
              </p>
            </div>

            {/* Confirmación */}
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-emerald-800">
                  Evaluación registrada exitosamente
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  Identificador único:{" "}
                  <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">
                    {result.id}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

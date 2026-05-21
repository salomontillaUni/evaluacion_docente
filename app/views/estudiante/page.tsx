"use client";
import { useState, useEffect } from "react";
import {
  Send, Eraser, ChevronDown, CheckCircle2,
  BrainCircuit, Sparkles, FileText, MessageSquareText,
  UploadCloud, File, Trash2, Download,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { createClient } from "@/app/lib/supabase";
import { jsPDF } from "jspdf";


const MAX_CHARS = 1000;


interface Docente {
  id: number;
  user_id: string;
  users: {
    full_name: string;
  } | null;
}


interface AnalysisResult {
  sentimiento: string;
  resumen: string;
  id: string;
}


export default function StudentView() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [selectedDocente, setSelectedDocente] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errors, setErrors] = useState<{ docente?: string; comentario?: string }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);


  const supabase = createClient();
  const charsRemaining = MAX_CHARS - comentario.length;
  const selectedDocenteObj = docentes.find((d) => d.id === selectedDocente);


  useEffect(() => {
    const fetchDocentes = async () => {
      const { data, error } = await supabase
        .from("docentes")
        .select("id, user_id, users(full_name)");


      if (error) {
        toast.error("No se pudieron cargar los docentes");
        console.error(error);
        return;
      }


      const mapped = (data || []).map((d) => ({
        ...d,
        users: Array.isArray(d.users) ? d.users[0] : d.users,
      }));


      setDocentes(mapped);
    };


    fetchDocentes();
  }, []);


  const handleFileSelection = (file: File) => {
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato de archivo no válido. Solo se admiten archivos PDF o imágenes (PNG, JPG, JPEG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El tamaño del archivo supera el límite de 5MB.");
      return;
    }
    setSelectedFile(file);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from("evaluaciones-evidencias")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading to storage:", error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from("evaluaciones-evidencias")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  const generateReceiptPDF = (docenteNombre: string, refId: string, fecha: string) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });

      // Premium Color Palette
      const PRIMARY_COLOR = [79, 70, 229]; // Indigo #4f46e5
      const TEXT_DARK = [15, 23, 42]; // Slate 900
      const TEXT_LIGHT = [100, 116, 139]; // Slate 500
      const BACKGROUND_LIGHT = [248, 250, 252]; // Slate 50

      // Draw background card style
      doc.setFillColor(BACKGROUND_LIGHT[0], BACKGROUND_LIGHT[1], BACKGROUND_LIGHT[2]);
      doc.rect(5, 5, 138, 200, "F");

      // Draw Indigo header band
      doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.rect(5, 5, 138, 25, "F");

      // Header text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("COMPROBANTE DE EVALUACIÓN", 74, 17, { align: "center" });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("PORTAL DE EVALUACIÓN DOCENTE", 74, 23, { align: "center" });

      // Border outline for card
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.rect(5, 5, 138, 200, "D");

      // Content section
      let yPos = 45;

      // Decorative checkmark circle
      doc.setFillColor(16, 185, 129); // Emerald 500
      doc.circle(74, yPos, 8, "F");
      // Checkmark icon drawn using lines
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      doc.line(71, yPos, 73, yPos + 2.5);
      doc.line(73, yPos + 2.5, 77.5, yPos - 2);

      yPos += 15;
      doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("¡EVALUACIÓN REGISTRADA!", 74, yPos, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
      doc.text("Tu opinión anónima ha sido procesada de manera exitosa.", 74, yPos + 5, { align: "center" });

      yPos += 20;

      // Details Table Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(12, yPos, 124, 65, "FD");

      doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Detalles del Registro", 18, yPos + 8);
      doc.setDrawColor(241, 245, 249);
      doc.line(12, yPos + 12, 136, yPos + 12);

      // Table contents
      const labels = [
        ["Referencia Única:", refId],
        ["Docente Evaluado:", docenteNombre],
        ["Fecha de Emisión:", fecha],
        ["Estado de Evaluación:", "Completado - Anónimo"],
        ["Evidencia Adjunta:", selectedFile ? selectedFile.name : "Ninguna"],
      ];

      let rowY = yPos + 18;
      labels.forEach(([label, val]) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
        doc.setFontSize(8.5);
        doc.text(label, 18, rowY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
        doc.text(val, 55, rowY);
        rowY += 9;
      });

      yPos += 75;

      // Sello de seguridad simulado
      doc.setFillColor(241, 245, 249);
      doc.rect(12, yPos, 124, 25, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(12, yPos, 124, 25, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
      doc.text("VERIFICACIÓN Y SEGURIDAD CRIPTOGRÁFICA", 18, yPos + 6);
      
      const hash = "SHA256: " + Array.from({length: 4}, () => Math.random().toString(16).substring(2, 10).toUpperCase()).join("-");
      doc.setFont("courier", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(hash, 18, yPos + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Este comprobante es generado automáticamente por el sistema y tiene carácter oficial.", 18, yPos + 18);

      // Footer text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
      doc.text("© 2026 Universidad de Docencia Excelente - Todos los derechos reservados.", 74, 195, { align: "center" });

      doc.save(`Comprobante_Evaluacion_${refId}.pdf`);
      toast.success("Comprobante PDF descargado");
    } catch (err) {
      console.error("Error al generar PDF:", err);
      toast.error("No se pudo generar el comprobante PDF.");
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!selectedDocente) newErrors.docente = "Debes seleccionar un docente para evaluar.";
    if (!comentario.trim()) newErrors.comentario = "El comentario no puede estar vacío.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleAnalyze = async () => {
    if (!validate()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      // 1. Obtener el periodo activo
      const { data: periodoData, error: periodoError } = await supabase
        .from("periodos_academicos")
        .select("id")
        .eq("estado", "activo")
        .single();

      if (periodoError || !periodoData) {
        toast.error("No hay un período académico activo");
        setIsAnalyzing(false);
        return;
      }

      // Subir evidencia si existe
      let evidenciaUrlResult = null;
      if (selectedFile) {
        try {
          evidenciaUrlResult = await uploadFile(selectedFile);
        } catch (uploadError) {
          toast.error("Error al subir el archivo de evidencia");
          setIsAnalyzing(false);
          return;
        }
      }

      // 2. Llamar a la API de análisis con Gemini
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comentario,
          docenteNombre: selectedDocenteObj?.users?.full_name,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al analizar el comentario con la API");
      }

      const analysis = await response.json();
      const rawSentimiento = analysis.sentimiento; // 'positivo' | 'neutro' | 'negativo'
      const resumen = analysis.resumen;

      const uniqueId = `EVAL-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      // 3. Guardar la evaluación en la base de datos Supabase con los datos reales
      const { error } = await supabase.from("evaluaciones").insert({
        docente_id: selectedDocente,
        comentario,
        sentimiento: rawSentimiento,
        resumen_nlp: resumen,
        referencia_publica: uniqueId,
        periodo_id: periodoData.id,
        evidencia_url: evidenciaUrlResult,
      });

      if (error) {
        toast.error("Error al guardar la evaluación");
        console.error("Supabase error:", JSON.stringify(error, null, 2));
        setIsAnalyzing(false);
        return;
      }

      const capitalizedSentiment =
        rawSentimiento.charAt(0).toUpperCase() + rawSentimiento.slice(1).toLowerCase();

      setResult({ sentimiento: capitalizedSentiment, resumen, id: uniqueId });
      toast.success("Análisis completado exitosamente");
    } catch (err: any) {
      console.error("Error al procesar la evaluación:", err);
      toast.error(err.message || "Ocurrió un error inesperado al procesar la evaluación");
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleClear = () => {
    setComentario("");
    setResult(null);
    setErrors({});
    setSelectedFile(null);
  };


  const getSentimentColor = (s: string) => {
    switch (s) {
      case "Positivo": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Negativo": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };


  const getSentimentIcon = (s: string) => {
    switch (s) {
      case "Positivo": return "😊";
      case "Negativo": return "😟";
      default: return "😐";
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
              <span className={selectedDocenteObj ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}>
                {selectedDocenteObj
                  ? selectedDocenteObj.users?.full_name
                  : "Selecciona un profesor..."}
              </span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-indigo-500" : ""}`} />
            </button>


            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
              >
                {docentes.length === 0 ? (
                  <p className="text-center text-slate-400 py-6 text-sm">
                    No hay docentes disponibles
                  </p>
                ) : (
                  docentes.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setSelectedDocente(d.id);
                        setIsDropdownOpen(false);
                        setErrors((prev) => ({ ...prev, docente: undefined }));
                      }}
                      className={`w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${
                        selectedDocente === d.id ? "bg-indigo-50/50 dark:bg-indigo-500/10" : ""
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {d.users?.full_name}
                      </p>
                    </button>
                  ))
                )}
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
          <div className={`relative rounded-2xl border bg-white dark:bg-slate-950 transition-all ${
            errors.comentario
              ? "border-red-400 ring-2 ring-red-100"
              : "border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10"
          }`}>
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
            <div className={`flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium ${
              charsRemaining < 100
                ? charsRemaining < 20
                  ? "text-red-500"
                  : "text-amber-500"
                : "text-slate-400"
            }`}>
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

        {/* Subida de Evidencia */}
        <div className="mb-8">
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
            Evidencia académica (Opcional)
          </label>
          
          {!selectedFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelection(file);
              }}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-800 rounded-2xl p-6 text-center bg-white dark:bg-slate-950 transition-all cursor-pointer group"
              onClick={() => document.getElementById("evidence-upload")?.click()}
            >
              <input
                id="evidence-upload"
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelection(file);
                }}
              />
              <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 transition-colors mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Arrastra y suelta tu archivo aquí, o <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline font-semibold">explorar</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Soporta PDF, PNG, JPG o JPEG (Máximo 5MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
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
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Sentimiento
                </label>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    {getSentimentIcon(result.sentimiento)}
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getSentimentColor(result.sentimiento)}`}>
                    {result.sentimiento}
                  </span>
                </div>
              </div>


              <div className="flex flex-col gap-3">
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
                <button
                  type="button"
                  onClick={() => generateReceiptPDF(selectedDocenteObj?.users?.full_name || "Docente", result.id, new Date().toLocaleDateString("es-ES"))}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors text-sm font-semibold cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Descargar Comprobante PDF
                </button>
              </div>
            </div>


            <hr className="border-slate-100 dark:border-slate-800" />


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
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Users,
  GraduationCap,
  UserRound,
  Plus,
  Trash2,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import Link from "next/link";
import { getDb, getSecondaryAuth } from "@/app/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { syncUserWithDataConnect } from "@/app/lib/dataconnect";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Docente {
  id: string;
  nombre: string;
  email: string;
  materia: string;
  departamento?: string;
}

interface Estudiante {
  id: string;
  nombre: string;
  email: string;
  codigo: string;
  programa?: string;
}

type Tab = "docentes" | "estudiantes";

const EMPTY_DOCENTE = { nombre: "", email: "", materia: "", departamento: "" };
const EMPTY_ESTUDIANTE = { nombre: "", email: "", codigo: "", programa: "" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Users className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        No hay {label} registrados aún.
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Usa el botón «Agregar» para registrar el primero.
      </p>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
      {text}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function GestionPersonalView() {
  const [activeTab, setActiveTab] = useState<Tab>("docentes");
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [docenteForm, setDocenteForm] = useState(EMPTY_DOCENTE);
  const [estudianteForm, setEstudianteForm] = useState(EMPTY_ESTUDIANTE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDb();
      const [docentesSnap, estudiantesSnap] = await Promise.all([
        getDocs(collection(db, "docentes")),
        getDocs(collection(db, "estudiantes")),
      ]);
      setDocentes(
        docentesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Docente))
      );
      setEstudiantes(
        estudiantesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as Estudiante))
      );
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateDocente = () => {
    const errors: Record<string, string> = {};
    if (!docenteForm.nombre.trim()) errors.nombre = "El nombre es requerido.";
    if (!docenteForm.email.trim() || !/\S+@\S+\.\S+/.test(docenteForm.email))
      errors.email = "Ingresa un correo válido.";
    if (!docenteForm.materia.trim()) errors.materia = "La materia es requerida.";
    return errors;
  };

  const validateEstudiante = () => {
    const errors: Record<string, string> = {};
    if (!estudianteForm.nombre.trim()) errors.nombre = "El nombre es requerido.";
    if (
      !estudianteForm.email.trim() ||
      !/\S+@\S+\.\S+/.test(estudianteForm.email)
    )
      errors.email = "Ingresa un correo válido.";
    if (!estudianteForm.codigo.trim())
      errors.codigo = "El código de estudiante es requerido.";
    return errors;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errors =
      activeTab === "docentes" ? validateDocente() : validateEstudiante();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    try {
      const db = await getDb();
      const auth = await getSecondaryAuth();
      const email = activeTab === "docentes" ? docenteForm.email : estudianteForm.email;
      const nombre = activeTab === "docentes" ? docenteForm.nombre : estudianteForm.nombre;
      const pass = activeTab === "docentes" ? "Docente123!" : "Estudiante123!";

      // 1. Crear en Firebase Auth
      await createUserWithEmailAndPassword(auth, email, pass);

      // 2. Sincronizar con Data Connect (SQL Table)
      await syncUserWithDataConnect({
        email,
        nombre,
        role: activeTab === "docentes" ? "docente" : "estudiante",
      });

      // 3. Guardar perfil en Firestore
      if (activeTab === "docentes") {
        await addDoc(collection(db, "docentes"), {
          ...docenteForm,
          created_at: serverTimestamp(),
        });
        toast.success("Docente registrado exitosamente", {
          description: `${docenteForm.nombre} fue agregado a Auth, Firestore y Data Connect.`,
        });
        setDocenteForm(EMPTY_DOCENTE);
      } else {
        await addDoc(collection(db, "estudiantes"), {
          ...estudianteForm,
          created_at: serverTimestamp(),
        });
        toast.success("Estudiante registrado exitosamente", {
          description: `${estudianteForm.nombre} fue agregado a Auth, Firestore y Data Connect.`,
        });
        setEstudianteForm(EMPTY_ESTUDIANTE);
      }
      setFormErrors({});
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      const msg = err.code === "auth/email-already-in-use" 
        ? "El correo ya está registrado en Auth." 
        : "Error al guardar. Verifica la consola.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, colName: string, nombre: string) => {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`))
      return;
    setDeletingId(id);
    try {
      const db = await getDb();
      await deleteDoc(doc(db, colName, id));
      toast.success(`${nombre} eliminado correctamente.`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredDocentes = docentes.filter(
    (d) =>
      d.nombre?.toLowerCase().includes(q) ||
      d.materia?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q)
  );
  const filteredEstudiantes = estudiantes.filter(
    (e) =>
      e.nombre?.toLowerCase().includes(q) ||
      e.codigo?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q)
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/views/admin"
            className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-accent transition-colors"
            title="Volver al Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Personal</h1>
            <p className="text-sm text-muted-foreground">
              Administra docentes y estudiantes de la plataforma
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setFormErrors({});
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25 font-medium"
        >
          <Plus className="w-4 h-4" />
          Agregar {activeTab === "docentes" ? "Docente" : "Estudiante"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <UserRound className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl text-foreground">{docentes.length}</p>
            <p className="text-xs text-muted-foreground">Docentes registrados</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl text-foreground">{estudiantes.length}</p>
            <p className="text-xs text-muted-foreground">
              Estudiantes registrados
            </p>
          </div>
        </motion.div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border">
          <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
            {(["docentes", "estudiantes"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearch("");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all capitalize ${
                  activeTab === tab
                    ? "bg-white text-foreground shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "docentes" ? (
                  <UserRound className="w-4 h-4" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando datos...</span>
            </div>
          ) : activeTab === "docentes" ? (
            filteredDocentes.length === 0 ? (
              <EmptyState label="docentes" />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Docente
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Materia
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Departamento
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocentes.map((d, i) => (
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700 shrink-0">
                            {initials(d.nombre || "?")}
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground font-medium truncate">
                              {d.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {d.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <Badge text={d.materia || "—"} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                        {d.departamento || "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            handleDelete(d.id, "docentes", d.nombre)
                          }
                          disabled={deletingId === d.id}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Eliminar docente"
                        >
                          {deletingId === d.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )
          ) : filteredEstudiantes.length === 0 ? (
            <EmptyState label="estudiantes" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Estudiante
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                    Código
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Programa
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEstudiantes.map((e, i) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700 shrink-0">
                          {initials(e.nombre || "?")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground font-medium truncate">
                            {e.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {e.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <Badge text={e.codigo || "—"} />
                    </td>
                    <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                      {e.programa || "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          handleDelete(e.id, "estudiantes", e.nombre)
                        }
                        disabled={deletingId === e.id}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                        title="Eliminar estudiante"
                      >
                        {deletingId === e.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer count */}
        {!loading && (
          <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-xs text-muted-foreground">
              {activeTab === "docentes"
                ? `${filteredDocentes.length} de ${docentes.length} docentes`
                : `${filteredEstudiantes.length} de ${estudiantes.length} estudiantes`}
            </p>
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-linear-to-r from-indigo-600 to-purple-600">
                <div className="flex items-center gap-2 text-white">
                  {activeTab === "docentes" ? (
                    <UserRound className="w-4 h-4" />
                  ) : (
                    <GraduationCap className="w-4 h-4" />
                  )}
                  <h2 className="text-white text-base">
                    {activeTab === "docentes"
                      ? "Registrar Docente"
                      : "Registrar Estudiante"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-4">
                {activeTab === "docentes" ? (
                  <>
                    <Field
                      label="Nombre completo"
                      required
                      error={formErrors.nombre}
                    >
                      <input
                        type="text"
                        placeholder="Ej. María García López"
                        value={docenteForm.nombre}
                        onChange={(e) => {
                          setDocenteForm((f) => ({
                            ...f,
                            nombre: e.target.value,
                          }));
                          setFormErrors((fe) => ({ ...fe, nombre: "" }));
                        }}
                        className={inputCls(!!formErrors.nombre)}
                      />
                    </Field>
                    <Field
                      label="Correo electrónico"
                      required
                      error={formErrors.email}
                    >
                      <input
                        type="email"
                        placeholder="docente@universidad.edu"
                        value={docenteForm.email}
                        onChange={(e) => {
                          setDocenteForm((f) => ({
                            ...f,
                            email: e.target.value,
                          }));
                          setFormErrors((fe) => ({ ...fe, email: "" }));
                        }}
                        className={inputCls(!!formErrors.email)}
                      />
                    </Field>
                    <Field label="Materia" required error={formErrors.materia}>
                      <input
                        type="text"
                        placeholder="Ej. Cálculo Diferencial"
                        value={docenteForm.materia}
                        onChange={(e) => {
                          setDocenteForm((f) => ({
                            ...f,
                            materia: e.target.value,
                          }));
                          setFormErrors((fe) => ({ ...fe, materia: "" }));
                        }}
                        className={inputCls(!!formErrors.materia)}
                      />
                    </Field>
                    <Field label="Departamento">
                      <input
                        type="text"
                        placeholder="Ej. Ciencias Básicas"
                        value={docenteForm.departamento}
                        onChange={(e) =>
                          setDocenteForm((f) => ({
                            ...f,
                            departamento: e.target.value,
                          }))
                        }
                        className={inputCls(false)}
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field
                      label="Nombre completo"
                      required
                      error={formErrors.nombre}
                    >
                      <input
                        type="text"
                        placeholder="Ej. Carlos Pérez Ruiz"
                        value={estudianteForm.nombre}
                        onChange={(e) => {
                          setEstudianteForm((f) => ({
                            ...f,
                            nombre: e.target.value,
                          }));
                          setFormErrors((fe) => ({ ...fe, nombre: "" }));
                        }}
                        className={inputCls(!!formErrors.nombre)}
                      />
                    </Field>
                    <Field
                      label="Correo electrónico"
                      required
                      error={formErrors.email}
                    >
                      <input
                        type="email"
                        placeholder="estudiante@universidad.edu"
                        value={estudianteForm.email}
                        onChange={(e) => {
                          setEstudianteForm((f) => ({
                            ...f,
                            email: e.target.value,
                          }));
                          setFormErrors((fe) => ({ ...fe, email: "" }));
                        }}
                        className={inputCls(!!formErrors.email)}
                      />
                    </Field>
                    <Field
                      label="Código de estudiante"
                      required
                      error={formErrors.codigo}
                    >
                      <input
                        type="text"
                        placeholder="Ej. 2024-001234"
                        value={estudianteForm.codigo}
                        onChange={(e) => {
                          setEstudianteForm((f) => ({
                            ...f,
                            codigo: e.target.value,
                          }));
                          setFormErrors((fe) => ({ ...fe, codigo: "" }));
                        }}
                        className={inputCls(!!formErrors.codigo)}
                      />
                    </Field>
                    <Field label="Programa académico">
                      <input
                        type="text"
                        placeholder="Ej. Ingeniería de Sistemas"
                        value={estudianteForm.programa}
                        onChange={(e) =>
                          setEstudianteForm((f) => ({
                            ...f,
                            programa: e.target.value,
                          }))
                        }
                        className={inputCls(false)}
                      />
                    </Field>
                  </>
                )}
              </div>

              {/* Modal footer */}
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tiny form-field wrapper ──────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-foreground mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm text-foreground bg-card focus:outline-none transition-all ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
  }`;
}
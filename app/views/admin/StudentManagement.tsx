"use client";

import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  IdCard, 
  Mail, 
  User, 
  X, 
  Check, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "../../lib/supabase";
import { toast } from "sonner";
import { createAuthUser } from "./actions";

interface Estudiante {
  id: number;
  user_id: string;
  codigo_estudiante: string;
  users: {
    email: string;
    full_name: string;
    is_active: boolean;
  };
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Estudiante | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    codigo_estudiante: "",
  });

  const supabase = createClient();

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select(`
          id,
          user_id,
          codigo_estudiante,
          users (
            email,
            full_name,
            is_active
          )
        `)
        .order('id', { ascending: false });

      if (error) throw error;
      setStudents(data as any || []);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error("Error al cargar estudiantes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenModal = (student: Estudiante | null = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        full_name: student.users?.full_name || "",
        email: student.users?.email || "",
        codigo_estudiante: student.codigo_estudiante,
      });
    } else {
      setEditingStudent(null);
      setFormData({
        full_name: "",
        email: "",
        codigo_estudiante: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingStudent) {
        // Update logic
        const { error: userError } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            email: formData.email,
          })
          .eq('id', editingStudent.user_id);

        if (userError) throw userError;

        const { error: studentError } = await supabase
          .from('estudiantes')
          .update({
            codigo_estudiante: formData.codigo_estudiante,
          })
          .eq('id', editingStudent.id);

        if (studentError) throw studentError;

        toast.success("Estudiante actualizado correctamente");
      } else {
        // Create logic using Server Action to register in Auth
        const result = await createAuthUser({
          email: formData.email,
          full_name: formData.full_name,
          role: "estudiante",
          codigo_o_depto: formData.codigo_estudiante
        });

        if (!result.success) throw new Error(result.error);

        toast.success("Estudiante creado", {
          description: "Registrado en Auth y base de datos. Contraseña: testuser"
        });
      }

      handleCloseModal();
      fetchStudents();
    } catch (error: any) {
      console.error("Error submitting student:", error);
      toast.error(error.message || "Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este estudiante?")) return;

    try {
      const { error } = await supabase
        .from('estudiantes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await supabase.from('users').delete().eq('id', userId);

      setStudents(students.filter(s => s.id !== id));
      toast.success("Estudiante eliminado");
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error("Error al eliminar estudiante");
    }
  };

  const filteredStudents = students.filter(s => 
    s.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.codigo_estudiante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Estudiante</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-slate-500 mt-2">Cargando estudiantes...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron estudiantes.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {student.users?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{student.users?.full_name || "Estudiante"}</p>
                          <p className="text-xs text-slate-500">{student.users?.email || "Sin correo"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        <IdCard className="w-3 h-3" />
                        {student.codigo_estudiante}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.users?.is_active 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {student.users?.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(student)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id, student.user_id)}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {editingStudent ? "Editar Estudiante" : "Nuevo Estudiante"}
                </h3>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Ej. Juan Pérez"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="juan@universidad.edu"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Código de Estudiante</label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.codigo_estudiante}
                      onChange={(e) => setFormData({...formData, codigo_estudiante: e.target.value})}
                      placeholder="Ej. 2024001"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                {!editingStudent && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="text-xs text-amber-800 dark:text-amber-300">
                      <p className="font-bold">Contraseña predeterminada</p>
                      <p>Se asignará <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">testuser</code> como contraseña inicial.</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-70 transition-all font-medium shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {editingStudent ? "Guardar Cambios" : "Crear Estudiante"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

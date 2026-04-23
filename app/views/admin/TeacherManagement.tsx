"use client";

import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Briefcase, 
  Mail, 
  User, 
  X, 
  Check, 
  Loader2,
  AlertCircle,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "../../lib/supabase";
import { toast } from "sonner";
import { createAuthUser } from "./actions";

interface Departamento {
  id: number;
  nombre: string;
}

interface Docente {
  id: number;
  user_id: string;
  departamento_id: number | null;
  departamentos: {
    nombre: string;
  } | null;
  users: {
    email: string;
    full_name: string;
    is_active: boolean;
  };
}

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Docente[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Docente | null>(null);


  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    departamento_id: "",
  });

  const supabase = createClient();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch teachers
      const { data: teachersData, error: tError } = await supabase
        .from('docentes')
        .select(`
          id,
          user_id,
          departamento_id,
          departamentos (
            nombre
          ),
          users (
            email,
            full_name,
            is_active
          )
        `)
        .order('id', { ascending: false });

      if (tError) throw tError;
      setTeachers(teachersData as any || []);

      // Fetch departments
      const { data: deptData, error: dError } = await supabase
        .from('departamentos')
        .select('id, nombre');
      
      if (dError) throw dError;
      setDepartamentos(deptData || []);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (teacher: Docente | null = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        full_name: teacher.users?.full_name || "",
        email: teacher.users?.email || "",
        departamento_id: teacher.departamento_id?.toString() || "",
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        full_name: "",
        email: "",
        departamento_id: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTeacher) {
        // Update users table
        const { error: userError } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            email: formData.email,
          })
          .eq('id', editingTeacher.user_id);

        if (userError) throw userError;

        // Update docentes table
        const { error: teacherError } = await supabase
          .from('docentes')
          .update({
            departamento_id: formData.departamento_id ? parseInt(formData.departamento_id) : null,
          })
          .eq('id', editingTeacher.id);

        if (teacherError) throw teacherError;

        toast.success("Docente actualizado correctamente");
      } else {
        // Create logic using Server Action to register in Auth
        const result = await createAuthUser({
          email: formData.email,
          full_name: formData.full_name,
          role: "docente",
          codigo_o_depto: formData.departamento_id
        });

        if (!result.success) throw new Error(result.error);

        toast.success("Docente creado", {
          description: "Registrado en Auth y base de datos. Contraseña: testuser"
        });
      }

      handleCloseModal();
      fetchData();
    } catch (error: any) {
      console.error("Error submitting teacher:", error);
      toast.error(error.message || "Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este docente?")) return;

    try {
      const { error } = await supabase
        .from('docentes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await supabase.from('users').delete().eq('id', userId);

      setTeachers(teachers.filter(t => t.id !== id));
      toast.success("Docente eliminado");
    } catch (error: any) {
      console.error("Error deleting teacher:", error);
      toast.error("Error al eliminar docente");
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.departamentos?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o departamento..."
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
          <span>Nuevo Docente</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Docente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Departamento</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-slate-500 mt-2">Cargando docentes...</p>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron docentes.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                          {teacher.users?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{teacher.users?.full_name || "Docente"}</p>
                          <p className="text-xs text-slate-500">{teacher.users?.email || "Sin correo"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        <Building2 className="w-3 h-3" />
                        {teacher.departamentos?.nombre || 'Sin asignar'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teacher.users?.is_active 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {teacher.users?.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(teacher)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(teacher.id, teacher.user_id)}
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

      {/* Modal de Creación/Edición */}
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
                  {editingTeacher ? "Editar Docente" : "Nuevo Docente"}
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
                      placeholder="Ej. Dr. Armando Paredes"
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
                      placeholder="armando@universidad.edu"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Departamento</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={formData.departamento_id}
                      onChange={(e) => setFormData({...formData, departamento_id: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none text-slate-900 dark:text-white"
                    >
                      <option value="">Seleccionar departamento</option>
                      {departamentos.map(d => (
                         <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!editingTeacher && (
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
                    {editingTeacher ? "Guardar Cambios" : "Crear Docente"}
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

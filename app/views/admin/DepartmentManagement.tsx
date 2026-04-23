"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Building2, 
  Loader2, 
  X, 
  Check 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "../../lib/supabase";
import { toast } from "sonner";

interface Departamento {
  id: number;
  nombre: string;
}

export default function DepartmentManagement() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nombre, setNombre] = useState("");

  const supabase = createClient();

  const fetchDepartamentos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('departamentos')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setDepartamentos(data || []);
    } catch (error: any) {
      console.error("Error fetching depts:", error);
      toast.error("Error al cargar departamentos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('departamentos')
        .insert([{ nombre: nombre.trim() }]);

      if (error) throw error;

      toast.success("Departamento creado exitosamente");
      setNombre("");
      setIsModalOpen(false);
      fetchDepartamentos();
    } catch (error: any) {
      toast.error("Error al crear departamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este departamento? Los docentes asociados quedarán sin departamento.")) return;

    try {
      const { error } = await supabase
        .from('departamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDepartamentos(departamentos.filter(d => d.id !== id));
      toast.success("Departamento eliminado");
    } catch (error: any) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Departamentos</h2>
          <p className="text-sm text-slate-500">Gestión de unidades académicas</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Departamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))
        ) : departamentos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            No hay departamentos registrados.
          </div>
        ) : (
          departamentos.map((dept) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={dept.id}
              className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-all">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{dept.nombre}</span>
              </div>
              <button
                onClick={() => handleDelete(dept.id)}
                className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Crear Departamento</h3>
                  <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Nombre del área</label>
                    <input
                      autoFocus
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Facultad de Ingeniería"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    disabled={isSubmitting}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Confirmar Registro
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

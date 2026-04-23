-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.periodos_academicos ENABLE ROW LEVEL SECURITY;

-- 2. Función para obtener el rol actual del usuario desde la tabla public.users
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-----------------------------------------------------------
-- POLÍTICAS PARA LA TABLA 'users'
-----------------------------------------------------------
-- Los admins pueden hacer todo
CREATE POLICY "Admins full access" ON public.users 
FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT TO authenticated USING (auth.uid() = id);

-----------------------------------------------------------
-- POLÍTICAS PARA 'departamentos'
-----------------------------------------------------------
-- Lectura pública para todos los autenticados
CREATE POLICY "Anyone authenticated can view depts" ON public.departamentos
FOR SELECT TO authenticated USING (true);

-- Solo admins pueden insertar/editar/borrar
CREATE POLICY "Admins can manage depts" ON public.departamentos
FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-----------------------------------------------------------
-- POLÍTICAS PARA 'estudiantes'
-----------------------------------------------------------
CREATE POLICY "Admins manage estudiantes" ON public.estudiantes
FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Estudiantes see own data" ON public.estudiantes
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-----------------------------------------------------------
-- POLÍTICAS PARA 'docentes'
-----------------------------------------------------------
CREATE POLICY "Admins manage docentes" ON public.docentes
FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Anyone see docentes" ON public.docentes
FOR SELECT TO authenticated USING (true);

-----------------------------------------------------------
-- POLÍTICAS PARA 'periodos_academicos'
-----------------------------------------------------------
CREATE POLICY "Admins manage periods" ON public.periodos_academicos
FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Anyone see active periods" ON public.periodos_academicos
FOR SELECT TO authenticated USING (true);

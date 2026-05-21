-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periodos_academicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docente_materia_periodo ENABLE ROW LEVEL SECURITY;

-- 2. Función para obtener el rol actual del usuario desde la tabla public.users
-- Definida con SECURITY DEFINER para evitar recursión infinita en las políticas de RLS
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-----------------------------------------------------------
-- POLÍTICAS PARA LA TABLA 'users'
-----------------------------------------------------------
-- Los admins pueden hacer todo
CREATE POLICY "Admins full access on users" ON public.users 
FOR ALL TO authenticated USING (
  get_current_user_role() = 'admin'
);

-- Los usuarios pueden ver su propio perfil, o cualquier docente (para que estudiantes/docentes listen docentes)
CREATE POLICY "Users can view own profile or docentes" ON public.users 
FOR SELECT TO authenticated USING (
  auth.uid() = id OR role = 'docente' OR get_current_user_role() = 'admin'
);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE TO authenticated USING (
  auth.uid() = id
) WITH CHECK (
  auth.uid() = id
);

-----------------------------------------------------------
-- POLÍTICAS PARA 'departamentos'
-----------------------------------------------------------
-- Lectura pública para todos los autenticados
CREATE POLICY "Anyone authenticated can view depts" ON public.departamentos
FOR SELECT TO authenticated USING (true);

-- Solo admins pueden insertar/editar/borrar
CREATE POLICY "Admins can manage depts" ON public.departamentos
FOR ALL TO authenticated USING (
  get_current_user_role() = 'admin'
);

-----------------------------------------------------------
-- POLÍTICAS PARA 'materias'
-----------------------------------------------------------
-- Lectura pública para todos los autenticados
CREATE POLICY "Anyone authenticated can view materias" ON public.materias
FOR SELECT TO authenticated USING (true);

-- Solo admins pueden insertar/editar/borrar
CREATE POLICY "Admins can manage materias" ON public.materias
FOR ALL TO authenticated USING (
  get_current_user_role() = 'admin'
);

-----------------------------------------------------------
-- POLÍTICAS PARA 'periodos_academicos'
-----------------------------------------------------------
-- Lectura pública para todos los autenticados
CREATE POLICY "Anyone see active periods" ON public.periodos_academicos
FOR SELECT TO authenticated USING (true);

-- Solo admins pueden insertar/editar/borrar
CREATE POLICY "Admins manage periods" ON public.periodos_academicos
FOR ALL TO authenticated USING (
  get_current_user_role() = 'admin'
);

-----------------------------------------------------------
-- POLÍTICAS PARA 'estudiantes'
-----------------------------------------------------------
CREATE POLICY "Admins manage estudiantes" ON public.estudiantes
FOR ALL TO authenticated USING (
  get_current_user_role() = 'admin'
);

CREATE POLICY "Estudiantes see own data" ON public.estudiantes
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-----------------------------------------------------------
-- POLÍTICAS PARA 'docentes'
-----------------------------------------------------------
CREATE POLICY "Admins manage docentes" ON public.docentes
FOR ALL TO authenticated USING (
  get_current_user_role() = 'admin'
);

CREATE POLICY "Anyone see docentes" ON public.docentes
FOR SELECT TO authenticated USING (true);

-----------------------------------------------------------
-- POLÍTICAS PARA 'docente_materia_periodo'
-----------------------------------------------------------
-- Lectura pública para todos los autenticados
CREATE POLICY "Anyone see docente_materia_periodo" ON public.docente_materia_periodo
FOR SELECT TO authenticated USING (true);

-- Solo admins pueden insertar/editar/borrar
CREATE POLICY "Admins manage docente_materia_periodo" ON public.docente_materia_periodo
FOR ALL TO authenticated USING (
  get_current_user_role() = 'admin'
);

-----------------------------------------------------------
-- POLÍTICAS PARA 'evaluaciones'
-----------------------------------------------------------
-- Los admins pueden hacer todo
CREATE POLICY "Admins manage evaluaciones" ON public.evaluaciones
FOR ALL TO authenticated USING (
  get_current_user_role() = 'admin'
);

-- Los docentes pueden ver sus propias evaluaciones
CREATE POLICY "Docentes view own evaluations" ON public.evaluaciones
FOR SELECT TO authenticated USING (
  docente_id IN (
    SELECT id FROM public.docentes WHERE user_id = auth.uid()
  )
);

-- Los estudiantes pueden insertar evaluaciones
CREATE POLICY "Estudiantes insert evaluations" ON public.evaluaciones
FOR INSERT TO authenticated WITH CHECK (
  get_current_user_role() = 'estudiante'
);

-- Migration: Add student evidence field to evaluations

-- 1. Add evidencia_url to keep track of uploaded files in evaluations
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS evidencia_url TEXT;

-- 1. Asegurar que las políticas no existan previamente para evitar duplicados
DROP POLICY IF EXISTS "Permitir subida de evidencias" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura de evidencias" ON storage.objects;

-- 2. Política de INSERCIÓN (Permitir subidas al bucket específico)
-- Permite que cualquiera (público/anónimo) suba archivos, siempre y cuando vayan a tu bucket
CREATE POLICY "Permitir subida de evidencias" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'evaluaciones-evidencias');

-- 3. Política de SELECCIÓN (Permitir lectura/descarga pública)
-- Permite que cualquiera pueda ver o descargar los archivos de este bucket
CREATE POLICY "Permitir lectura de evidencias" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'evaluaciones-evidencias');
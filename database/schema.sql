-- Base schema for Evaluacion Docente (PostgreSQL)
-- This file is intentionally simple and ready to evolve.

BEGIN;

-- Optional extension for case-insensitive email uniqueness.
CREATE EXTENSION IF NOT EXISTS citext;

-- ===== Enums =====
CREATE TYPE role_type AS ENUM ('admin', 'docente', 'estudiante');
CREATE TYPE sentimiento_type AS ENUM ('positivo', 'neutro', 'negativo');

-- ===== Core identities =====
CREATE TABLE users (
  id VARCHAR(128) PRIMARY KEY, -- Firebase UID
  email CITEXT NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  role role_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Academic structure =====
CREATE TABLE departamentos (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE materias (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  departamento_id BIGINT REFERENCES departamentos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE periodos_academicos (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE, -- e.g. 2026-1
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'abierto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT periodos_fechas_validas CHECK (fecha_inicio < fecha_fin)
);

-- ===== Role-specific profiles =====
CREATE TABLE docentes (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  departamento_id BIGINT REFERENCES departamentos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE estudiantes (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  codigo_estudiante VARCHAR(30) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Many-to-many: docentes assigned to materias by period.
CREATE TABLE docente_materia_periodo (
  id BIGSERIAL PRIMARY KEY,
  docente_id BIGINT NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
  materia_id BIGINT NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  periodo_id BIGINT NOT NULL REFERENCES periodos_academicos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (docente_id, materia_id, periodo_id)
);

-- ===== Main business table =====
CREATE TABLE evaluaciones (
  id BIGSERIAL PRIMARY KEY,
  docente_id BIGINT NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
  periodo_id BIGINT NOT NULL REFERENCES periodos_academicos(id) ON DELETE CASCADE,
  materia_id BIGINT REFERENCES materias(id) ON DELETE SET NULL,
  -- Keep anonymous by default; set if you later want traceability.
  estudiante_id BIGINT REFERENCES estudiantes(id) ON DELETE SET NULL,
  comentario TEXT NOT NULL,
  sentimiento sentimiento_type,
  resumen_nlp TEXT,
  referencia_publica VARCHAR(80) UNIQUE, -- e.g. EVAL-XXXX
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Useful indexes =====
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_evaluaciones_docente_periodo ON evaluaciones(docente_id, periodo_id);
CREATE INDEX idx_evaluaciones_periodo ON evaluaciones(periodo_id);
CREATE INDEX idx_dmp_periodo ON docente_materia_periodo(periodo_id);

COMMIT;

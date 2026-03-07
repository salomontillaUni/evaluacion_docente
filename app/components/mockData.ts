export const docentes = [
  { id: "DOC-001", nombre: "Dra. María García López", materia: "Inteligencia Artificial", departamento: "Ciencias de la Computación" },
  { id: "DOC-002", nombre: "Dr. Carlos Hernández Ruiz", materia: "Bases de Datos Avanzadas", departamento: "Sistemas de Información" },
  { id: "DOC-003", nombre: "Ing. Ana Torres Mendoza", materia: "Ingeniería de Software", departamento: "Ingeniería de Software" },
  { id: "DOC-004", nombre: "Dr. Roberto Jiménez Paredes", materia: "Redes y Comunicaciones", departamento: "Telecomunicaciones" },
  { id: "DOC-005", nombre: "Mtra. Laura Sánchez Vega", materia: "Estadística Computacional", departamento: "Matemáticas Aplicadas" },
  { id: "DOC-006", nombre: "Dr. Fernando Castillo Díaz", materia: "Sistemas Operativos", departamento: "Ciencias de la Computación" },
];

export const periodosAcademicos = [
  { id: "2026-1", label: "2026 - Primer Semestre" },
  { id: "2025-2", label: "2025 - Segundo Semestre" },
  { id: "2025-1", label: "2025 - Primer Semestre" },
  { id: "2024-2", label: "2024 - Segundo Semestre" },
];

export const comentariosDocente = [
  {
    id: "COM-001",
    comentario: "La profesora García explica de manera muy clara y utiliza ejemplos prácticos que facilitan el aprendizaje. Sus clases son dinámicas y motivadoras.",
    resumen: "Excelente comunicación y metodología práctica en clase.",
    sentimiento: "Positivo" as const,
    fecha: "2026-02-15",
  },
  {
    id: "COM-002",
    comentario: "A veces las tareas son demasiado complicadas y no se explican bien los criterios de evaluación. Me gustaría más retroalimentación en los proyectos.",
    resumen: "Necesita mejorar claridad en criterios de evaluación y retroalimentación.",
    sentimiento: "Negativo" as const,
    fecha: "2026-02-18",
  },
  {
    id: "COM-003",
    comentario: "Las clases son regulares, el contenido se cubre según el programa. El material de apoyo está disponible en la plataforma.",
    resumen: "Cumple con el programa sin elementos destacables.",
    sentimiento: "Neutro" as const,
    fecha: "2026-02-20",
  },
  {
    id: "COM-004",
    comentario: "Excelente docente, siempre disponible para resolver dudas fuera de clase. Los laboratorios son muy enriquecedores y bien organizados.",
    resumen: "Alta disponibilidad y laboratorios de calidad.",
    sentimiento: "Positivo" as const,
    fecha: "2026-02-22",
  },
  {
    id: "COM-005",
    comentario: "El ritmo de la clase es adecuado. Sin embargo, sería bueno incluir más proyectos colaborativos para mejorar el aprendizaje en equipo.",
    resumen: "Buen ritmo, sugiere más trabajo colaborativo.",
    sentimiento: "Neutro" as const,
    fecha: "2026-02-25",
  },
  {
    id: "COM-006",
    comentario: "No me pareció justo el sistema de calificaciones. Los exámenes no reflejan lo que se ve en clase y la comunicación es deficiente.",
    resumen: "Incongruencia entre clases y evaluaciones, mala comunicación.",
    sentimiento: "Negativo" as const,
    fecha: "2026-03-01",
  },
];

export const sentimientosDistribucion = [
  { name: "Positivo", porcentaje: 45, fill: "#22c55e" },
  { name: "Neutro", porcentaje: 30, fill: "#eab308" },
  { name: "Negativo", porcentaje: 25, fill: "#ef4444" },
];

export const tendenciasMensuales = [
  { mes: "Sep", positivo: 40, neutro: 35, negativo: 25 },
  { mes: "Oct", positivo: 42, neutro: 33, negativo: 25 },
  { mes: "Nov", positivo: 48, neutro: 30, negativo: 22 },
  { mes: "Dic", positivo: 44, neutro: 32, negativo: 24 },
  { mes: "Ene", positivo: 50, neutro: 28, negativo: 22 },
  { mes: "Feb", positivo: 45, neutro: 30, negativo: 25 },
  { mes: "Mar", positivo: 52, neutro: 27, negativo: 21 },
];

export const metricasAdmin = {
  totalEvaluaciones: 1247,
  docentesEvaluados: 42,
  promedioGeneral: 4.2,
  tasaParticipacion: 78.5,
};

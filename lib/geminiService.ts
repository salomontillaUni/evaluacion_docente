import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Interfaz para la respuesta estructurada de Gemini
interface GeminiAnalysisResponse {
  sentimiento: 'positivo' | 'neutro' | 'negativo';
  resumen: string;
}

/**
 * Realiza un análisis heurístico local como fallback cuando la API no está disponible o falla.
 */
function localHeuristicAnalysis(comentario: string, docenteNombre?: string): GeminiAnalysisResponse {
  const text = comentario.toLowerCase();
  
  const positiveKeywords = [
    'excelente', 'bueno', 'buena', 'gran', 'mejor', 'recomiendo', 'dinamico', 'dinámica',
    'claridad', 'comprensible', 'dedicado', 'organizado', 'amable', 'empatia', 'empatía',
    'ayuda', 'gusta', 'gracias', 'facilita', 'domina', 'explicacion', 'explicación', 'perfecto'
  ];
  
  const negativeKeywords = [
    'malo', 'deficiente', 'pesimo', 'pésimo', 'impuntual', 'tarde', 'grosero', 'dificil',
    'difícil', 'complicado', 'rapido', 'rápido', 'aburrido', 'desorganizado', 'injusto',
    'no explica', 'no se entiende', 'falta', 'mucha tarea', 'estricto', 'gritar', 'exige'
  ];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveKeywords.forEach(word => {
    if (text.includes(word)) positiveScore++;
  });
  
  negativeKeywords.forEach(word => {
    if (text.includes(word)) negativeScore++;
  });
  
  const nombreDocente = docenteNombre || 'el docente';
  let sentimiento: 'positivo' | 'neutro' | 'negativo' = 'neutro';
  let resumen = '';
  
  if (positiveScore > negativeScore) {
    sentimiento = 'positivo';
    resumen = `El comentario expresa una opinión favorable sobre el desempeño de ${nombreDocente}. Se reconocen fortalezas significativas en su claridad explicativa, metodología didáctica y empatía hacia los estudiantes, lo cual fomenta un excelente ambiente escolar.`;
  } else if (negativeScore > positiveScore) {
    sentimiento = 'negativo';
    resumen = `El comentario señala áreas de oportunidad para ${nombreDocente}, mencionando aspectos específicos a mejorar como el ritmo de las clases, la claridad en las explicaciones o la puntualidad. Se recomienda prestar atención a estas observaciones para el desarrollo docente.`;
  } else {
    sentimiento = 'neutro';
    resumen = `El comentario presenta observaciones generales u opiniones neutras sobre las clases de ${nombreDocente}. No se detectan inclinaciones marcadas, sugiriendo una experiencia de aprendizaje regular o una mezcla de aspectos positivos y por mejorar.`;
  }
  
  return { sentimiento, resumen };
}

/**
 * Función para analizar un comentario de evaluación docente usando la API de Gemini (con fallback local).
 */
export const queryGemini = async (comentario: string, docenteNombre?: string): Promise<GeminiAnalysisResponse> => {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY no configurado. Utilizando análisis heurístico local de respaldo.');
    return localHeuristicAnalysis(comentario, docenteNombre);
  }
  
  try {
    const model = 'gemini-3.1-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    const systemPrompt = `Eres un sistema experto en análisis de sentimientos y retroalimentación académica.
Analizarás el comentario de evaluación docente de un estudiante sobre el docente "${docenteNombre || 'el docente'}" y proporcionarás:
1. El sentimiento general del comentario ("positivo", "neutro", "negativo").
2. Un resumen y retroalimentación profesional y constructivo en español para mostrarle al estudiante como feedback.

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "sentimiento": "positivo" | "neutro" | "negativo",
  "resumen": "string conteniendo el resumen y feedback constructivo en español"
}

Asegúrate de que el campo "sentimiento" sea exactamente una de estas tres opciones en minúsculas: "positivo", "neutro" o "negativo".
El campo "resumen" debe ser un texto profesional, de 2 a 4 oraciones en español, que capture la esencia de la retroalimentación y proporcione un feedback constructivo.
No incluyas markdown, bloques de código (como \`\`\`json) ni caracteres adicionales fuera del JSON.`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nComentario a analizar: "${comentario}"`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error('Respuesta vacía o formato inválido de la API de Gemini');
    }
    
    const parsedData: GeminiAnalysisResponse = JSON.parse(textResponse.trim());
    
    // Validar el formato retornado
    if (
      (parsedData.sentimiento === 'positivo' || parsedData.sentimiento === 'neutro' || parsedData.sentimiento === 'negativo') &&
      typeof parsedData.resumen === 'string'
    ) {
      return parsedData;
    }
    
    throw new Error('La respuesta de Gemini no coincide con el formato esperado');
    
  } catch (error) {
    console.error('Error al consultar el modelo Gemini (se usará el fallback):', error);
    return localHeuristicAnalysis(comentario, docenteNombre);
  }
};
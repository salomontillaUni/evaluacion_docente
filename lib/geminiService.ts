import axios from 'axios';

// Configuración de la API de Gemini
const GEMINI_API_URL = 'https://api.gemini.example.com/v1/models/gemini-2-flash'; // Reemplaza con la URL real
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Asegúrate de configurar esta variable de entorno

// Cliente para interactuar con el modelo Gemini
const geminiClient = axios.create({
  baseURL: GEMINI_API_URL,
  headers: {
    'Authorization': `Bearer ${GEMINI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Función para enviar una solicitud al modelo Gemini
export const queryGemini = async (prompt: string): Promise<any> => {
  try {
    const response = await geminiClient.post('/query', {
      prompt,
    });
    return response.data;
  } catch (error) {
    console.error('Error al consultar el modelo Gemini:', error);
    throw error;
  }
};

// Ejemplo de uso
// (async () => {
//   const result = await queryGemini('Escribe un poema sobre la naturaleza.');
//   console.log(result);
// })();
// backend_node/services/ia.service.js
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analizarReclamoConIA = async (descripcion) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Analiza el siguiente reclamo ciudadano y devuelve un objeto JSON con una prioridad sugerida (BAJA, MEDIA, ALTA, CRITICA) y un resumen ejecutivo corto de máximo 15 palabras.
        
        Reclamo: "${descripcion}"
        
        Responde exclusivamente en formato JSON estricto con las claves "prioridad" y "resumen".`
    });

    // Limpiamos el formato Markdown si la respuesta incluye ```json
    const textoLimpio = response.text.replace(/```json|```/g, '').trim();
    return JSON.parse(textoLimpio);
};
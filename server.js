/**
 * @fileoverview Servidor backend para el Asistente de Código con IA.
 * Este servidor actúa como un proxy seguro para la API de Google Gemini,
 * protegiendo la clave de API de ser expuesta en el frontend.
 *
 * Para ejecutar este servidor:
 * 1. Asegúrate de tener Node.js instalado.
 * 2. Crea un archivo 'package.json' en la misma carpeta con:
 * {
 * "name": "ai-code-assistant-backend",
 * "version": "1.0.0",
 * "description": "Backend proxy for AI Code Assistant",
 * "main": "server.js",
 * "scripts": {
 * "start": "node server.js"
 * },
 * "dependencies": {
 * "express": "^4.19.2",
 * "cors": "^2.8.5",
 * "dotenv": "^16.4.5"
 * }
 * }
 * 3. Ejecuta `npm install` en tu terminal para instalar las dependencias.
 * 4. Crea un archivo `.env` en la misma carpeta con:
 * GOOGLE_API_KEY="TU_CLAVE_DE_API_DE_GEMINI_AQUI"
 * 5. Ejecuta `node server.js` o `npm start` en tu terminal.
 */

// Importa las librerías necesarias
const express = require('express'); // Framework web para Node.js
const cors = require('cors');       // Middleware para habilitar CORS (Cross-Origin Resource Sharing)
require('dotenv').config();         // Carga variables de entorno desde un archivo .env

// Crea una instancia de la aplicación Express
const app = express();
// Define el puerto en el que el servidor escuchará. Usa el puerto proporcionado por el entorno (ej. en servicios de hosting) o 3000 por defecto.
const PORT = process.env.PORT || 3000;

// Middleware
// Habilita CORS para permitir que tu frontend (en GitHub Pages) pueda hacer solicitudes a este backend.
// En un entorno de producción, deberías restringir esto a tu dominio específico (ej. origin: 'https://marcosnapo.github.io').
app.use(cors());
// Permite que Express parseé el cuerpo de las solicitudes como JSON.
app.use(express.json());

// Obtiene la clave de API de Google Gemini desde las variables de entorno.
// Esto es crucial para la seguridad, ya que la clave no está en el código fuente público.
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Verifica si la clave de API está configurada. Si no, el servidor no debería iniciar.
if (!GOOGLE_API_KEY) {
    console.error("Error: La variable de entorno GOOGLE_API_KEY no está configurada.");
    console.error("Por favor, crea un archivo .env en la raíz del proyecto con GOOGLE_API_KEY='TU_CLAVE_AQUI'.");
    process.exit(1); // Sale del proceso con un error
}

/**
 * Ruta POST para manejar las solicitudes de explicación/documentación de código.
 * Recibe el prompt y el código del frontend, hace la llamada a la API de Gemini,
 * y envía la respuesta de vuelta al frontend.
 */
app.post('/process-code', async (req, res) => {
    // Extrae el prompt y el código del cuerpo de la solicitud JSON.
    const { promptText, code } = req.body;

    // Valida que se hayan proporcionado ambos, promptText y code.
    if (!promptText || !code) {
        return res.status(400).json({ error: "Faltan 'promptText' o 'code' en la solicitud." });
    }

    try {
        // Prepara el historial de chat para la API de Gemini.
        // El prompt y el código se combinan en un solo mensaje de usuario.
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: promptText + "\n\nCódigo:\n```\n" + code + "\n```" }] });

        // Prepara el payload para la solicitud a la API de Gemini.
        const payload = { contents: chatHistory };
        // Define la URL de la API de Gemini.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;

        // Realiza la solicitud POST a la API de Gemini.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Parsea la respuesta de la API de Gemini como JSON.
        const result = await response.json();

        // Verifica si la respuesta de Gemini es válida y contiene el texto generado.
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            // Envía el texto generado por la IA de vuelta al frontend.
            res.json({ success: true, generatedText: text });
        } else {
            // Si la respuesta de Gemini no es la esperada, envía un error al frontend.
            console.error("Respuesta inesperada de la API de Gemini:", result);
            res.status(500).json({ error: "No se pudo obtener una respuesta válida de la IA." });
        }
    } catch (error) {
        // Captura cualquier error durante el proceso (ej. problemas de red, errores de la API).
        console.error("Error al procesar la solicitud con la IA:", error);
        res.status(500).json({ error: "Ocurrió un error al comunicarse con la IA. Por favor, inténtalo de nuevo." });
    }
});

// Inicia el servidor y lo pone a escuchar en el puerto definido.
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
    console.log("¡Listo para recibir solicitudes de tu frontend!");
});

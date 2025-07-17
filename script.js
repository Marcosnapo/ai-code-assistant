/**
 * @fileoverview Lógica principal para el Asistente de Código con IA.
 * Handles user interactions and future integration with the AI API.
 */

// Obtener referencias a los elementos del DOM
const codeInput = document.getElementById('codeInput');
const explainButton = document.getElementById('explainButton');
const documentButton = document.getElementById('documentButton');
const outputArea = document.getElementById('outputArea');

// Variable para almacenar la clave de la API (null)
const API_KEY = "";//
/**
 * Muestra un mensaje de carga en el área de salida.
 */
function showLoading() {
    outputArea.textContent = "Thinking... Please wait, AI needs time too.";
    outputArea.style.color = "#007bff"; // Color azul para el mensaje de carga
}

/**
 * Muestra un mensaje de error en el área de salida.
 * @param {string} message El mensaje de error a mostrar.
 */
function showErrorMessage(message) {
    outputArea.textContent = `Error: ${message}`;
    outputArea.style.color = "#dc3545"; // Color rojo para el mensaje de error
}

/**
 * Procesa el código ingresado por el usuario utilizando la API de IA.
 * @param {string} promptText El texto del prompt a enviar a la IA.
 */
async function processCodeWithAI(promptText) {
    const code = codeInput.value.trim(); // Obtener el código del textarea y limpiar espacios
    if (!code) {
        showErrorMessage("Please, introduce any code to start.");
        return;
    }

    showLoading(); // Mostrar mensaje de carga

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: promptText + "\n\nCódigo:\n```\n" + code + "\n```" }] });

        const payload = { contents: chatHistory };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            outputArea.textContent = text;
            outputArea.style.color = "#333"; // Restaurar color normal
        } else {
            showErrorMessage("IA not found, try again");
            console.error("No spected answer of API:", result);
        }
    } catch (error) {
        showErrorMessage("An error occurred while communicating with the AI. Please check your connection..");
        console.error("Error in API call:", error);
    }
}

// Añadir escuchadores de eventos a los botones
explainButton.addEventListener('click', () => {
    processCodeWithAI("Explain the following code in detail, line by line, and its general purpose. Use clear and concise language:");
});

documentButton.addEventListener('click', () => {
    processCodeWithAI("Generate documentation for the following code. Include an overview, parameters (if applicable), and a usage example. Format the documentation professionally.:");
});

// Inicializar el área de salida con un mensaje de bienvenida
outputArea.textContent = "Ready to help you with your code. Paste your code above and click the button.";
outputArea.style.color = "#666";

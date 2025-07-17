/**
 * @fileoverview Lógica principal para el Asistente de Código con IA.
 * Maneja las interacciones del usuario y la comunicación con el servidor backend
 * para procesar el código de forma segura.
 */

// Obtener referencias a los elementos del DOM
const codeInput = document.getElementById('codeInput');
const explainButton = document.getElementById('explainButton');
const documentButton = document.getElementById('documentButton');
const outputArea = document.getElementById('outputArea');

const BACKEND_URL = "https://backend-sparkling-brook-1872.fly.dev/"

/**
 * Muestra un mensaje de carga en el área de salida.
 */
function showLoading() {
    outputArea.textContent = "Pensando... Por favor, espera un momento...";
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
 * Procesa el código ingresado por el usuario enviándolo al servidor backend.
 * @param {string} promptText El texto del prompt a enviar a la IA (a través del backend).
 */
async function processCodeWithAI(promptText) {
    const code = codeInput.value.trim(); // Obtener el código del textarea y limpiar espacios
    if (!code) {
        showErrorMessage("Por favor, introduce algún código para procesar.");
        return;
    }

    showLoading(); // Mostrar mensaje de carga

    try {
        // Realiza una solicitud POST a tu propio backend.
        // El cuerpo de la solicitud contiene el prompt y el código.
        const response = await fetch(`${BACKEND_URL}/process-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ promptText, code }) // Envía el prompt y el código como JSON
        });

        // Verifica si la respuesta del backend fue exitosa (código de estado 2xx).
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }

        // Parsea la respuesta del backend.
        const result = await response.json();

        // Muestra el texto generado por la IA en el área de salida.
        if (result.success && result.generatedText) {
            outputArea.textContent = result.generatedText;
            outputArea.style.color = "#333"; // Restaurar color normal
        } else {
            // Si la respuesta del backend no es la esperada, muestra un error.
            showErrorMessage("No se pudo obtener una respuesta válida de la IA a través del backend.");
            console.error("Respuesta inesperada del backend:", result);
        }
    } catch (error) {
        // Captura cualquier error durante la comunicación con el backend.
        showErrorMessage(`Ocurrió un error: ${error.message}. Asegúrate de que el backend esté funcionando.`);
        console.error("Error en la llamada al backend:", error);
    }
}

// Añadir escuchadores de eventos a los botones
explainButton.addEventListener('click', () => {
    processCodeWithAI("Explica el siguiente código en detalle, línea por línea, y su propósito general. Usa un lenguaje claro y conciso:");
});

documentButton.addEventListener('click', () => {
    processCodeWithAI("Genera la documentación para el siguiente código. Incluye una descripción general, parámetros (si aplica) y un ejemplo de uso. Formatea la documentación de manera profesional:");
});

// Inicializar el área de salida con un mensaje de bienvenida
outputArea.textContent = "Listo para ayudarte con tu código. Pega tu código arriba y haz clic en un botón.";
outputArea.style.color = "#666";



// Este es el archivo JavaScript para manejar la lógica de la llamada a la API de OpenAI


// Instanciamos el cliente API con la URL de tu backend publicado en Vercel
// const apiClient = new ApiClient('https://firebase-node-backend-jj3hl6pcl-estebanreinosos-projects.vercel.app/');
const apiClient = new ApiClient('http://localhost:3000');

// Eventos de Search
document.getElementById('searchButton').addEventListener('click', enviarPregunta);
// document.getElementById('fsearchInput').addEventListener('keypress', function (e) {
//     if (e.key === 'Enter') {
//         enviarPregunta();
//     }
// });

let mensajes = [];

async function obtenerApiKey() {
    try {

        const response = await fetch(apiClient.baseUrl + '/api/openai-key', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }); // Solicita la clave API al backend
        if (!response.ok) {
            throw new Error('No se pudo obtener la clave API');
        }
        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        console.error('Error al obtener la clave API:', error);
        return null;
    }
}

async function obtenerPerfil(email) {
    const response = await fetch(apiClient.baseUrl + `/api/obtenerPerfil?email=${email}`);
    if (response.ok) {
      const perfil = await response.json();
      console.log(perfil);
      return perfil;
    } else {
      console.error('Error al obtener el perfil:', response.statusText);
    }
}


async function enviarPregunta() {
    const pregunta = document.getElementById('fsearchInput').value;
    if (!pregunta) {
        alert('Por favor, escribe una pregunta.');
        return;
    }

    const apiKey = await obtenerApiKey();
    if (!apiKey) {
        alert('No se pudo obtener la clave API.');
        return;
    }

    // Agregamos la pregunta del usuario a la conversación
    mensajes.push({
        role: 'user',
        content: pregunta
    });

    const respuestaContenedor = document.getElementById('responseContainer');
    respuestaContenedor.textContent = 'Cargando...';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4', // o el modelo que quieras usar
                messages: mensajes,
                max_tokens: 150
            })
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud a OpenAI');
        }

        const data = await response.json();
        const respuesta = data.choices[0].message.content.trim();

        // Agregamos la respuesta del asistente a la conversación
        mensajes.push({
            role: 'assistant',
            content: respuesta
        });

        respuestaContenedor.textContent = respuesta;
    } catch (error) {
        console.error('Error al conectarse con OpenAI:', error);
        respuestaContenedor.textContent = 'Hubo un error al procesar tu solicitud.';
    }
}

const vestimentaPrompt = `
    Eres un asistente de vestimenta útil. Te proporcionaré un estilo de vestimenta,
    y tu objetivo será devolver tres conjuntos de ropa con recomendaciones detalladas.
    Para cada prenda, proporciona el nombre, descripción, color, talla y precio.
`;

async function obtenerRecomendacionesVestimenta(estilo) {
    const apiKey = await obtenerApiKey();
    if (!apiKey) {
        alert('No se pudo obtener la clave API.');
        return;
    }

    const prompt = `
        ${vestimentaPrompt}
        Estilo solicitado: ${estilo}.
        Proporciona las recomendaciones en el siguiente formato JSON:
    `;
    // Mostrar spinner y ocultar tabla
    document.getElementById('spinner-container').style.display = 'block';
    document.getElementById('response-container').style.display = 'none';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        "role": "system",
                        "content": prompt
                    },
                    {
                        "role": "user",
                        "content": `Genera tres conjuntos de vestimenta para el estilo "${estilo}".`
                    }
                ],
                response_format: {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "outfit_recommendations",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "outfits": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "items": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "item": {"type": "string"},
                                                        "description": {"type": "string"},
                                                        "color": {"type": "string"},
                                                        "size": {"type": "string"},
                                                        "price": {"type": "string"}
                                                    },
                                                    "required": ["item", "description", "color", "size", "price"],
                                                    "additionalProperties": false
                                                }
                                            }
                                        },
                                        "required": ["items"],
                                        "additionalProperties": false
                                    }
                                },
                                "notes": {"type": "string"}
                            },
                            "required": ["outfits", "notes"],
                            "additionalProperties": false
                        },
                        "strict": true
                    }
                },
                max_tokens: 1000
            })
        });

        const data = await response.json();

        // Verifica que la respuesta contiene el contenido esperado
        if (data && data.choices && data.choices[0].message) {
            const recomendaciones = data.choices[0].message;

            // Llama a renderizarTablaRecomendaciones con las recomendaciones
            renderizarTablaRecomendaciones(recomendaciones.content);
            // Ocultar spinner y mostrar tabla
            document.getElementById('spinner-container').style.display = 'none';
            document.getElementById('response-container').style.display = 'block';

        } else {
            console.error("Error en la respuesta de OpenAI");
        }
    } catch (error) {
        // Ocultar spinner incluso en caso de error
        document.getElementById('spinner-container').style.display = 'none';
        alert('Hubo un error al cargar los datos.');
    }
}




function renderizarTablaRecomendaciones(outfits) {

    // Si outfits es una cadena JSON, primero intenta extraer y parsear el JSON
    if (typeof outfits === 'string') {
        try {
            // Usa una expresión regular para capturar el bloque JSON entre llaves
            const jsonMatch = outfits.match(/{.*}/s);
            if (jsonMatch) {
                outfits = JSON.parse(jsonMatch[0]);
            } else {
                console.error("No se encontró JSON válido en la respuesta.");
                return;
            }
        } catch (error) {
            console.error("Error al parsear JSON de outfits:", error);
            return;
        }
    }

    const tabla = document.getElementById('tabla-recomendaciones');
    tabla.innerHTML = ''; // Limpia cualquier contenido previo

    outfits.outfits.forEach((outfit, index) => {
        // Añadir un título para cada conjunto
        const headerRow = document.createElement('tr');
        const headerCell = document.createElement('td');
        headerCell.colSpan = 5;
        headerCell.textContent = `Conjunto ${index + 1}`;
        headerCell.style.fontWeight = 'bold';
        headerRow.appendChild(headerCell);
        tabla.appendChild(headerRow);

        // Añadir cada prenda del conjunto a la tabla
        outfit.items.forEach(item => {
            const row = document.createElement('tr');

            const itemCell = document.createElement('td');
            itemCell.textContent = item.item;
            row.appendChild(itemCell);

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = item.description;
            row.appendChild(descriptionCell);

            const colorCell = document.createElement('td');
            colorCell.textContent = item.color;
            row.appendChild(colorCell);

            const sizeCell = document.createElement('td');
            sizeCell.textContent = item.size;
            row.appendChild(sizeCell);

            const priceCell = document.createElement('td');
            priceCell.textContent = item.price;
            row.appendChild(priceCell);

            tabla.appendChild(row);
        });
    });
}

  

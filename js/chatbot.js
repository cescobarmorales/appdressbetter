// Instanciamos el cliente API con la URL de tu backend publicado en Vercel
// const apiClient = new ApiClient('https://firebase-node-backend-jj3hl6pcl-estebanreinosos-projects.vercel.app/');
const apiClient = new ApiClient('http://localhost:3000');

// Eventos de Search
document.getElementById('searchButton').addEventListener('click', enviarPregunta);

// Texto Bajo el Avatar
const introText = document.getElementById('intro-text');
const nameInputContainer = document.getElementById('name-input-container');

// Obtener el email del usuario almacenado
const userEmail = localStorage.getItem('userEmail');

let mensajes = [];
let perfil = null; // Definimos la constante perfil

// Cargar el perfil del usuario al inicio
if (userEmail) {
    obtenerPerfil(userEmail)
        .then((perfilCargado) => {
            perfil = perfilCargado;
            console.log('Perfil cargado:', perfil);
        })
        .catch((error) => {
            console.error('Error al cargar el perfil:', error);
        });
} else {
    console.warn('No se encontró un email válido en el localStorage.');
}

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
    try {
        const response = await fetch(apiClient.baseUrl + `/api/obtenerPerfil?email=${email}`);
        if (response.ok) {
            const perfil = await response.json();
            return perfil;
        } else {
            throw new Error('Error al obtener el perfil:', response.statusText);
        }
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        throw error;
    }
}

async function obtenerProductosML(descripcion) {
    const response = await fetch(apiClient.baseUrl + `/api/searchProductsML?q=${descripcion}`);
    if (response.ok) {
        const productos = await response.json();
        console.log(productos);
        return productos;
    } else {
        console.error('Error al obtener Productos Mercado Libre:', response.statusText);
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
    Cada conjunto de ropa debe tener maximo 3 prendas y para cada prenda, proporciona el nombre, descripción, color, talla y precio.
`;

async function obtenerRecomendacionesVestimenta(estilo) {
    document.getElementById('spinner-container').style.display = 'block';
    const apiKey = await obtenerApiKey();
    if (!apiKey) {
        alert('No se pudo obtener la clave API.');
        return;
    }

    if (!perfil) {
        alert('No se pudo obtener el perfil del usuario.');
        return;
    }

    const prompt = `
        Eres un asistente de vestimenta útil. Proporciona recomendaciones para el estilo solicitado.
        Estilo solicitado: ${estilo}.
        Datos del usuario:
        Colores Preferidos: ${perfil.coloresPreferidos},
        Fecha de nacimiento: ${perfil.fechaNacimiento},
        Género: ${perfil.genero},
        Talla Calzado: ${perfil.tallaCalzado},
        Talla Pantalón: ${perfil.tallaPantalon},
        Talla Polera o Camisa: ${perfil.tallaPolera}
    `;

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
                    { "role": "system", "content": prompt },
                    { "role": "user", "content": `Genera tres conjuntos de vestimenta para el estilo "${estilo}".` }
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
                                                        "item": { "type": "string" },
                                                        "description": { "type": "string" },
                                                        "color": { "type": "string" },
                                                        "size": { "type": "string" },
                                                        "price": { "type": "string" }
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
                                "notes": { "type": "string" }
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

        if (data && data.choices && data.choices[0].message) {
            const recomendaciones = JSON.parse(data.choices[0].message.content);

            // escribe las notas bajo el avatar
            introText.innerHTML = "";
            typeNotes(recomendaciones.notes);

            // Enriquecer recomendaciones con opciones de Mercado Libre
            for (const outfit of recomendaciones.outfits) {
                for (const item of outfit.items) {
                    const descripcion = `${item.item} de ${perfil.genero}, color: ${item.color}, talla: ${item.size}`;
                    console.log(descripcion);
                    item.opcionesML = await obtenerProductosML(descripcion); // Agrega las opcionesML
                }
            }

            renderizarTablaRecomendaciones(recomendaciones);
        } else {
            console.error("Error en la respuesta de OpenAI");
        }
    } catch (error) {
        console.error("Error al obtener las recomendaciones:", error);
        alert('Hubo un error al cargar los datos.');
    }
}

let charIndex = 0;
function typeNotes(introMessage) {
    if (charIndex < introMessage.length) {
        introText.innerHTML += introMessage.charAt(charIndex);
        charIndex++;
        setTimeout(typeNotes(introMessage), 50);
    } else {
        setTimeout(() => {
            nameInputContainer.style.display = 'flex';
            charIndex = 0
        }, 500);
    }
}



function renderizarTablaRecomendaciones(outfits) {
    if (typeof outfits === 'string') {
        try {
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
        const headerRow = document.createElement('tr');
        const headerCell = document.createElement('td');
        headerCell.colSpan = 5;
        headerCell.textContent = `Conjunto ${index + 1}`;
        headerCell.style.fontWeight = 'bold';
        headerRow.appendChild(headerCell);
        tabla.appendChild(headerRow);
        

        outfit.items.forEach( item => {

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

            const opcionesCell = document.createElement('td');

            // Crear un contenedor para el carrusel
            const carouselContainer = document.createElement('div');
            carouselContainer.style.display = 'flex'; // Estilo para disposición horizontal
            carouselContainer.style.overflowX = 'auto'; // Permitir desplazamiento horizontal
            carouselContainer.style.gap = '10px'; // Espacio entre elementos

            // Agregar las opciones al carrusel
            item.opcionesML.forEach(opcion => {
                const card = document.createElement('div');
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.alignItems = 'center';
                card.style.border = '1px solid #ccc';
                card.style.padding = '10px';
                card.style.width = '150px';
                card.style.minWidth = '150px'; // Evitar que se colapsen
                card.style.textAlign = 'center';

                // Imagen
                const image = document.createElement('img');
                image.src = opcion.image;
                image.alt = opcion.title;
                image.style.width = '100%';
                image.style.height = 'auto';

                // Título sobre la imagen
                const title = document.createElement('div');
                title.textContent = opcion.title;
                title.style.position = 'absolute';
                title.style.top = '10px';
                title.style.left = '10px';
                title.style.color = 'white';
                title.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                title.style.padding = '5px';
                title.style.borderRadius = '3px';
                title.style.fontSize = '12px';

                // Precio debajo de la imagen
                const price = document.createElement('div');
                price.textContent = `$${opcion.price}`;
                price.style.marginTop = '10px';
                price.style.fontWeight = 'bold';

                // Link al producto
                const link = document.createElement('a');
                link.href = opcion.link;
                link.textContent = 'Visitar tienda';
                link.target = '_blank';
                link.style.display = 'inline-block';
                link.style.marginTop = '5px';
                link.style.padding = '5px 10px';
                link.style.color = 'white';
                link.style.backgroundColor = '#007bff';
                link.style.textDecoration = 'none';
                link.style.borderRadius = '3px';

                // Ensamblar los elementos dentro de la tarjeta
                card.appendChild(image);
                card.appendChild(price);
                card.appendChild(link);

                // Añadir la tarjeta al contenedor del carrusel
                carouselContainer.appendChild(card);
            });

            // Agregar el contenedor del carrusel a la celda
            opcionesCell.appendChild(carouselContainer);

            // Agregar la celda a la fila
            row.appendChild(opcionesCell);

            tabla.appendChild(row);
        });
    });

    // Mostrar el contenedor después de completar la tabla
    document.getElementById('response-container').style.display = 'block';
    document.getElementById('spinner-container').style.display = 'none';
}




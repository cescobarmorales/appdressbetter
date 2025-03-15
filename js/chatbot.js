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

            

            // Enriquecer recomendaciones con opciones de Mercado Libre
            for (const outfit of recomendaciones.outfits) {
                for (const item of outfit.items) {
                    const descripcion = `${item.item} de ${perfil.genero}, color: ${item.color}, talla: ${item.size}`;
                    console.log(descripcion);
                    item.opcionesML = await obtenerProductosML(descripcion); // Agrega las opcionesML
                }
            }

            renderizarTablaRecomendaciones(recomendaciones);
            // escribe las notas bajo el avatar
            introText.innerHTML = "";
            typeNotes(recomendaciones.notes);
            
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
        // Crear la fila de encabezado del conjunto
        const headerRow = document.createElement('tr');
        headerRow.className = 'conjunto-header';
        const headerCell = document.createElement('td');
        headerCell.colSpan = 5;
        headerCell.textContent = `Conjunto ${index + 1}`;
        headerCell.style.fontWeight = 'bold';
        headerRow.appendChild(headerCell);
        tabla.appendChild(headerRow);
        
        // Iterar sobre cada item del conjunto
        outfit.items.forEach(item => {
            const row = document.createElement('tr');
            
            // Celda del item
            const itemCell = document.createElement('td');
            itemCell.textContent = item.item;
            itemCell.setAttribute('data-label', 'Item');
            row.appendChild(itemCell);
            
            // Celda de descripción
            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = item.description;
            descriptionCell.setAttribute('data-label', 'Descripción');
            row.appendChild(descriptionCell);
            
            // Celda de color
            const colorCell = document.createElement('td');
            colorCell.textContent = item.color;
            colorCell.setAttribute('data-label', 'Color');
            row.appendChild(colorCell);
            
            // Celda de talla
            const sizeCell = document.createElement('td');
            sizeCell.textContent = item.size;
            sizeCell.setAttribute('data-label', 'Talla');
            row.appendChild(sizeCell);
            
            // Celda de opciones con carrusel
            const opcionesCell = document.createElement('td');
            opcionesCell.setAttribute('data-label', 'Opciones');
            opcionesCell.classList.add('options-cell');
            
            // Crear un contenedor para el carrusel
            const carouselContainer = document.createElement('div');
            carouselContainer.classList.add('carousel-container');
            
            // Crear el track del carrusel (cinta que se anima)
            const carouselTrack = document.createElement('div');
            carouselTrack.classList.add('carousel-track');
            
            // Variable para guardar las tarjetas originales
            const originalCards = [];
            
            // Agregar las opciones al carrusel
            item.opcionesML.forEach(opcion => {
                const card = createProductCard(opcion);
                originalCards.push(card);
                carouselTrack.appendChild(card);
            });
            
            // Duplicar las tarjetas para crear efecto continuo
            // Solo si hay suficientes elementos para justificar duplicarlos
            if (item.opcionesML.length > 1) {
                originalCards.forEach(card => {
                    const clonedCard = card.cloneNode(true);
                    carouselTrack.appendChild(clonedCard);
                });
                
                // Ajustar la velocidad de la animación según la cantidad de tarjetas
                const animationDuration = Math.max(15, item.opcionesML.length * 5); // mínimo 15s, escalando según cantidad
                carouselTrack.style.animationDuration = `${animationDuration}s`;
            }
            
            // Agregar el track al contenedor del carrusel
            carouselContainer.appendChild(carouselTrack);
            
            // Opcional: Agregar controles de pausa/play
            const pausePlayBtn = document.createElement('button');
            pausePlayBtn.className = 'carousel-pause-play';
            pausePlayBtn.innerHTML = '⏸️';
            pausePlayBtn.style.position = 'absolute';
            pausePlayBtn.style.bottom = '5px';
            pausePlayBtn.style.right = '5px';
            pausePlayBtn.style.background = 'rgba(0,0,0,0.5)';
            pausePlayBtn.style.color = 'white';
            pausePlayBtn.style.border = 'none';
            pausePlayBtn.style.borderRadius = '50%';
            pausePlayBtn.style.width = '24px';
            pausePlayBtn.style.height = '24px';
            pausePlayBtn.style.cursor = 'pointer';
            pausePlayBtn.style.zIndex = '10';
            
            let isPaused = false;
            pausePlayBtn.addEventListener('click', () => {
                if (isPaused) {
                    carouselTrack.style.animationPlayState = 'running';
                    pausePlayBtn.innerHTML = '⏸️';
                    isPaused = false;
                } else {
                    carouselTrack.style.animationPlayState = 'paused';
                    pausePlayBtn.innerHTML = '▶️';
                    isPaused = true;
                }
            });
            
            carouselContainer.appendChild(pausePlayBtn);
            
            // Agregar el contenedor del carrusel a la celda
            opcionesCell.appendChild(carouselContainer);
            
            // Agregar la celda a la fila
            row.appendChild(opcionesCell);
            
            tabla.appendChild(row);
        });
    });
    
    // Función para crear una tarjeta de producto
    function createProductCard(opcion) {
        const card = document.createElement('div');
        card.classList.add('product-card');
        
        // Contenedor para la imagen (para mantener proporción)
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        
        // Imagen
        const image = document.createElement('img');
        image.src = opcion.image;
        image.alt = opcion.title;
        image.classList.add('product-image');
        
        // Título del producto
        const title = document.createElement('div');
        title.textContent = opcion.title;
        title.classList.add('product-title');
        
        // Precio
        const price = document.createElement('div');
        price.textContent = `$${opcion.price}`;
        price.classList.add('product-price');
        
        // Link al producto
        const link = document.createElement('a');
        link.href = opcion.link;
        link.textContent = 'Visitar tienda';
        link.target = '_blank';
        link.classList.add('product-link');
        
        // Ensamblar los elementos dentro de la tarjeta
        imageContainer.appendChild(image);
        imageContainer.appendChild(title);
        card.appendChild(imageContainer);
        card.appendChild(price);
        card.appendChild(link);
        
        return card;
    }
    

    // Mostrar el contenedor después de completar la tabla
    document.getElementById('response-container').style.display = 'block';
    document.getElementById('spinner-container').style.display = 'none';
}




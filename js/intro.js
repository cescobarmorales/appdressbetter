// Instanciamos el cliente API con la URL de tu backend publicado en Vercel
// const apiClient = new ApiClient('https://firebase-node-backend-jj3hl6pcl-estebanreinosos-projects.vercel.app/');
const apiClient = new ApiClient('http://localhost:3000');

// Sistema de alertas simplificado
const Toast = {
  container: null,
  
  // Inicializar el contenedor
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  
  // Mostrar una alerta
  show(message, type = 'info', duration = 3000) {
    this.init();
    
    // Crear el elemento de alerta
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Determinar el icono según el tipo
    let icon = '';
    switch (type) {
      case 'success':
        icon = '✓';
        break;
      case 'error':
        icon = '✕';
        break;
      case 'warning':
        icon = '⚠';
        break;
      default: // info
        icon = 'ℹ';
    }
    
    // Construir el HTML de la alerta
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    `;
    
    // Agregar la alerta al contenedor
    this.container.appendChild(toast);
    
    // Auto-cerrar después del tiempo especificado
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
    
    return toast;
  },
  
  // Métodos de conveniencia
  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  },
  
  error(message, duration = 3000) {
    return this.show(message, 'error', duration);
  },
  
  warning(message, duration = 3000) {
    return this.show(message, 'warning', duration);
  },
  
  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
};

document.addEventListener('DOMContentLoaded', function () {
    const introContainer = document.getElementById('intro-container');
    const introText = document.getElementById('intro-text');
    const nombre = document.getElementById('nombre');
    const nameInputContainer = document.getElementById('name-input-container');
    const userNameInput = document.getElementById('user-name');
    const submitNameButton = document.getElementById('submit-name');
    const profileConfigContainer = document.getElementById('profile-config-container');

    const introMessage = ", soy tu asistente virtual de Moda. Cuéntame sobre ti, ¿Cuál es tu nombre?";
    let charIndex = 0;

    function typeIntro() {
        if (charIndex < introMessage.length) {
            introText.innerHTML += introMessage.charAt(charIndex);
            charIndex++;
            setTimeout(typeIntro, 50);
        } else {
            setTimeout(() => {
                nameInputContainer.style.display = 'flex';
            }, 500);
        }
    }

    typeIntro();

    submitNameButton.addEventListener('click', function () {
        const userName = userNameInput.value.trim();
        if (userName) {
            introContainer.style.opacity = '0';
            nameInputContainer.style.display = 'none';

            setTimeout(() => {
                introText.innerHTML = '';
                introContainer.classList.add('left-aligned');

                let newMessage = `Genial, un gusto ${userName}. Me gustaría ayudarte a encontrar el estilo perfecto para ti. Por favor, necesito que completes los siguientes datos para continuar:`;
                let newCharIndex = 0;

                function typeNewIntro() {
                    if (newCharIndex < newMessage.length) {
                        introText.innerHTML += newMessage.charAt(newCharIndex);
                        newCharIndex++;
                        setTimeout(typeNewIntro, 50);
                    } else {
                        setTimeout(() => {
                            profileConfigContainer.classList.add('visible');
                            nombre.value = userName;
                        }, 100);
                    }
                }

                introContainer.style.opacity = '1';
                typeNewIntro();
            }, 500);
        }
    });

    async function enviarDatosPerfil(event) {
        event.preventDefault(); // Prevenir el envío del formulario por defecto
    
        // Obtener los campos del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const fechaNacimiento = document.getElementById('fechaNacimiento').value.trim();
        const genero = document.getElementById('genero').value;
        const coloresPreferidos = Array.from(document.getElementById('coloresPreferidos').selectedOptions)
            .map(option => option.value)
            .join(','); // Convertir selección múltiple en una lista separada por comas
        const tallaCalzado = document.getElementById('tallaCalzado').value.trim();
        const tallaPolera = document.getElementById('tallaPolera').value.trim();
        const tallaPantalon = document.getElementById('tallaPantalon').value.trim();
        const estilosPreferidos = Array.from(document.getElementById('style').selectedOptions)
            .map(option => option.value)
            .join(','); // Convertir selección múltiple en una lista separada por comas
    
        // Validar campos requeridos
        if (!nombre || !email || !fechaNacimiento || !tallaCalzado || !tallaPolera || !tallaPantalon || !estilosPreferidos) {
            // Reemplazar alert con nuestra notificación moderna
            Toast.warning('Por favor, completa todos los campos obligatorios.');
            return;
        }
    
        // Crear el objeto JSON con los datos del formulario
        const datosPerfil = {
            nombre: nombre,
            email: email,
            fechaNacimiento: fechaNacimiento,
            genero: genero || 'No especificado', // Usar valor por defecto si no se selecciona
            coloresPreferidos: coloresPreferidos,
            tallaCalzado: tallaCalzado,
            tallaPolera: tallaPolera,
            tallaPantalon: tallaPantalon,
            estilosPreferidos: estilosPreferidos
        };
    
        try {
            // Mostrar notificación de carga
            Toast.info('Guardando tu perfil...');
            
            // Enviar los datos al servidor mediante fetch
            const response = await fetch(apiClient.baseUrl + '/api/storeDataPerfil', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosPerfil)
            });
    
            if (response.ok) {
                // Reemplazar alert con nuestra notificación moderna
                Toast.success('Perfil guardado con éxito.');
                
                // Guardar email en el almacenamiento local para acceso desde chatbot.js
                localStorage.setItem('userEmail', email);
    
                // Redirigir al usuario a la página user.html después de un breve retraso
                setTimeout(() => {
                    window.location.href = 'user.html';
                }, 1500);
            } else {
                const errorData = await response.json();
                console.error('Error al guardar el perfil:', errorData.message || 'Error desconocido.');
                // Reemplazar alert con nuestra notificación moderna
                Toast.error('Hubo un error al guardar el perfil. Por favor, inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            // Reemplazar alert con nuestra notificación moderna
            Toast.error('Ocurrió un error al guardar los datos. Verifica tu conexión e inténtalo de nuevo.');
        }
    }
    
    // Asociar la función al evento submit del formulario
    document.getElementById('profile-config-form').addEventListener('submit', enviarDatosPerfil);
});
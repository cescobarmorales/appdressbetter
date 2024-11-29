document.addEventListener('DOMContentLoaded', function() {
  const introContainer = document.getElementById('intro-container');
  const introText = document.getElementById('intro-text');
  const nameInputContainer = document.getElementById('name-input-container');
  const userNameInput = document.getElementById('user-name');
  const submitNameButton = document.getElementById('submit-name');
  const profileConfigContainer = document.getElementById('profile-config-container');

  const introMessage = "Hola, soy tu asistente virtual de Moda DressBetter. Cuéntame sobre ti, ¿Cuál es tu nombre?";
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

  submitNameButton.addEventListener('click', function() {
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
                      }, 100);
                  }
              }

              introContainer.style.opacity = '1';
              typeNewIntro();
          }, 500);
      }
  });
});
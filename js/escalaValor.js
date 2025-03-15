document.querySelectorAll('input[name="satisfaction"]').forEach(input => {
    input.addEventListener('change', function () {
      // Highlight the selected rating
      document.querySelectorAll('.rating-option label').forEach(label => {
        label.style.opacity = '0.5';
      });
      this.nextElementSibling.style.opacity = '1';
    });
  });

  document.getElementById('submit-feedback').addEventListener('click', function () {
    const selectedRating = document.querySelector('input[name="satisfaction"]:checked');
    const feedbackText = document.getElementById('user-feedback').value;

    if (!selectedRating) {
      alert('Por favor selecciona un nivel de satisfacción antes de enviar.');
      return;
    }

    // Here you would normally send the data to your server
    alert('¡Gracias por tu opinión! Tu valoración: ' + selectedRating.value);

    // Clear form
    document.querySelector('input[name="satisfaction"]:checked').checked = false;
    document.getElementById('user-feedback').value = '';
  });
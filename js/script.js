document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuList = document.getElementById('menu-list');

    menuToggle.addEventListener('click', () => {
        menuList.classList.toggle('show');
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
    });

    // Cerrar el menú al hacer clic fuera de él
    document.addEventListener('click', (event) => {
        // if (!menuToggle.contains(event.target) && !menuList.contains(event.target)) {
        if (!menuToggle.contains(event.target) && !menuList.contains(event.target)) {
            menuList.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Manejar el envío del formulario de búsqueda
    // const searchForm = document.querySelector('.search-bar');
    // searchForm.addEventListener('submit', (event) => {
    //     event.preventDefault();
    //     const searchInput = document.getElementById('search-input');
    //     const searchTerm = searchInput.value.trim();
    //     if (searchTerm) {
    //         // Aquí puedes implementar la lógica de búsqueda o redirigir a una página de resultados
    //         console.log(`Búsqueda realizada: ${searchTerm}`);
    //         searchInput.value = '';
    //     }
    // });

    // Lazy loading para la imagen de fondo
    const lazyLoadBackground = () => {
        const container = document.querySelector('.container');
        const img = new Image();
        img.src = 'https://source.unsplash.com/random/1920x1080';
        img.onload = () => {
            container.style.backgroundImage = `url(${img.src})`;
        };
    }

    
    lazyLoadBackground();

    

});
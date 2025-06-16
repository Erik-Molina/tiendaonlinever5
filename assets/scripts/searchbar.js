document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('product-search');
    const clearBtn = document.querySelector('.clear-btn');

    if (!searchInput || !clearBtn) return;

    // Mostrar/ocultar el botón de borrar según el contenido del input
    searchInput.addEventListener('input', () => {
        clearBtn.classList.toggle('visible', searchInput.value.length > 0);
    });

    // Limpiar el input al hacer clic en la "X"
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('visible');
        // Disparar evento input para actualizar resultados (si hay lógica existente)
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus(); // Mantener el foco en el input
    });
});
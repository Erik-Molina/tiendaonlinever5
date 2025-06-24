import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAUzXZfOm7laa_ubkP_mYz5YMhYFfy5zOc",
  authDomain: "dataestorage.firebaseapp.com",
  databaseURL: "https://dataestorage-default-rtdb.firebaseio.com",
  projectId: "dataestorage",
  storageBucket: "dataestorage.firebasestorage.app",
  messagingSenderId: "1062428871648",
  appId: "1:1062428871648:web:338409b616e2cfba29b985",
  measurementId: "G-W47EH5YSFS"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Seleccionar elementos del DOM
const searchInput = document.getElementById('product-search');
const searchResults = document.getElementById('search-results');
const clearBtn = document.querySelector('.clear-btn');
const searchBtn = document.querySelector('.search-btn');

// Depuración: Verificar elementos del DOM
console.log('searchInput:', searchInput);
console.log('searchResults:', searchResults);
console.log('clearBtn:', clearBtn);
console.log('searchBtn:', searchBtn);

// Estado para manejar datos y consultas
let allProducts = [];
let isDataLoaded = false;
let pendingQuery = null;

// Función para sanitizar texto (insensible a mayúsculas y acentos)
function sanitizeText(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Función para renderizar sugerencias
function renderSuggestions(products, query) {
  console.log('Renderizando sugerencias para query:', query);
  searchResults.innerHTML = '';

  if (!query) {
    searchResults.classList.remove('active');
    clearBtn.classList.remove('visible');
    console.log('Query vacío, ocultando resultados');
    return;
  }

  const sanitizedQuery = sanitizeText(query);
  const filteredProducts = products
    .filter(product => {
      const sanitizedName = sanitizeText(product.nombre || '');
      const match = sanitizedName.startsWith(sanitizedQuery);
      console.log(`Producto: ${product.nombre}, Coincide: ${match}`);
      return match;
    })
    .slice(0, 7); // Limitar a 7 sugerencias

  console.log('Productos filtrados:', filteredProducts);

  if (filteredProducts.length === 0) {
    searchResults.innerHTML = '<div class="no-results">No results, try again</div>';
    searchResults.classList.add('active');
    clearBtn.classList.add('visible');
    console.log('Sin resultados');
    return;
  }

  filteredProducts.forEach(product => {
    const suggestion = document.createElement('div');
    suggestion.className = 'suggestion-item';
    suggestion.innerHTML = `
      <img src="${product.imagenes_url[0] || 'https://via.placeholder.com/50'}" alt="${product.nombre}" class="suggestion-img" />
      <div class="suggestion-text">
        <div class="suggestion-name">${product.nombre}</div>
        <div class="suggestion-price">${product.precio}</div>
      </div>
    `;
    suggestion.addEventListener('click', () => {
      console.log('Clic en sugerencia:', product.nombre);
      try {
        openProductImagesModal(product.imagenes_url, product);
        searchInput.value = '';
        searchResults.classList.remove('active');
        clearBtn.classList.remove('visible');
      } catch (error) {
        console.error('Error al abrir modal:', error);
      }
    });
    searchResults.appendChild(suggestion);
  });

  searchResults.classList.add('active');
  clearBtn.classList.add('visible');
}

// Lógica principal
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado, inicializando Firebase');

  // Verificar existencia de elementos del DOM
  if (!searchInput) {
    console.error('Input #product-search no encontrado');
    return;
  }
  if (!searchResults) {
    console.error('Div #search-results no encontrado');
    return;
  }
  if (!clearBtn) {
    console.error('Botón .clear-btn no encontrado');
    return;
  }
  if (!searchBtn) {
    console.error('Botón .search-btn no encontrado');
    return;
  }

  // Obtener datos de Firebase
  const productosRef = ref(db, '/');
  onValue(productosRef, (snapshot) => {
    console.log('Snapshot recibido de Firebase');
    const data = snapshot.val() || {};
    allProducts = Object.values(data).filter(product => product.nombre && typeof product.nombre === 'string');
    console.log('Productos cargados:', allProducts.length, allProducts);
    isDataLoaded = true;

    // Procesar consulta pendiente si existe
    if (pendingQuery) {
      console.log('Procesando consulta pendiente:', pendingQuery);
      renderSuggestions(allProducts, pendingQuery);
      pendingQuery = null;
    }
  }, {
    onlyOnce: false,
    error: (error) => {
      console.error('Error al leer Firebase:', error);
      searchResults.innerHTML = '<div class="no-results">Error loading data, please try again</div>';
      searchResults.classList.add('active');
    }
  });

  // Mostrar/ocultar el botón de borrar según el contenido del input
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    console.log('Input detectado:', query);
    clearBtn.classList.toggle('visible', query.length > 0);
    if (!isDataLoaded) {
      console.log('Datos no cargados, guardando query:', query);
      pendingQuery = query;
    } else {
      renderSuggestions(allProducts, query);
    }
  });

  // Limpiar el input al hacer clic en la "X"
  clearBtn.addEventListener('click', () => {
    console.log('Botón de limpiar clicado');
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    searchResults.classList.remove('active');
    searchInput.focus();
  });

  // Evento para el botón de búsqueda
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    console.log('Botón de búsqueda clicado con query:', query);
    if (query && isDataLoaded) {
      renderSuggestions(allProducts, query);
    } else if (query) {
      pendingQuery = query;
    }
  });

  // Ocultar sugerencias al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!searchResults.contains(e.target) && e.target !== searchInput && e.target !== clearBtn && e.target !== searchBtn) {
      console.log('Clic fuera, ocultando resultados');
      searchResults.classList.remove('active');
    }
  });
});

// app.js

// URL base de la API de SWAPI
const baseUrl = "https://swapi.dev/api/";

// Almacena la página actual para cada tipo de entidad
const entityPages = {};

// Elemento del DOM que representa el loader
const loader = document.getElementById("loader");

// Lista de estilos para el loader
const loaderStyles = [
  { borderColor: "#3498db", borderTopColor: "#f1c40f" },
  { borderColor: "#e74c3c", borderTopColor: "#2ecc71" },
  { borderColor: "#9b59b6", borderTopColor: "#e67e22" },
];

// Índice para rastrear el estilo actual del loader
let styleIndex = 0;

// Función para aplicar estilos al loader
function applyLoaderStyles(styleIndex) {
  const style = loaderStyles[styleIndex];
  loader.style.border = `6px solid ${style.borderColor}`;
  loader.style.borderTop = `6px solid ${style.borderTopColor}`;
}

// Cambiar estilos automáticamente cada 3 segundos (3000 ms)
setInterval(() => {
  applyLoaderStyles(styleIndex);
  styleIndex = (styleIndex + 1) % loaderStyles.length;
}, 3000);

// Función para mostrar el loader
function showLoader() {
  loader.style.display = "block";
}

// Función para ocultar el loader
function hideLoader() {
  loader.style.display = "none";
}

// Función para realizar solicitudes a la API y manejar errores
async function fetchData(url) {
  try {
    showLoader(); // Muestra el loader
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Error en la solicitud: ${response.status} ${response.statusText}`
      );
    }
    hideLoader(); // Oculta el loader cuando la solicitud ha terminado con éxito

    return await response.json();
  } catch (error) {
    console.error("Error al cargar datos:", error);
    hideLoader(); // Oculta el loader en caso de error

    return null;
  }
}

// Función para cargar y mostrar listados de entidades con paginación
async function displayEntities(entityType, page = 1) {
  const entities = await fetchData(`${baseUrl}${entityType}/?page=${page}`);
  entityPages[entityType] = page; // Almacenar la página actual

  const nav = document.getElementById("nav");
  nav.innerHTML = ""; // Limpiar el contenido actual

  if (entities && entities.results.length > 0) {
    const ul = document.createElement("ul");
    entities.results.forEach((entity, index) => {
      const li = document.createElement("li");
      // Mostrar el nombre, título o modelo de la entidad
      li.textContent = entity.name || entity.title || entity.model;
      li.addEventListener("click", () =>
        displayEntityDetail(entityType, index)
      );
      ul.appendChild(li);
    });
    nav.appendChild(ul);

    // Agregar controles de paginación
    const pagination = document.createElement("div");
    pagination.className = "pagination";
    if (entities.previous) {
      const prevButton = document.createElement("button");
      prevButton.textContent = "Anterior";
      prevButton.addEventListener("click", () =>
        displayEntities(entityType, page - 1)
      );
      pagination.appendChild(prevButton);
    }
    if (entities.next) {
      const nextButton = document.createElement("button");
      nextButton.textContent = "Siguiente";
      nextButton.addEventListener("click", () =>
        displayEntities(entityType, page + 1)
      );
      pagination.appendChild(nextButton);
    }
    nav.appendChild(pagination);
  } else {
    nav.textContent = "No se encontraron resultados.";
  }
}

// Función para cargar y mostrar los detalles de una entidad
async function displayEntityDetail(entityType, index) {
  const entities = await fetchData(`${baseUrl}${entityType}/`);
  const entity = entities.results[index];
  const detailView = document.getElementById("detailView");
  detailView.innerHTML = ""; // Limpiar el contenido actual

  if (entity) {
    const detailTable = document.createElement("table");
    for (const key in entity) {
      const row = document.createElement("tr");
      const cell1 = document.createElement("td");
      const cell2 = document.createElement("td");
      cell1.textContent = key;
      const value = entity[key];

      if (Array.isArray(value)) {
        // Si el valor es un arreglo, verificar si contiene URLs
        const urls = value.filter((url) => url.startsWith("https"));

        if (urls.length > 0) {
          // Si hay URLs válidas en el arreglo, crear botones "Ver más" para cada una
          urls.forEach((url, index) => {
            const viewMoreButton = document.createElement("button");
            viewMoreButton.textContent = "Ver más";
            viewMoreButton.addEventListener("click", () =>
              displayAdditionalInfo(url, index)
            );
            cell2.appendChild(viewMoreButton);
            if (index < urls.length - 1) {
              // Agregar una coma como separador, excepto para el último elemento
              cell2.appendChild(document.createTextNode(" - "));
            }
          });
        } else {
          // Si no hay URLs válidas en el arreglo, mostrar el arreglo como cadena
          cell2.textContent = value.join(",");
        }
      } else if (typeof value === "string" && value.startsWith("https")) {
        // Si el valor es una única URL que comienza con "https", mostrar un botón "Ver más"
        const viewMoreButton = document.createElement("button");
        viewMoreButton.textContent = "Ver más";
        viewMoreButton.addEventListener("click", () =>
          displayAdditionalInfo(value)
        );
        cell2.appendChild(viewMoreButton);
      } else {
        cell2.textContent = value;
      }

      row.appendChild(cell1);
      row.appendChild(cell2);
      detailTable.appendChild(row);
    }
    detailView.appendChild(detailTable);
  }
}

// Función para cargar y mostrar información adicional desde una URL
async function displayAdditionalInfo(url, index = null) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Error en la solicitud: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    const modalContent = document.getElementById("modalContent");
    modalContent.innerHTML = ""; // Limpiar el contenido del modal

    if (data) {
      const detailTable = document.createElement("table");
      for (const key in data) {
        const row = document.createElement("tr");
        const cell1 = document.createElement("td");
        const cell2 = document.createElement("td");
        cell1.textContent = key;
        const value = data[key];

        if (Array.isArray(value)) {
          // Si el valor es un arreglo, verificar si contiene URLs
          const urls = value.filter((url) => url.startsWith("https"));

          if (urls.length > 0) {
            // Si hay URLs válidas en el arreglo, crear botones "Ver más" para cada una
            urls.forEach((url, index) => {
              const viewMoreButton = document.createElement("button");
              viewMoreButton.textContent = "Ver más";
              viewMoreButton.addEventListener("click", () =>
                displayAdditionalInfo(url, index)
              );
              cell2.appendChild(viewMoreButton);
              if (index < urls.length - 1) {
                // Agregar una coma como separador, excepto para el último elemento
                cell2.appendChild(document.createTextNode(" - "));
              }
            });
          } else {
            // Si no hay URLs válidas en el arreglo, mostrar el arreglo como cadena
            cell2.textContent = value.join(",");
          }
        } else if (typeof value === "string" && value.startsWith("https")) {
          // Si el valor es una única URL que comienza con "https", mostrar un botón "Ver más"
          const viewMoreButton = document.createElement("button");
          viewMoreButton.textContent = "Ver más";
          viewMoreButton.addEventListener("click", () =>
            displayAdditionalInfo(value)
          );
          cell2.appendChild(viewMoreButton);
        } else {
          cell2.textContent = value;
        }

        row.appendChild(cell1);
        row.appendChild(cell2);
        detailTable.appendChild(row);
      }
      modalContent.appendChild(detailTable);
    }

    // Mostrar el modal
    const modal = document.getElementById("myModal");
    modal.style.display = "block";

    // Configurar el evento para cerrar el modal al hacer clic en la "x"
    const closeBtn = document.querySelector(".close");
    closeBtn.onclick = function () {
      modal.style.display = "none";
    };

    // Configurar el evento para cerrar el modal al hacer clic fuera del modal
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  } catch (error) {
    console.error("Error al cargar datos adicionales:", error);
  }
}

// Función para cargar y mostrar listados de entidades filtradas por nombre
async function searchEntities(entityType, searchTerm) {
  const entities = await fetchData(
    `${baseUrl}${entityType}/?search=${searchTerm}`
  );

  const nav = document.getElementById("nav");
  nav.innerHTML = ""; // Limpia el contenido actual

  if (entities && entities.results.length > 0) {
    const ul = document.createElement("ul");
    entities.results.forEach((entity, index) => {
      const li = document.createElement("li");
      // Mostrar el nombre, título o modelo de la entidad
      li.textContent = entity.name || entity.title || entity.model;
      li.addEventListener("click", () =>
        displayEntityDetail(entityType, index)
      );
      ul.appendChild(li);
    });
    nav.appendChild(ul);

    // Agregar controles de paginación (si es necesario)
    const pagination = document.createElement("div");
    pagination.className = "pagination";
    if (entities.previous) {
      const prevButton = document.createElement("button");
      prevButton.textContent = "Anterior";
      prevButton.addEventListener("click", () =>
        displayEntities(entityType, entityPages[entityType] - 1)
      );
      pagination.appendChild(prevButton);
    }
    if (entities.next) {
      const nextButton = document.createElement("button");
      nextButton.textContent = "Siguiente";
      nextButton.addEventListener("click", () =>
        displayEntities(entityType, entityPages[entityType] + 1)
      );
      pagination.appendChild(nextButton);
    }
    nav.appendChild(pagination);
  } else {
    nav.textContent = "No se encontraron resultados.";
  }
}

// Obtener el elemento select y la vista de detalles
const entityTypeSelect = document.getElementById("entityTypeSelect");

// Función para borrar resultados de búsqueda y detalles
function clearSearchAndDetails() {
  const nav = document.getElementById("nav");
  nav.innerHTML = ""; // Borrar resultados de búsqueda
  const detailView = document.getElementById("detailView");
  detailView.innerHTML = ""; // Borrar detalles
  const searchTerm = document.getElementById("searchTerm");
  searchTerm.value = ""; // Borrar información adicional
}

// Actualizar la vista de detalles cuando cambia la selección
entityTypeSelect.addEventListener("change", () => {
  clearSearchAndDetails(); // Borrar la búsqueda y los detalles al cambiar la selección
  const selectedEntityType = entityTypeSelect.value;
  displayEntities(selectedEntityType); // Cargar listado en la primera página al cambiar la selección
});

// Obtener el botón de búsqueda
const searchButton = document.getElementById("searchButton");

// Manejar el evento click del botón de búsqueda
searchButton.addEventListener("click", () => {
  const selectedEntityType = entityTypeSelect.value;
  const searchTerm = document.getElementById("searchTerm").value;
  searchEntities(selectedEntityType, searchTerm);
});

// Inicialización
(async () => {
  const initialEntityType = entityTypeSelect.value;
  displayEntities(initialEntityType); // Cargar listado inicial
})();

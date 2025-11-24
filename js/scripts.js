// ==========================================
// Variables de control
// ==========================================
const currentPage = window.location.pathname.split("/").pop(); // nombre del archivo actual
const isInPages = window.location.pathname.includes("/pages/"); // detecta si estamos en carpeta pages
const headerPath = isInPages ? "../header.html" : "header.html"; // ruta relativa correcta
const loaderPath = isInPages ? "../loader.html" : "loader.html"; // ruta para loader

// ==========================================
// Cargar loader global (optimizado)
// ==========================================
fetch(loaderPath)
  .then(response => (response.ok ? response.text() : null))
  .then(loaderHtml => {
    if (!loaderHtml) return;

    document.body.insertAdjacentHTML('afterbegin', loaderHtml);

    const hideLoader = () => {
      const loader = document.getElementById('global-loader');
      if (!loader) return;

      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    };

    document.addEventListener('DOMContentLoaded', () => {
      hideLoader();
    });

    window.addEventListener('load', () => {
      hideLoader();
    });

    // Fallback: quitar loader después de 2 segundos
    setTimeout(() => {
      hideLoader();
    }, 2000);
  })
  .catch(err => console.error('Error al cargar el loader:', err));

// ==========================================
// Cargar header global - CÓDIGO FINAL CORREGIDO
// ==========================================
fetch(headerPath)
  .then((response) => {
    if (!response.ok) throw new Error("Header no encontrado");
    return response.text();
  })
  .then((data) => {
    document.getElementById("header-placeholder").innerHTML = data;

    // ==========================================
    // Marcar enlace activo según página
    // ==========================================
    const links = document.querySelectorAll(".nav__link");
    links.forEach((link) => {
      const linkHref = link.getAttribute("href").split("/").pop();
      if (linkHref === currentPage) {
        link.classList.add("nav__link--active");
      }
    });

    // ==========================================
    // Inicializar menú móvil - CÓDIGO CORREGIDO
    // ==========================================
    const $checkbox = document.querySelector("#menu-toggle");
    const $hamburger = document.querySelector(".nav__hamburger");
    const $navList = document.querySelector(".nav__list");
    const $body = document.querySelector("body");

    if ($checkbox && $hamburger && $navList) {
      
      let resizeTimeout;
      let isResizing = false;

      // Función para abrir/cerrar menú
      const toggleMenu = (open) => {
        if (window.innerWidth <= 950) {
          if (open) {
            $hamburger.classList.add('menu-open');
            $navList.classList.add('menu-open');
            $body.setAttribute("not-scroll", "true");
          } else {
            $hamburger.classList.remove('menu-open');
            $navList.classList.remove('menu-open');
            $body.setAttribute("not-scroll", "false");
          }
          $checkbox.checked = open;
        }
      };

      // Función para resetear a estado desktop
      const resetToDesktop = () => {
        $hamburger.classList.remove('menu-open');
        $navList.classList.remove('menu-open');
        $checkbox.checked = false;
        $body.setAttribute("not-scroll", "false");
        
        // Asegurar que el menú esté oculto en desktop
        $navList.style.display = 'none';
        $hamburger.style.display = 'none';
      };

      // Función para preparar estado móvil
      const prepareForMobile = () => {
        $hamburger.style.display = 'flex';
        $navList.style.display = 'flex';
        $navList.classList.remove('menu-open');
        $hamburger.classList.remove('menu-open');
        $checkbox.checked = false;
        $body.setAttribute("not-scroll", "false");
      };

      // Controlar menú al hacer clic en hamburguesa
      $hamburger.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.innerWidth <= 950) {
          const isOpen = $navList.classList.contains('menu-open');
          toggleMenu(!isOpen);
        }
      });

      // Cerrar menú al hacer clic en enlaces (solo en móvil)
      const navLinks = document.querySelectorAll(".nav__link");
      navLinks.forEach(link => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 950) {
            toggleMenu(false);
          }
        });
      });

      // Cerrar menú al hacer clic fuera (solo en móvil)
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 950 && $navList.classList.contains('menu-open')) {
          const isClickInsideNav = e.target.closest('.nav');
          const isClickOnHamburger = e.target.closest('.nav__hamburger');
          
          if (!isClickInsideNav && !isClickOnHamburger) {
            toggleMenu(false);
          }
        }
      });

      // Manejar resize con debounce mejorado
      window.addEventListener('resize', () => {
        if (!isResizing) {
          isResizing = true;
          
          // Ocultar menú inmediatamente durante el resize
          if (window.innerWidth <= 950) {
            $navList.style.display = 'none';
          }
        }
        
        clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(() => {
          isResizing = false;
          
          if (window.innerWidth > 950) {
            resetToDesktop();
          } else {
            prepareForMobile();
            // Asegurar que el menú esté cerrado después del resize
            toggleMenu(false);
          }
        }, 100);
      });

      // Inicializar estado del menú
      const initializeMenu = () => {
        // Forzar el estado inicial correcto
        if (window.innerWidth <= 950) {
          prepareForMobile();
          // Asegurar que el menú empiece cerrado
          setTimeout(() => {
            $navList.style.display = 'flex';
            toggleMenu(false);
          }, 10);
        } else {
          resetToDesktop();
          // En desktop, asegurar que el menú esté visible
          setTimeout(() => {
            $navList.style.display = 'flex';
          }, 10);
        }
      };

      // Inicializar después de que todo esté cargado
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMenu);
      } else {
        initializeMenu();
      }

      // También inicializar cuando la ventana se carga completamente
      window.addEventListener('load', initializeMenu);
    }
  })
  .catch((err) => console.error("Error cargando el header:", err));

// ==========================================
// Funciones de modales
// ==========================================
function openModal(modalId) {
  const $body = document.querySelector("body");
  const $modal = document.querySelector(`.n-modal-${modalId}`);
  $modal.setAttribute("isOpen", true);
  $body.setAttribute("not-scroll", true);
}

function closeModal(modalId) {
  const $body = document.querySelector("body");
  const $modal = document.querySelector(`.n-modal-${modalId}`);
  $modal.setAttribute("isOpen", false);
  $body.setAttribute("not-scroll", false);
}

// ==========================================
// Manejar tecla ESC para cerrar menú - ACTUALIZADO
// ==========================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const $hamburger = document.querySelector(".nav__hamburger");
    const $navList = document.querySelector(".nav__list");
    const $body = document.querySelector("body");

    if ($navList && $navList.classList.contains('menu-open') && window.innerWidth <= 950) {
      $hamburger.classList.remove('menu-open');
      $navList.classList.remove('menu-open');
      $body.setAttribute("not-scroll", "false");
    }
  }
});
// ==========================================
// Variables de control
// ==========================================
const currentPage = window.location.pathname.split("/").pop();
const isInPages = window.location.pathname.includes("/pages/");
const headerPath = isInPages ? "../header.html" : "header.html";
const loaderPath = isInPages ? "../loader.html" : "loader.html";

// ==========================================
// Detección de captura de pantalla / modo sin loader
// (FireShot, headless, ?noloader, ?capture)
// ==========================================
const params = new URLSearchParams(window.location.search);
const esCaptura =
  params.has('noloader') ||
  params.has('capture') ||
  navigator.webdriver ||
  /FireShot|fireshot|screenshot|fullpage|headless/i.test(navigator.userAgent);

if (esCaptura) {
  // Modo captura: no bloquear animaciones, no mostrar loader
  document.body.classList.add('no-loader');
  document.body.classList.remove('loading');
} else {
  // Modo normal: bloquear animaciones hasta que cargue todo
  document.body.classList.add('loading');
}

// ==========================================
// Cargar loader global (solo si no es captura)
// ==========================================
if (!esCaptura) {
  let loaderHidden = false;
  const MIN_LOADER_TIME = 1000;
  const startTime = Date.now();

  const hideLoader = () => {
    if (loaderHidden) return;

    const elapsed = Date.now() - startTime;
    const remaining = MIN_LOADER_TIME - elapsed;

    const finalHide = () => {
      if (loaderHidden) return;
      loaderHidden = true;
      const loader = document.getElementById('global-loader');
      if (!loader) return;
      loader.style.opacity = '0';
      document.body.classList.remove('loading');
      setTimeout(() => loader.remove(), 500);
    };

    if (remaining > 0) {
      setTimeout(finalHide, remaining);
    } else {
      finalHide();
    }
  };

  fetch(loaderPath)
    .then(response => (response.ok ? response.text() : null))
    .then(loaderHtml => {
      if (!loaderHtml) return;

      document.body.insertAdjacentHTML('afterbegin', loaderHtml);

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
}

// ==========================================
// Cargar header global
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
    // Inicializar menú móvil
    // ==========================================
    const $checkbox = document.querySelector("#menu-toggle");
    const $hamburger = document.querySelector(".nav__hamburger");
    const $navList = document.querySelector(".nav__list");
    const $body = document.querySelector("body");

    if ($checkbox && $hamburger && $navList) {

      let resizeTimeout;
      let isResizing = false;

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

      const resetToDesktop = () => {
        $hamburger.classList.remove('menu-open');
        $navList.classList.remove('menu-open');
        $checkbox.checked = false;
        $body.setAttribute("not-scroll", "false");
        $navList.style.display = 'none';
        $hamburger.style.display = 'none';
      };

      const prepareForMobile = () => {
        $hamburger.style.display = 'flex';
        $navList.style.display = 'flex';
        $navList.classList.remove('menu-open');
        $hamburger.classList.remove('menu-open');
        $checkbox.checked = false;
        $body.setAttribute("not-scroll", "false");
      };

      $hamburger.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.innerWidth <= 950) {
          const isOpen = $navList.classList.contains('menu-open');
          toggleMenu(!isOpen);
        }
      });

      const navLinks = document.querySelectorAll(".nav__link");
      navLinks.forEach(link => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 950) {
            toggleMenu(false);
          }
        });
      });

      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 950 && $navList.classList.contains('menu-open')) {
          const isClickInsideNav = e.target.closest('.nav');
          const isClickOnHamburger = e.target.closest('.nav__hamburger');

          if (!isClickInsideNav && !isClickOnHamburger) {
            toggleMenu(false);
          }
        }
      });

      window.addEventListener('resize', () => {
        if (!isResizing) {
          isResizing = true;
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
            toggleMenu(false);
          }
        }, 100);
      });

      const initializeMenu = () => {
        if (window.innerWidth <= 950) {
          prepareForMobile();
          setTimeout(() => {
            $navList.style.display = 'flex';
            toggleMenu(false);
          }, 10);
        } else {
          resetToDesktop();
          setTimeout(() => {
            $navList.style.display = 'flex';
          }, 10);
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMenu);
      } else {
        initializeMenu();
      }

      window.addEventListener('load', initializeMenu);
    }

    // ==========================================
    // Inicializar fondo de ondas
    // ==========================================
    initWaves();

  })
  .catch((err) => console.error("Error cargando el header:", err));

// ==========================================
// Cargar footer global
// ==========================================
const footerPath = isInPages ? "../footer.html" : "footer.html";
fetch(footerPath)
  .then(response => response.ok ? response.text() : null)
  .then(footerHtml => {
    if (footerHtml) {
      document.body.insertAdjacentHTML('beforeend', footerHtml);
    }
  });

// ==========================================
// Funciones de modales
// ==========================================
function openModal(modalId) {
  const $body = document.querySelector("body");
  const $modal = document.querySelector(`.n-modal-${modalId}`);
  if (!$modal) return;
  $modal.setAttribute("isOpen", true);
  $body.setAttribute("not-scroll", true);
}

function closeModal(modalId) {
  const $body = document.querySelector("body");
  const $modal = document.querySelector(`.n-modal-${modalId}`);
  if (!$modal) return;
  $modal.setAttribute("isOpen", false);
  $body.setAttribute("not-scroll", false);
}

// ==========================================
// ESC para cerrar menú móvil
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

// ==========================================
// Fondo #303232 con partículas grises + amarillas sutiles
// ==========================================
function initWaves() {
  const canvas = document.getElementById('bg-waves');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animId;
  let mouseX = 0.5;
  let mouseY = 0.5;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  let particles = [];
  const PARTICLE_COUNT = 120;

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.size = Math.random() * 2.5 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.speedY = (Math.random() - 0.5) * 0.2;

      const isYellow = Math.random() < 0.2;

      if (isYellow) {
        this.r = 254;
        this.g = 209;
        this.b = 56;
        this.alpha = Math.random() * 0.12 + 0.04;
      } else {
        this.r = Math.floor(Math.random() * 60 + 160);
        this.g = this.r;
        this.b = this.r + 10;
        this.alpha = Math.random() * 0.3 + 0.1;
      }

      this.baseAlpha = this.alpha;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      const dx = (mouseX * window.innerWidth) - this.x;
      const dy = (mouseY * window.innerHeight) - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 120) {
        this.alpha = Math.min(this.baseAlpha + 0.15, 0.35);
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * 2.5;
        this.y -= Math.sin(angle) * 2.5;
      } else {
        this.alpha = this.baseAlpha;
      }

      if (this.x < -50) this.x = window.innerWidth + 50;
      if (this.x > window.innerWidth + 50) this.x = -50;
      if (this.y < -50) this.y = window.innerHeight + 50;
      if (this.y > window.innerHeight + 50) this.y = -50;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`;
      ctx.fill();

      ctx.shadowBlur = 3;
      ctx.shadowColor = `rgba(200, 200, 210, 0.2)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    initParticles();
  }

  function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.fillStyle = '#303232';
    ctx.fillRect(0, 0, w, h);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    animId = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    draw();
  });
  draw();
}
// ================================
// src/js/script.js
// Menu toggle logic and dynamic breadcrumb
// ================================

; (() => {
  // Éléments
  const burger = document.querySelector('[data-btn="burger"]')
  const menuClose = document.querySelector('[data-btn="menu-close"]')
  const overlay = document.querySelector(".menu")

  console.log("[v0] Menu elements:", { burger, menuClose, overlay })

  if (!burger || !overlay) {
    console.log("[v0] Missing required elements!")
    return
  }

  // Fonction pour ouvrir le menu
  function openMenu() {
    overlay.classList.add("menu--open")
    overlay.hidden = false
    overlay.setAttribute("aria-hidden", "false")
    burger.setAttribute("aria-expanded", "true")
    document.body.style.overflow = "hidden"
  }

  function closeMenu() {
    overlay.classList.remove("menu--open")
    overlay.hidden = true
    overlay.setAttribute("aria-hidden", "true")
    burger.setAttribute("aria-expanded", "false")
    document.body.style.overflow = ""
  }


  // Events
  burger.addEventListener("click", openMenu)

  if (menuClose) {
    menuClose.addEventListener("click", closeMenu)
  }

  // Fermer avec Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("menu--open")) {
      closeMenu()
    }
  })

  // Fermer si clic sur le fond
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeMenu()
    }
  })

  document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.querySelector('.header__theme-toggle[data-btn="theme"]');
    const root = document.documentElement; // <html>
    const body = document.body;

    if (!themeToggle) return; // sécurité

    // Fonction qui applique le thème partout
    function applyTheme(theme) {
      const isDark = theme === "dark";

      // 1. Attribut sur <html> pour les variables CSS
      root.setAttribute("data-theme", isDark ? "dark" : "light");

      // 2. Classe sur <body> pour l’anim des icônes (ton CSS .dark-theme ...)
      if (isDark) {
        body.classList.add("dark-theme");
      } else {
        body.classList.remove("dark-theme");
      }

      // 3. Accessibilité du bouton
      themeToggle.setAttribute("aria-pressed", String(isDark));

      // 4. On sauvegarde la préférence
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }

    // Au chargement : on regarde si un thème est déjà sauvegardé
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      applyTheme(savedTheme);
    } else {
      // Sinon, on se base éventuellement sur le thème système
      const prefersDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    }

    // Clic sur le bouton = on bascule
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  });


  // ================================
  // Breadcrumb dynamique
  // ================================
  const pageNames = {
    "index.html": "Accueil",
    "a_propos.html": "À propos",
    "frise.html": "Frise",
    "contact.html": "Contact",
    "galerie.html": "Galerie",
    "article_livre.html": "Les Oubliées de l'Histoire",
    "autre_projet.html": "Autre projet",
    "glossaire.html": "Glossaire",
    "article_note_g.html": "Note G d'Ada Lovelace",
    "article_litterature.html": "Les femmes de science dans la littérature",
    "article_ada.html": "Ada Lovelace",
    "article_film.html": "Radioactive",
  }

  function getCurrentPage() {
    const path = window.location.pathname
    const filename = path.split("/").pop() || "index.html"
    return filename
  }

  function getPageTitle(filename) {
    return pageNames[filename] || filename.replace(".html", "")
  }

  function navigateToBreadcrumbPage(index) {
    const history = JSON.parse(sessionStorage.getItem("breadcrumbHistory") || "[]")

    // Couper l'historique au point cliqué
    const newHistory = history.slice(0, index + 1)
    sessionStorage.setItem("breadcrumbHistory", JSON.stringify(newHistory))

    // Naviguer vers la page
    const page = newHistory[index].page
    window.location.href = `./${page}`
  }

  function updateBreadcrumb() {
    const breadcrumbList = document.querySelector(".breadcrumb__list")
    if (!breadcrumbList) return

    const currentPage = getCurrentPage()

    // Récupérer l'historique depuis sessionStorage
    const history = JSON.parse(sessionStorage.getItem("breadcrumbHistory") || "[]")

    // Ajouter la page actuelle si elle n'est pas déjà la dernière
    const currentTitle = getPageTitle(currentPage)
    if (history.length === 0 || history[history.length - 1].page !== currentPage) {
      history.push({ page: currentPage, title: currentTitle })

      if (history.length > 10) {
        history.shift()
      }

      sessionStorage.setItem("breadcrumbHistory", JSON.stringify(history))
    }

    // Reconstruire le breadcrumb
    breadcrumbList.innerHTML = ""

    // Ajouter l'accueil
    const homeItem = document.createElement("li")
    homeItem.className = "breadcrumb__item"
    homeItem.innerHTML = `
      <a href="./index.html" class="breadcrumb__link breadcrumb__link--home">
        <img src="../assets/icons/home.svg" alt="" class="breadcrumb__icon" aria-hidden="true">
        Accueil
      </a>
    `
    breadcrumbList.appendChild(homeItem)

    // Ajouter les pages intermédiaires et la page actuelle
    history.forEach((item, index) => {
      const separatorItem = document.createElement("li")
      separatorItem.className = "breadcrumb__item"
      separatorItem.innerHTML = '<span class="breadcrumb__separator" aria-hidden="true">›</span>'
      breadcrumbList.appendChild(separatorItem)

      const pageItem = document.createElement("li")
      pageItem.className = "breadcrumb__item"

      if (index === history.length - 1) {
        pageItem.innerHTML = `<span class="breadcrumb__current" aria-current="page">${item.title}</span>`
      } else {
        const link = document.createElement("a")
        link.href = "#"
        link.className = "breadcrumb__link breadcrumb__link--history"
        link.textContent = item.title
        link.addEventListener("click", (e) => {
          e.preventDefault()
          navigateToBreadcrumbPage(index)
        })
        pageItem.appendChild(link)
      }

      breadcrumbList.appendChild(pageItem)
    })

    setTimeout(() => {
      const breadcrumb = document.querySelector(".breadcrumb")
      if (breadcrumb) {
        breadcrumb.scrollLeft = breadcrumb.scrollWidth
      }
    }, 0)
  }

  // Initialiser au chargement
  updateBreadcrumb()
})()

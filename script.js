/**
 * TeckLab166 — script.js
 * Funcionalidades: navegação, busca, filtros, terminal, acessibilidade, newsletter
 * Padrões: WCAG 2.1 AA | keyboard nav | prefers-reduced-motion | ARIA live
 */

'use strict';

/* ── Preferências de motion ───────────────────────────────── */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.classList.contains('reduce-motion');

/* ────────────────────────────────────────────────────────── */
/*  UTILITÁRIOS                                               */
/* ────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function trapFocus(container) {
  const focusable = $$('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])', container);
  if (!focusable.length) return () => {};
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }
  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
}

/* ────────────────────────────────────────────────────────── */
/*  ANO ATUAL NO FOOTER                                       */
/* ────────────────────────────────────────────────────────── */
const yearEl = $('#current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ────────────────────────────────────────────────────────── */
/*  HEADER SCROLL                                             */
/* ────────────────────────────────────────────────────────── */
const header = $('#site-header');

const updateHeader = () => {
  if (!header) return;
  if (window.scrollY > 20) {
    header.style.boxShadow = '0 2px 24px rgba(0,0,0,.5)';
  } else {
    header.style.boxShadow = 'none';
  }
};

window.addEventListener('scroll', updateHeader, { passive: true });

/* ────────────────────────────────────────────────────────── */
/*  NAV LINK ACTIVE (scroll spy)                              */
/* ────────────────────────────────────────────────────────── */
const sections = $$('section[id], div[id="home"]');
const navLinks = $$('.nav-link, .mobile-nav-link');

const onScrollSpy = () => {
  const scrollY = window.scrollY + 100;
  let current = '';
  sections.forEach(sec => {
    if (sec.offsetTop <= scrollY) current = sec.id;
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '');
    const isActive = href === current;
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
    link.classList.toggle('active', isActive);
  });
};

window.addEventListener('scroll', onScrollSpy, { passive: true });

/* ────────────────────────────────────────────────────────── */
/*  MENU MOBILE                                               */
/* ────────────────────────────────────────────────────────── */
const menuBtn    = $('#menu-btn');
const mobileMenu = $('#mobile-menu');
let releaseTrapMenu = null;

function openMenu() {
  mobileMenu.hidden = false;
  mobileMenu.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true');
  menuBtn.setAttribute('aria-label', 'Fechar menu de navegação');
  releaseTrapMenu = trapFocus(mobileMenu);
  const firstLink = $('.mobile-nav-link', mobileMenu);
  firstLink?.focus();
}

function closeMenu() {
  mobileMenu.hidden = true;
  mobileMenu.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Abrir menu de navegação');
  releaseTrapMenu?.();
  releaseTrapMenu = null;
  menuBtn.focus();
}

menuBtn?.addEventListener('click', () => {
  const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMenu() : openMenu();
});

// Fechar ao clicar num link mobile
$$('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Fechar com Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true') closeMenu();
});

/* ────────────────────────────────────────────────────────── */
/*  SEARCH DIALOG                                             */
/* ────────────────────────────────────────────────────────── */
const searchToggle = $('#search-toggle');
const searchDialog = $('#search-dialog');
const searchClose  = $('#search-close');
const searchInput  = $('#search-input');
const searchResults = $('#search-results');
let releaseTrapSearch = null;
let lastFocused = null;

// Dados fictícios para simulação de busca
const SEARCH_DATA = [
  { title: 'Docker multi-stage build para produção', url: '#tutorials', category: 'Tutorial' },
  { title: 'Nginx como reverse proxy com SSL gratuito', url: '#tutorials', category: 'Tutorial' },
  { title: 'Migrations com controle de versão no PostgreSQL', url: '#tutorials', category: 'Tutorial' },
  { title: 'Hardening básico de servidor Linux', url: '#tutorials', category: 'Tutorial' },
  { title: 'GitHub Actions do zero ao deploy automatizado', url: '#tutorials', category: 'Tutorial' },
  { title: 'Monitor de Serviços', url: '#apps', category: 'Aplicação' },
  { title: 'Log Analyzer CLI', url: '#apps', category: 'Aplicação' },
  { title: 'Deploy Automático', url: '#apps', category: 'Aplicação' },
  { title: 'API Rate Limiter', url: '#apps', category: 'Aplicação' },
  { title: 'Vazamento de memória em produção', url: '#cases', category: 'Caso' },
  { title: 'Queries SQL lentas no pico de tráfego', url: '#cases', category: 'Caso' },
  { title: 'Falha silenciosa em microserviço', url: '#cases', category: 'Caso' },
];

function openSearch() {
  lastFocused = document.activeElement;
  searchDialog.hidden = false;
  searchToggle?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  releaseTrapSearch = trapFocus(searchDialog);
  setTimeout(() => searchInput?.focus(), 50);
}

function closeSearch() {
  searchDialog.hidden = true;
  searchToggle?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  releaseTrapSearch?.();
  releaseTrapSearch = null;
  if (searchInput) searchInput.value = '';
  if (searchResults) searchResults.innerHTML = '';
  lastFocused?.focus();
}

searchToggle?.addEventListener('click', openSearch);
searchClose?.addEventListener('click', closeSearch);

searchDialog?.addEventListener('click', e => {
  if (e.target === searchDialog) closeSearch();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !searchDialog?.hidden) closeSearch();
});

// Busca em tempo real
let searchTimer;
searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchResults.innerHTML = ''; return; }

    const found = SEARCH_DATA.filter(item =>
      item.title.toLowerCase().includes(q)
    );

    if (!found.length) {
      searchResults.innerHTML = `<p style="color:var(--clr-muted);font-size:.85rem;">Nenhum resultado para "<strong>${q}</strong>"</p>`;
      return;
    }

    searchResults.innerHTML = `
      <p style="font-size:.75rem;color:var(--clr-muted);margin-bottom:.5rem">${found.length} resultado(s)</p>
      <ul style="display:flex;flex-direction:column;gap:.5rem;list-style:none">
        ${found.map(r => `
          <li>
            <a href="${r.url}" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.6rem .75rem;border-radius:6px;background:var(--clr-surface-2);border:1px solid var(--clr-border);text-decoration:none;color:var(--clr-text);font-size:.85rem;transition:border-color .2s"
               onclick="closeSearch()"
               onmouseover="this.style.borderColor='var(--clr-accent)'"
               onmouseout="this.style.borderColor='var(--clr-border)'">
              <span>${r.title}</span>
              <span style="font-size:.7rem;color:var(--clr-accent);white-space:nowrap;background:color-mix(in srgb,var(--clr-accent) 10%,transparent);padding:2px .5rem;border-radius:99px">${r.category}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    `;
  }, 200);
});

// Expor closeSearch globalmente (usado nos links de resultado)
window.closeSearch = closeSearch;

// Atalho de teclado: / para abrir busca
document.addEventListener('keydown', e => {
  const tag = document.activeElement?.tagName;
  if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && searchDialog?.hidden) {
    e.preventDefault();
    openSearch();
  }
});

/* ────────────────────────────────────────────────────────── */
/*  FILTRO DE TUTORIAIS                                       */
/* ────────────────────────────────────────────────────────── */
const filterBtns = $$('.filter-btn');
const postItems  = $$('.post-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    // Update ARIA e visual
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    // Filtrar posts
    postItems.forEach(item => {
      const cat = item.dataset.category;
      const show = filter === 'all' || cat === filter;
      item.hidden = !show;
      item.setAttribute('aria-hidden', String(!show));
    });

    // Anunciar para leitores de tela
    const visible = postItems.filter(i => !i.hidden).length;
    const liveEl = $('#tutorials-list');
    liveEl?.setAttribute('aria-label',
      `Lista de tutoriais — ${visible} item(s) exibido(s) para filtro: ${btn.textContent}`
    );
  });
});

// Navegação por teclado no filter-bar (setas)
const filterBar = $('.filter-bar');
filterBar?.addEventListener('keydown', e => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
  e.preventDefault();
  const btns = $$('.filter-btn', filterBar);
  const idx = btns.indexOf(document.activeElement);
  let next = idx;
  if (e.key === 'ArrowRight') next = (idx + 1) % btns.length;
  if (e.key === 'ArrowLeft')  next = (idx - 1 + btns.length) % btns.length;
  if (e.key === 'Home')       next = 0;
  if (e.key === 'End')        next = btns.length - 1;
  btns[next]?.focus();
});

/* ────────────────────────────────────────────────────────── */
/*  CONTADOR ANIMADO (stats)                                  */
/* ────────────────────────────────────────────────────────── */
const statNumbers = $$('.stat-number[data-target]');

function animateCounter(el) {
  if (prefersReducedMotion()) {
    el.textContent = el.dataset.target;
    return;
  }
  const target = parseInt(el.dataset.target, 10);
  const duration = 1200;
  const step = 16;
  const increment = target / (duration / step);
  let current = 0;

  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = Math.floor(current);
    if (current >= target) clearInterval(timer);
  }, step);
}

// Disparar quando entrar na viewport
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => statsObserver.observe(el));

/* ────────────────────────────────────────────────────────── */
/*  TERMINAL ANIMADO (decorativo)                             */
/* ────────────────────────────────────────────────────────── */
const terminalBody = $('#terminal-body');
const TERMINAL_LINES = [
  { text: '$ git clone https://github.com/tecklab166/lab', color: '#d4d4d4' },
  { text: 'Cloning into \'lab\'...', color: '#888' },
  { text: 'remote: Counting objects: 248, done.', color: '#888' },
  { text: '$ cd lab && npm install', color: '#d4d4d4' },
  { text: 'added 142 packages in 3.2s', color: '#888' },
  { text: '$ npm run dev', color: '#d4d4d4' },
  { text: '✓ Server running on port 3000', color: '#00e5a0' },
  { text: '✓ Database connected', color: '#00e5a0' },
  { text: '✓ Ready — troubleshooting mode: ON', color: '#00e5a0' },
];

async function runTerminal() {
  if (!terminalBody || prefersReducedMotion()) {
    if (terminalBody) {
      terminalBody.innerHTML = TERMINAL_LINES.map(l =>
        `<div style="color:${l.color}">${l.text}</div>`
      ).join('');
    }
    return;
  }

  for (const line of TERMINAL_LINES) {
    await new Promise(res => setTimeout(res, 420));
    const div = document.createElement('div');
    div.style.color = line.color;
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.2s';
    div.textContent = '';
    terminalBody.appendChild(div);
    terminalBody.scrollTop = terminalBody.scrollHeight;

    // Typing effect
    await new Promise(res => setTimeout(res, 60));
    div.style.opacity = '1';
    for (const char of line.text) {
      div.textContent += char;
      await new Promise(res => setTimeout(res, 18));
    }
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Cursor piscante ao final
  const cursor = document.createElement('span');
  cursor.textContent = '▋';
  cursor.style.cssText = 'color:var(--clr-accent);animation:blink 1s step-end infinite';
  const style = document.createElement('style');
  style.textContent = '@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}';
  document.head.appendChild(style);
  terminalBody.appendChild(cursor);
}

window.addEventListener('load', () => setTimeout(runTerminal, 600));

/* ────────────────────────────────────────────────────────── */
/*  SCROLL REVEAL                                             */
/* ────────────────────────────────────────────────────────── */
if (!prefersReducedMotion()) {
  const revealEls = $$('.card, .post-item, .case-card, .value-item, .section-header');

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObs.observe(el));
}

/* ────────────────────────────────────────────────────────── */
/*  BACK TO TOP                                               */
/* ────────────────────────────────────────────────────────── */
const backToTop = $('#back-to-top');

window.addEventListener('scroll', () => {
  if (!backToTop) return;
  backToTop.hidden = window.scrollY < 400;
}, { passive: true });

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
  // Move foco para o conteúdo principal para leitores de tela
  setTimeout(() => $('#main-content')?.focus(), 300);
});

/* ────────────────────────────────────────────────────────── */
/*  NEWSLETTER FORM                                           */
/* ────────────────────────────────────────────────────────── */
const newsletterForm     = $('#newsletter-form');
const newsletterEmail    = $('#newsletter-email');
const emailError         = $('#email-error');
const newsletterFeedback = $('#newsletter-feedback');

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

newsletterForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = newsletterEmail.value.trim();

  // Limpar erros anteriores
  emailError.hidden = true;
  emailError.textContent = '';
  newsletterEmail.removeAttribute('aria-invalid');
  newsletterFeedback.textContent = '';

  if (!email) {
    emailError.textContent = 'Por favor, informe seu e-mail.';
    emailError.hidden = false;
    newsletterEmail.setAttribute('aria-invalid', 'true');
    newsletterEmail.focus();
    return;
  }

  if (!validateEmail(email)) {
    emailError.textContent = 'E-mail inválido. Verifique o formato (ex: nome@dominio.com)';
    emailError.hidden = false;
    newsletterEmail.setAttribute('aria-invalid', 'true');
    newsletterEmail.focus();
    return;
  }

  // Simular envio
  const submitBtn = newsletterForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  await new Promise(res => setTimeout(res, 1000));

  submitBtn.disabled = false;
  submitBtn.textContent = 'Inscrever-se';
  newsletterEmail.value = '';

  newsletterFeedback.innerHTML = `
    <span style="color:var(--clr-accent)">✓ Inscrição confirmada!</span>
    Você receberá novos posts no e-mail cadastrado.
  `;
});

/* ────────────────────────────────────────────────────────── */
/*  ACESSIBILIDADE — ALTO CONTRASTE                           */
/* ────────────────────────────────────────────────────────── */
const contrastToggle = $('#contrast-toggle');
const footerContrast = $('#footer-contrast');

function toggleContrast() {
  const enabled = document.documentElement.classList.toggle('high-contrast');
  const label = enabled ? 'Desativar alto contraste' : 'Ativar alto contraste';

  contrastToggle?.setAttribute('aria-pressed', String(enabled));
  contrastToggle?.setAttribute('aria-label', label);
  footerContrast?.setAttribute('aria-pressed', String(enabled));

  try { localStorage.setItem('tl166-contrast', String(enabled)); } catch (_) {}
}

contrastToggle?.addEventListener('click', toggleContrast);
footerContrast?.addEventListener('click', (e) => { e.preventDefault(); toggleContrast(); });

/* ────────────────────────────────────────────────────────── */
/*  ACESSIBILIDADE — FONTE MAIOR                              */
/* ────────────────────────────────────────────────────────── */
const fontToggle = $('#font-toggle');
const footerFont = $('#footer-font');

function toggleFont() {
  const enabled = document.documentElement.classList.toggle('large-text');
  const label = enabled ? 'Restaurar tamanho da fonte' : 'Aumentar tamanho da fonte';

  fontToggle?.setAttribute('aria-pressed', String(enabled));
  fontToggle?.setAttribute('aria-label', label);
  footerFont?.setAttribute('aria-pressed', String(enabled));

  try { localStorage.setItem('tl166-large-text', String(enabled)); } catch (_) {}
}

fontToggle?.addEventListener('click', toggleFont);
footerFont?.addEventListener('click', (e) => { e.preventDefault(); toggleFont(); });

/* ────────────────────────────────────────────────────────── */
/*  ACESSIBILIDADE — REDUZIR MOVIMENTO                        */
/* ────────────────────────────────────────────────────────── */
const footerMotion = $('#footer-motion');

function toggleMotion() {
  const enabled = document.documentElement.classList.toggle('reduce-motion');
  footerMotion?.setAttribute('aria-pressed', String(enabled));
  try { localStorage.setItem('tl166-reduce-motion', String(enabled)); } catch (_) {}
}

footerMotion?.addEventListener('click', (e) => { e.preventDefault(); toggleMotion(); });

/* ── Restaurar preferências salvas ────────────────────────── */
(function restorePrefs() {
  try {
    if (localStorage.getItem('tl166-contrast') === 'true') {
      document.documentElement.classList.add('high-contrast');
      contrastToggle?.setAttribute('aria-pressed', 'true');
      footerContrast?.setAttribute('aria-pressed', 'true');
    }
    if (localStorage.getItem('tl166-large-text') === 'true') {
      document.documentElement.classList.add('large-text');
      fontToggle?.setAttribute('aria-pressed', 'true');
      footerFont?.setAttribute('aria-pressed', 'true');
    }
    if (localStorage.getItem('tl166-reduce-motion') === 'true') {
      document.documentElement.classList.add('reduce-motion');
      footerMotion?.setAttribute('aria-pressed', 'true');
    }
  } catch (_) {}
})();

/* ────────────────────────────────────────────────────────── */
/*  SMOOTH SCROLL ACESSÍVEL                                   */
/* ────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const targetId = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth' });

    // Move foco para a seção (acessibilidade)
    setTimeout(() => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }, prefersReducedMotion() ? 0 : 400);
  });
});

/* ────────────────────────────────────────────────────────── */
/*  ANUNCIAR MUDANÇAS DE ROTA PARA SCREEN READERS             */
/* ────────────────────────────────────────────────────────── */
const routeAnnouncer = document.createElement('div');
routeAnnouncer.setAttribute('aria-live', 'polite');
routeAnnouncer.setAttribute('aria-atomic', 'true');
routeAnnouncer.className = 'sr-only';
document.body.appendChild(routeAnnouncer);

$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    const targetId = link.getAttribute('href').slice(1);
    const section = document.getElementById(targetId);
    if (!section) return;
    const heading = section.querySelector('h1, h2');
    if (heading) {
      setTimeout(() => {
        routeAnnouncer.textContent = `Navegando para: ${heading.textContent.trim()}`;
      }, 500);
    }
  });
});

/* ────────────────────────────────────────────────────────── */
/*  DETECTAR NAVEGAÇÃO POR TECLADO (mostrar foco)             */
/* ────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

// Aplicar estilo de foco apenas na navegação por teclado
const focusStyle = document.createElement('style');
focusStyle.textContent = `
  body:not(.keyboard-nav) *:focus { outline: none !important; }
  body.keyboard-nav *:focus-visible { outline: 2px solid var(--clr-accent) !important; outline-offset: 3px !important; }
`;
document.head.appendChild(focusStyle);

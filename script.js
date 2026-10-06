/* =========================================================
   MAVEN STUDIO — Script
   Nav behaviour + GSAP / ScrollTrigger choreography
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------
     Sticky header state on scroll
  --------------------------------------------------- */
  const header = document.getElementById('siteHeader');

  const updateHeaderState = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  /* ---------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navMobilePanel = document.getElementById('navMobilePanel');

  const closeMobileNav = () => {
    navMobilePanel.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navMobilePanel.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  });

  navMobilePanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  /* ---------------------------------------------------
     Bail out gracefully if GSAP failed to load
     (site still fully readable/functional without it)
  --------------------------------------------------- */
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  if (reduceMotion) return; // respect user preference — skip motion entirely

  /* ---------------------------------------------------
     Hero entrance — the one big orchestrated moment
  --------------------------------------------------- */
  function heroIntro() {
    gsap.set('.hero-logo', { opacity: 0, y: 24, scale: 0.94 });
    gsap.set('.hero-title .line', { opacity: 0, y: 36 });
    gsap.set('.hero-sub', { opacity: 0, y: 20 });
    gsap.set('.scroll-cue', { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .2 });

    tl.to('.hero-logo', { opacity: 1, y: 0, scale: 1, duration: 1.3 })
      .to('.hero-title .line', { opacity: 1, y: 0, duration: 1.1, stagger: .18 }, '-=0.75')
      .to('.hero-sub', { opacity: 1, y: 0, duration: 1 }, '-=0.6')
      .to('.scroll-cue', { opacity: 1, duration: .8 }, '-=0.3');
  }

  /* ---------------------------------------------------
     Subtle parallax on the hero background glow
  --------------------------------------------------- */
  function heroParallax() {
    // yPercent (scroll-driven) is a separate transform channel from the
    // plain x/y (cursor-driven) used in heroCursorGlow, so the two compose
    // instead of fighting over the same value.
    gsap.to('.hero-glow', {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  /* ---------------------------------------------------
     Scroll reveals — About text, section heading, CTA
  --------------------------------------------------- */
  function scrollReveals() {
    const items = gsap.utils.toArray('.reveal:not(.poster-card)');

    items.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 42 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        }
      );
    });

    // Each poster slate (Work, Projects) reveals as its own staggered group
    document.querySelectorAll('.poster-grid').forEach((grid) => {
      gsap.fromTo(
        grid.querySelectorAll('.poster-card'),
        { opacity: 0, y: 50, scale: .96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: .9,
          ease: 'power3.out',
          stagger: .15,
          scrollTrigger: { trigger: grid, start: 'top 80%' }
        }
      );
    });
  }

  /* ---------------------------------------------------
     Hero glow follows the cursor — pointer devices only
  --------------------------------------------------- */
  function heroCursorGlow() {
    const hero = document.querySelector('.hero');
    const glow = document.querySelector('.hero-glow');
    if (!hero || !glow || !window.matchMedia('(pointer: fine)').matches) return;

    const setX = gsap.quickTo(glow, 'x', { duration: 1.1, ease: 'power3.out' });
    const setY = gsap.quickTo(glow, 'y', { duration: 1.1, ease: 'power3.out' });

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setX(px * 60);
      setY(py * 60);
    });
  }

  /* ---------------------------------------------------
     Magnetic buttons — nudge toward the cursor on hover
  --------------------------------------------------- */
  function magneticButtons() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.querySelectorAll('.magnetic').forEach((btn) => {
      const setX = gsap.quickTo(btn, 'x', { duration: .5, ease: 'power3.out' });
      const setY = gsap.quickTo(btn, 'y', { duration: .5, ease: 'power3.out' });

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        setX((e.clientX - rect.left - rect.width / 2) * .35);
        setY((e.clientY - rect.top - rect.height / 2) * .35);
      });

      btn.addEventListener('mouseleave', () => {
        setX(0);
        setY(0);
      });
    });
  }

  /* ---------------------------------------------------
     Poster card magnetic tilt — responds to the cursor
  --------------------------------------------------- */
  function cardTilt() {
    const cards = document.querySelectorAll('.poster-card');

    cards.forEach((card) => {
      const setRotateX = gsap.quickTo(card, 'rotateX', { duration: .5, ease: 'power3.out' });
      const setRotateY = gsap.quickTo(card, 'rotateY', { duration: .5, ease: 'power3.out' });
      const setY = gsap.quickTo(card, 'y', { duration: .5, ease: 'power3.out' });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setRotateY(px * 8);
        setRotateX(py * -8);
      });

      card.addEventListener('mouseenter', () => setY(-8));

      card.addEventListener('mouseleave', () => {
        setRotateX(0);
        setRotateY(0);
        setY(0);
      });
    });
  }

  /* ---------------------------------------------------
     Cursor tag — a small floating label (PLAY / SHOP / VIEW)
     that tracks the cursor while it's over a poster card
  --------------------------------------------------- */
  function cursorTag() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const tag = document.getElementById('cursorTag');
    const tagText = document.getElementById('cursorTagText');
    if (!tag || !tagText) return;

    gsap.set(tag, { xPercent: -50, yPercent: -50 });
    const setX = gsap.quickTo(tag, 'x', { duration: .35, ease: 'power3.out' });
    const setY = gsap.quickTo(tag, 'y', { duration: .35, ease: 'power3.out' });

    document.querySelectorAll('.poster-card').forEach((card) => {
      const label = card.dataset.cursorLabel || 'View';

      card.addEventListener('mouseenter', () => {
        tagText.textContent = label;
        tag.classList.add('is-visible');
      });

      card.addEventListener('mousemove', (e) => {
        setX(e.clientX);
        setY(e.clientY);
      });

      card.addEventListener('mouseleave', () => {
        tag.classList.remove('is-visible');
      });
    });
  }

  heroIntro();
  heroParallax();
  heroCursorGlow();
  scrollReveals();
  cardTilt();
  magneticButtons();
  cursorTag();

});

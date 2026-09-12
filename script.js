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
    gsap.to('.hero-glow', {
      y: 120,
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
    const items = gsap.utils.toArray('.reveal:not(.work-card)');

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

    // Work cards: staggered reveal as a group
    gsap.fromTo(
      '.work-card',
      { opacity: 0, y: 50, scale: .96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: .9,
        ease: 'power3.out',
        stagger: .15,
        scrollTrigger: { trigger: '.work-grid', start: 'top 80%' }
      }
    );
  }

  /* ---------------------------------------------------
     Work card magnetic tilt — responds to the cursor
  --------------------------------------------------- */
  function cardTilt() {
    const cards = document.querySelectorAll('.work-card');

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

  heroIntro();
  heroParallax();
  scrollReveals();
  cardTilt();

});

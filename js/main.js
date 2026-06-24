/* ============================================================
   DIGISYN CO. — MAIN JS v7
   Navigation, Scroll Reveals, Parallax, FAQ, Mobile Menu
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-ready');

  /* ----- NAV SCROLL EFFECT ----- */
  const nav = document.querySelector('.nav');
  if (nav) {
    let lastScroll = 0;
    const handleNavScroll = () => {
      const y = window.scrollY;
      if (y > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      lastScroll = y;
    };
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  /* ----- SCROLL REVEAL (IntersectionObserver) ----- */
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger';
  const revealEls = document.querySelectorAll(revealSelectors);

  if (revealEls.length > 0) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.02,
      rootMargin: '40px'
    });

    revealEls.forEach(el => revealObs.observe(el));

    // Safety net — force-show after 4s in case observer doesn't fire
    setTimeout(() => {
      document.querySelectorAll(revealSelectors + ':not(.visible)').forEach(el => {
        el.classList.add('visible');
      });
    }, 4000);
  }

  /* ----- PARALLAX EFFECT ----- */
  const parallaxBgs = document.querySelectorAll('.parallax-bg');
  if (parallaxBgs.length > 0) {
    const handleParallax = () => {
      const scrollY = window.scrollY;
      parallaxBgs.forEach(bg => {
        const parent = bg.closest('.parallax-container');
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        const viewH = window.innerHeight;
        // Only animate when in viewport
        if (rect.bottom > 0 && rect.top < viewH) {
          const progress = (rect.top + rect.height / 2) / viewH;
          const offset = (progress - 0.5) * 60; // max 30px movement
          bg.style.transform = `translateY(${offset}px)`;
        }
      });
    };
    window.addEventListener('scroll', handleParallax, { passive: true });
    handleParallax();
  }

  /* ----- CSS PARALLAX FOR HERO SHAPES ----- */
  const heroShapes = document.querySelectorAll('.hero-shape');
  if (heroShapes.length > 0) {
    const handleShapeParallax = () => {
      const scrollY = window.scrollY;
      heroShapes.forEach((shape, i) => {
        const speed = 0.15 + (i * 0.1);
        shape.style.transform = `translateY(${scrollY * speed}px)`;
      });
    };
    window.addEventListener('scroll', handleShapeParallax, { passive: true });
  }

  /* ----- MOBILE MENU ----- */
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isActive = menu.classList.contains('active');
      if (isActive) {
        menu.classList.remove('active');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        menu.classList.add('active');
        toggle.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      toggle.setAttribute('aria-expanded', !isActive);
    });

    // Close mobile menu when a link is clicked
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('active');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----- FAQ ACCORDION ----- */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-a');
      const wasActive = item.classList.contains('active');

      // Close all siblings
      const container = item.parentElement;
      container.querySelectorAll('.faq-item.active').forEach(sib => {
        sib.classList.remove('active');
        sib.querySelector('.faq-a').style.maxHeight = '0';
      });

      // Open clicked (if it wasn't already open)
      if (!wasActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ----- STICKY MOBILE CTA ----- */
  const stickyCta = document.querySelector('.sticky-cta');
  if (stickyCta) {
    let stickyShown = false;
    const handleSticky = () => {
      const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPct > 0.3 && !stickyShown) {
        stickyCta.classList.add('visible');
        stickyShown = true;
      }
    };
    window.addEventListener('scroll', handleSticky, { passive: true });
  }

  /* ----- READING PROGRESS BAR (blog posts) ----- */
  const progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    const handleProgress = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = Math.min((window.scrollY / docH) * 100, 100);
      progressBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', handleProgress, { passive: true });
  }

  /* ----- SMOOTH ANCHOR LINKS ----- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ----- COUNTER ANIMATION (Stats) ----- */
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (counters.length > 0) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.getAttribute('data-count');
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          const isDecimal = target.includes('.');
          const numTarget = parseFloat(target);
          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = isDecimal
              ? (numTarget * eased).toFixed(1)
              : Math.floor(numTarget * eased);
            el.textContent = prefix + current + suffix;
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              el.textContent = prefix + target + suffix;
            }
          };
          requestAnimationFrame(animate);
          counterObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObs.observe(el));
  }

});

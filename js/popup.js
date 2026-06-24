/* ============================================================
   DIGISYN CO. — LEAD CAPTURE POPUP v7
   Timed + scroll-triggered, non-intrusive, localStorage aware
   ============================================================ */

(function() {
  // Updated 2026-05-28 per 30-day action plan:
  // Was: 15s OR 45% scroll. Aggressive on brand-search arrivals.
  // Now: 30s AND 60% scroll. Only engaged readers see the popup.
  const POPUP_DELAY_MS = 30000;     // Show after 30 seconds
  const SCROLL_TRIGGER = 0.60;      // AND after scrolling 60%
  const DISMISS_DAYS = 7;           // Don't show again for 7 days after dismiss
  const SUBMIT_DAYS = 30;           // Don't show again for 30 days after submit
  const STORAGE_KEY = 'digisyn_popup';

  function getPopupState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }

  function setPopupState(action) {
    try {
      const days = action === 'submit' ? SUBMIT_DAYS : DISMISS_DAYS;
      const expires = Date.now() + (days * 24 * 60 * 60 * 1000);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ action, expires }));
    } catch (e) {
      // localStorage not available, popup will show again next visit
    }
  }

  function shouldShow() {
    const state = getPopupState();
    if (!state) return true;
    return Date.now() > state.expires;
  }

  function init() {
    if (!shouldShow()) return;

    const overlay = document.querySelector('.popup-overlay');
    if (!overlay) return;

    const popup = overlay.querySelector('.popup');
    const closeBtn = overlay.querySelector('.popup-close');
    const form = overlay.querySelector('.popup-form');
    let shown = false;

    function showPopup() {
      if (shown) return;
      shown = true;
      overlay.classList.add('active');
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    function hidePopup(action) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      setPopupState(action || 'dismiss');
      // Clean up listeners
      window.removeEventListener('scroll', scrollCheck);
      clearTimeout(timer);
    }

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', () => hidePopup('dismiss'));
    }

    // Click outside popup
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        hidePopup('dismiss');
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        hidePopup('dismiss');
      }
    });

    // Form submit
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value.trim() : '';

        if (email) {
          // Submit to Formspree
          fetch('https://formspree.io/f/xqeweyqv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email: email, _subject: 'New Popup Lead - Digisyn Co.' })
          }).catch(function() {});

          // Show success state
          const formContent = form.closest('.popup');
          if (formContent) {
            formContent.innerHTML = `
              <button class="popup-close" aria-label="Close">&times;</button>
              <div style="text-align:center;padding:20px 0;">
                <div style="font-size:3rem;margin-bottom:16px;">✓</div>
                <h3 style="margin-bottom:8px;">You're In!</h3>
                <p style="font-size:0.92rem;color:var(--text-muted);">Check your inbox for your free website audit guide. We'll be in touch soon.</p>
              </div>
            `;
            // Re-attach close handler
            formContent.querySelector('.popup-close').addEventListener('click', () => hidePopup('submit'));
            setTimeout(() => hidePopup('submit'), 4000);
          }
        }
      });
    }

    // Trigger logic — AND, not OR.
    // Popup shows when BOTH (a) 30s elapsed AND (b) user has scrolled 60%.
    // This filters out brand-search visitors who haven't engaged with content yet.
    let timeReady = false;
    let scrollReady = false;

    function maybeShow() {
      if (timeReady && scrollReady) showPopup();
    }

    // Time condition
    const timer = setTimeout(() => {
      timeReady = true;
      maybeShow();
    }, POPUP_DELAY_MS);

    // Scroll condition
    function scrollCheck() {
      const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPct >= SCROLL_TRIGGER) {
        scrollReady = true;
        maybeShow();
      }
    }
    window.addEventListener('scroll', scrollCheck, { passive: true });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

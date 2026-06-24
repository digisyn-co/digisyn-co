/* ============================================================
   DIGISYN CO. — CAROUSEL v7
   Lightweight carousel for testimonials & template gallery
   Touch-enabled, responsive, auto-advances
   ============================================================ */

class DigisynCarousel {
  constructor(wrapper, options = {}) {
    this.wrapper = wrapper;
    this.track = wrapper.querySelector('.carousel-track');
    if (!this.track) return;

    this.items = Array.from(this.track.children);
    this.totalItems = this.items.length;
    this.currentIndex = 0;
    this.autoPlay = options.autoPlay !== false;
    this.autoPlayInterval = options.interval || 5000;
    this.autoPlayTimer = null;

    // Touch tracking
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;

    this.init();
  }

  init() {
    this.calculateVisibleItems();
    this.buildControls();
    this.bindEvents();
    this.updatePosition(false);

    if (this.autoPlay && this.maxIndex > 0) {
      this.startAutoPlay();
    }
  }

  calculateVisibleItems() {
    const wrapperWidth = this.wrapper.offsetWidth;
    if (wrapperWidth <= 600) {
      this.visibleItems = 1;
    } else if (wrapperWidth <= 900) {
      this.visibleItems = 2;
    } else {
      this.visibleItems = 3;
    }
    this.maxIndex = Math.max(0, this.totalItems - this.visibleItems);
  }

  buildControls() {
    // Check if controls already exist
    if (this.wrapper.querySelector('.carousel-controls')) return;

    if (this.maxIndex <= 0) return;

    const controls = document.createElement('div');
    controls.className = 'carousel-controls';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-btn carousel-prev';
    prevBtn.innerHTML = '&#8592;';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.addEventListener('click', () => this.prev());

    // Dots
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    const dotCount = this.maxIndex + 1;
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      dots.appendChild(dot);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-btn carousel-next';
    nextBtn.innerHTML = '&#8594;';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.addEventListener('click', () => this.next());

    controls.appendChild(prevBtn);
    controls.appendChild(dots);
    controls.appendChild(nextBtn);
    this.wrapper.appendChild(controls);

    this.dotsContainer = dots;
  }

  bindEvents() {
    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.calculateVisibleItems();
        this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
        this.updatePosition(false);
      }, 200);
    });

    // Touch events
    this.track.addEventListener('touchstart', (e) => this.touchStart(e), { passive: true });
    this.track.addEventListener('touchmove', (e) => this.touchMove(e), { passive: false });
    this.track.addEventListener('touchend', () => this.touchEnd());

    // Mouse drag events
    this.track.addEventListener('mousedown', (e) => this.touchStart(e));
    this.track.addEventListener('mousemove', (e) => this.touchMove(e));
    this.track.addEventListener('mouseup', () => this.touchEnd());
    this.track.addEventListener('mouseleave', () => {
      if (this.isDragging) this.touchEnd();
    });

    // Pause auto-play on hover
    this.wrapper.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.wrapper.addEventListener('mouseleave', () => {
      if (this.autoPlay) this.startAutoPlay();
    });
  }

  touchStart(e) {
    this.isDragging = true;
    this.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    this.prevTranslate = this.currentTranslate;
    this.track.style.transition = 'none';
    this.stopAutoPlay();
  }

  touchMove(e) {
    if (!this.isDragging) return;
    const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    const diff = currentX - this.startX;
    this.currentTranslate = this.prevTranslate + diff;
    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    if (e.cancelable) e.preventDefault();
  }

  touchEnd() {
    this.isDragging = false;
    this.track.style.transition = '';
    const diff = this.currentTranslate - this.prevTranslate;
    const threshold = this.getItemWidth() * 0.2;

    if (diff < -threshold && this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    } else if (diff > threshold && this.currentIndex > 0) {
      this.currentIndex--;
    }

    this.updatePosition(true);
    if (this.autoPlay) this.startAutoPlay();
  }

  getItemWidth() {
    if (this.items.length === 0) return 0;
    const style = getComputedStyle(this.track);
    const gap = parseFloat(style.gap) || 32;
    return this.items[0].offsetWidth + gap;
  }

  updatePosition(animate) {
    const itemWidth = this.getItemWidth();
    this.currentTranslate = -(this.currentIndex * itemWidth);

    if (!animate) {
      this.track.style.transition = 'none';
    } else {
      this.track.style.transition = '';
    }

    this.track.style.transform = `translateX(${this.currentTranslate}px)`;

    // Force reflow if no animation
    if (!animate) {
      this.track.offsetHeight;
      this.track.style.transition = '';
    }

    this.updateDots();
  }

  updateDots() {
    if (!this.dotsContainer) return;
    const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }

  next() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Loop
    }
    this.updatePosition(true);
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.maxIndex; // Loop
    }
    this.updatePosition(true);
  }

  goTo(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
    this.updatePosition(true);
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => this.next(), this.autoPlayInterval);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }
}

/* ----- AUTO-INIT ALL CAROUSELS ----- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const autoPlay = wrapper.getAttribute('data-autoplay') !== 'false';
    const interval = parseInt(wrapper.getAttribute('data-interval')) || 5000;
    new DigisynCarousel(wrapper, { autoPlay, interval });
  });
});

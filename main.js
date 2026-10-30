/**
 * NOCTIS — Scrollytelling & Interaction Engine (High Performance Edition)
 * Target: Steady 60+ FPS, Zero Layout Thrashing, Hardware Accelerated
 * Pure Vanilla JavaScript (No libraries, no frameworks)
 */

(function () {
  'use strict';

  if (typeof NOCTIS_CONFIG === 'undefined') {
    console.error('NOCTIS_CONFIG is not defined. Ensure config.js is loaded first.');
    return;
  }

  const cfg = NOCTIS_CONFIG;

  // DOM Elements
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderCount = document.getElementById('preloader-count');
  const siteHeader = document.getElementById('site-header');

  const heroSection = document.getElementById('hero');
  const heroCanvas = document.getElementById('hero-canvas');
  const heroProgressFill = document.getElementById('hero-progress-fill');
  const hudChapter = document.getElementById('hud-chapter');
  const hudSpeed = document.getElementById('hud-speed');
  const hudDist = document.getElementById('hud-dist');
  const heroChapters = [
    document.getElementById('hero-c1'),
    document.getElementById('hero-c2'),
    document.getElementById('hero-c3'),
    document.getElementById('hero-c4')
  ];

  const statementSection = document.getElementById('statement');
  const statementTextEl = document.getElementById('statement-text');

  const dismantleSection = document.getElementById('dismantle');
  const dismantleCanvas = document.getElementById('dismantle-canvas');
  const dismantleCalloutsEl = document.getElementById('dismantle-callouts');
  const dismantleProgressFill = document.getElementById('dismantle-progress-fill');

  const lineupSection = document.getElementById('lineup');
  const lineupAccordion = document.getElementById('lineup-accordion');

  const customCursor = document.getElementById('custom-cursor');
  const cursorLabel = document.getElementById('cursor-label');
  const grainCanvas = document.getElementById('grain-canvas');

  // Device & Motion State
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isMobile = window.innerWidth < 768;

  heroSection.style.height = `${cfg.hero.wrapperHeightVh}vh`;
  dismantleSection.style.height = `${cfg.dismantle.wrapperHeightVh}vh`;

  // ==========================================================================
  // 1. FAST HIGH-CONCURRENCY FRAME PRELOADER
  // ==========================================================================
  const heroFrames = new Array(cfg.hero.frameCount);
  const dismantleFrames = new Array(cfg.dismantle.frameCount);

  function getFramePath(sectionName, index) {
    const isHero = sectionName === 'hero';
    if (isHero) {
      return isMobile ? cfg.hero.framePathMobile(index) : cfg.hero.framePathDesktop(index);
    } else {
      return isMobile ? cfg.dismantle.framePathMobile(index) : cfg.dismantle.framePathDesktop(index);
    }
  }

  function loadFrame(sectionName, index) {
    const cache = sectionName === 'hero' ? heroFrames : dismantleFrames;
    if (cache[index]) return Promise.resolve(cache[index]);

    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        cache[index] = img;
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = getFramePath(sectionName, index + 1);
    });
  }

  function getNearestLoadedFrame(sectionName, targetIndex) {
    const cache = sectionName === 'hero' ? heroFrames : dismantleFrames;
    const total = cache.length;
    const clamped = Math.max(0, Math.min(total - 1, targetIndex));

    if (cache[clamped]) return cache[clamped];

    for (let delta = 1; delta < total; delta++) {
      const prev = clamped - delta;
      if (prev >= 0 && cache[prev]) return cache[prev];
      const next = clamped + delta;
      if (next < total && cache[next]) return cache[next];
    }
    return null;
  }

  // Preload initial frames (1 to 40)
  async function runPreloader() {
    const initialCount = cfg.hero.preloadInitialCount;
    let completed = 0;

    // Parallel load initial batch
    const initialPromises = [];
    for (let i = 0; i < initialCount; i++) {
      const p = loadFrame('hero', i).then(() => {
        completed++;
        const pct = Math.round((completed / initialCount) * 100);
        if (preloaderBar) preloaderBar.style.width = `${pct}%`;
        if (preloaderCount) preloaderCount.textContent = `${String(pct).padStart(3, '0')}%`;
      });
      initialPromises.push(p);
    }

    await Promise.all(initialPromises);

    // Initial render of first frame
    const firstImg = getNearestLoadedFrame('hero', 0);
    renderFrame(heroCtx, heroCanvas, firstImg, 0);

    if (preloaderBar) preloaderBar.classList.add('is-bright');
    setTimeout(() => {
      if (preloader) preloader.classList.add('is-loaded');
      startHighThroughputPreload();
    }, 150);
  }

  // Preload remaining frames with high concurrency
  async function startHighThroughputPreload() {
    const CONCURRENCY = 20;
    const queue = [];

    // Prioritize Hero remaining
    for (let i = cfg.hero.preloadInitialCount; i < cfg.hero.frameCount; i++) {
      queue.push({ section: 'hero', index: i });
    }
    // Then Dismantle
    for (let i = 0; i < cfg.dismantle.frameCount; i++) {
      queue.push({ section: 'dismantle', index: i });
    }

    let cursor = 0;
    async function worker() {
      while (cursor < queue.length) {
        const item = queue[cursor++];
        await loadFrame(item.section, item.index);
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);
  }

  // ==========================================================================
  // 2. HARDWARE-ACCELERATED CANVAS RENDER ENGINE
  // ==========================================================================
  const heroCtx = heroCanvas.getContext('2d', { alpha: false, desynchronized: true });
  const dismantleCtx = dismantleCanvas.getContext('2d', { alpha: false, desynchronized: true });

  let cachedWindowWidth = window.innerWidth;
  let cachedWindowHeight = window.innerHeight;

  function resizeCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function renderFrame(ctx, canvas, img, fadeAlpha = 0) {
    if (!ctx || !canvas) return;
    const cw = canvas.width;
    const ch = canvas.height;

    if (img && img.naturalWidth && img.naturalHeight) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const canvasAspect = cw / ch;
      const imgAspect = iw / ih;

      let drawW, drawH, drawX, drawY;

      if (canvasAspect >= 1.0) {
        // Landscape: Cover fit (no fillRect needed, saves full screen redraw)
        if (canvasAspect > imgAspect) {
          drawW = cw;
          drawH = cw / imgAspect;
          drawX = 0;
          drawY = (ch - drawH) / 2;
        } else {
          drawH = ch;
          drawW = ch * imgAspect;
          drawY = 0;
          drawX = (cw - drawW) / 2;
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        // Portrait: Contain fit centered on --asphalt
        ctx.fillStyle = cfg.colors.asphalt;
        ctx.fillRect(0, 0, cw, ch);
        if (canvasAspect < imgAspect) {
          drawW = cw;
          drawH = cw / imgAspect;
          drawX = 0;
          drawY = (ch - drawH) / 2;
        } else {
          drawH = ch;
          drawW = ch * imgAspect;
          drawY = 0;
          drawX = (cw - drawW) / 2;
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }
    } else {
      ctx.fillStyle = cfg.colors.asphalt;
      ctx.fillRect(0, 0, cw, ch);
    }

    // Over last 5% of scroll, fade to solid black
    if (fadeAlpha > 0) {
      ctx.fillStyle = `rgba(7, 8, 10, ${Math.min(1, Math.max(0, fadeAlpha))})`;
      ctx.fillRect(0, 0, cw, ch);
    }
  }

  // ==========================================================================
  // 3. ZERO-REFLOW SCROLL CACHE
  // Avoid calling getBoundingClientRect() every RAF frame.
  // ==========================================================================
  let heroTop = 0;
  let heroHeight = 0;
  let statementTop = 0;
  let statementHeight = 0;
  let dismantleTop = 0;
  let dismantleHeight = 0;

  function updateLayoutCache() {
    cachedWindowWidth = window.innerWidth;
    cachedWindowHeight = window.innerHeight;

    heroTop = heroSection.offsetTop;
    heroHeight = heroSection.offsetHeight;

    statementTop = statementSection.offsetTop;
    statementHeight = statementSection.offsetHeight;

    dismantleTop = dismantleSection.offsetTop;
    dismantleHeight = dismantleSection.offsetHeight;

    resizeCanvas(heroCanvas);
    resizeCanvas(dismantleCanvas);
  }

  let currentScrollY = window.scrollY;
  let lastScrollY = window.scrollY;
  let isHeaderHidden = false;

  window.addEventListener('scroll', () => {
    currentScrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('resize', () => {
    isMobile = window.innerWidth < 768;
    updateLayoutCache();
    heroLastDrawnFrame = -1;
    dismantleLastDrawnFrame = -1;
  }, { passive: true });

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  // ==========================================================================
  // 4. SCROLL-SCRUBBING ENGINE
  // ==========================================================================
  let heroCurrentFrame = 0;
  let heroLastDrawnFrame = -1;
  let heroLastDrawnFade = -1;
  let lastSpeedVal = -1;
  let lastDistVal = '';
  let lastActiveChapter = -1;

  let dismantleCurrentFrame = 0;
  let dismantleLastDrawnFrame = -1;

  function updateHero() {
    const heroScrollDist = heroHeight - cachedWindowHeight;
    const progress = heroScrollDist > 0 ? clamp((currentScrollY - heroTop) / heroScrollDist, 0, 1) : 0;

    // Target frame calculation
    const targetFrame = Math.round(progress * (cfg.hero.frameCount - 1));
    heroCurrentFrame += (targetFrame - heroCurrentFrame) * 0.15;
    const roundedFrame = Math.round(heroCurrentFrame);

    let fadeAlpha = 0;
    if (progress >= cfg.hero.fadeToBlackStart) {
      fadeAlpha = (progress - cfg.hero.fadeToBlackStart) / (1 - cfg.hero.fadeToBlackStart);
    }

    if (roundedFrame !== heroLastDrawnFrame || Math.abs(fadeAlpha - heroLastDrawnFade) > 0.015) {
      const img = getNearestLoadedFrame('hero', roundedFrame);
      renderFrame(heroCtx, heroCanvas, img, fadeAlpha);
      heroLastDrawnFrame = roundedFrame;
      heroLastDrawnFade = fadeAlpha;
    }

    // Update progress bar
    if (heroProgressFill) {
      heroProgressFill.style.width = `${(progress * 100).toFixed(2)}%`;
    }

    // Throttled HUD update
    const speed = Math.round(progress * cfg.hero.hud.speedMax);
    if (speed !== lastSpeedVal && hudSpeed) {
      hudSpeed.textContent = `${String(speed).padStart(3, '0')} KM/H`;
      lastSpeedVal = speed;
    }

    const dist = (progress * cfg.hero.hud.distanceMax).toFixed(1);
    if (dist !== lastDistVal && hudDist) {
      hudDist.textContent = `${dist} KM`;
      lastDistVal = dist;
    }

    // Chapters reveal
    let activeIdx = -1;
    for (let i = 0; i < cfg.hero.chapters.length; i++) {
      const ch = cfg.hero.chapters[i];
      if (progress >= ch.start && progress <= ch.end) {
        activeIdx = i;
        break;
      }
    }

    if (activeIdx !== lastActiveChapter) {
      heroChapters.forEach((el, idx) => {
        if (!el) return;
        if (idx === activeIdx) {
          el.classList.add('is-active');
          if (hudChapter) hudChapter.textContent = cfg.hero.chapters[idx].hudIndex;
        } else {
          el.classList.remove('is-active');
        }
      });
      lastActiveChapter = activeIdx;
    }
  }

  function updateDismantle() {
    const dismantleScrollDist = dismantleHeight - cachedWindowHeight;
    const progress = dismantleScrollDist > 0 ? clamp((currentScrollY - dismantleTop) / dismantleScrollDist, 0, 1) : 0;

    const targetFrame = Math.round(progress * (cfg.dismantle.frameCount - 1));
    dismantleCurrentFrame += (targetFrame - dismantleCurrentFrame) * 0.15;
    const roundedFrame = Math.round(dismantleCurrentFrame);

    if (roundedFrame !== dismantleLastDrawnFrame) {
      const img = getNearestLoadedFrame('dismantle', roundedFrame);
      renderFrame(dismantleCtx, dismantleCanvas, img, 0);
      dismantleLastDrawnFrame = roundedFrame;
    }

    if (dismantleProgressFill) {
      dismantleProgressFill.style.width = `${(progress * 100).toFixed(2)}%`;
    }

    // Callouts visibility
    const calloutEls = dismantleCalloutsEl.children;
    for (let i = 0; i < cfg.dismantle.callouts.length; i++) {
      const callout = cfg.dismantle.callouts[i];
      const el = calloutEls[i];
      if (!el) continue;
      if (progress >= callout.start) {
        el.classList.add('is-visible');
      } else {
        el.classList.remove('is-visible');
      }
    }
  }

  // ==========================================================================
  // 5. SECTION 2: STATEMENT ILLUMINATION
  // ==========================================================================
  let statementWordEls = [];
  let lastStatementActiveWord = -1;

  function setupStatement() {
    if (!statementTextEl) return;
    const words = cfg.statement.text.split(' ');
    statementTextEl.innerHTML = words
      .map((w) => `<span class="statement-word">${w}</span>`)
      .join(' ');
    statementWordEls = statementTextEl.querySelectorAll('.statement-word');
  }

  function updateStatement() {
    const totalDist = cachedWindowHeight + statementHeight;
    const currentDist = cachedWindowHeight - (statementTop - currentScrollY);
    const progress = clamp(currentDist / totalDist, 0, 1);

    const activeProgress = clamp((progress - 0.25) / 0.5, 0, 1);
    const activeIndex = Math.floor(activeProgress * statementWordEls.length);

    if (activeIndex !== lastStatementActiveWord) {
      statementWordEls.forEach((el, idx) => {
        if (idx <= activeIndex && activeProgress > 0) {
          el.classList.add('is-illuminated');
        } else {
          el.classList.remove('is-illuminated');
        }
      });
      lastStatementActiveWord = activeIndex;
    }
  }

  // ==========================================================================
  // 6. SECTION 3: DISMANTLE CALLOUTS
  // ==========================================================================
  function setupDismantleCallouts() {
    if (!dismantleCalloutsEl) return;
    dismantleCalloutsEl.innerHTML = cfg.dismantle.callouts
      .map((c) => {
        let lineStyle = '';
        let cardStyle = '';
        if (c.dir === 'top-left') {
          lineStyle = 'width: 60px; right: 0; bottom: 0; transform: rotate(-30deg); transform-origin: right bottom;';
          cardStyle = 'right: 70px; bottom: 30px;';
        } else if (c.dir === 'bottom-left') {
          lineStyle = 'width: 60px; right: 0; top: 0; transform: rotate(30deg); transform-origin: right top;';
          cardStyle = 'right: 70px; top: 30px;';
        } else if (c.dir === 'bottom-right') {
          lineStyle = 'width: 60px; left: 0; top: 0; transform: rotate(-30deg); transform-origin: left top;';
          cardStyle = 'left: 70px; top: 30px;';
        } else {
          lineStyle = 'width: 60px; left: 0; bottom: 0; transform: rotate(30deg); transform-origin: left bottom;';
          cardStyle = 'left: 70px; bottom: 30px;';
        }

        return `
          <div class="callout-item" style="left: ${c.xPercent}%; top: ${c.yPercent}%;">
            <div class="callout-dot"></div>
            <div class="callout-line" style="${lineStyle}"></div>
            <div class="callout-card" style="${cardStyle}">
              <span class="callout-code hud-mono">${c.code}</span>
              <div class="callout-title">${c.title}</div>
              <div class="callout-desc">${c.desc}</div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // ==========================================================================
  // 7. SECTION 4: LINEUP ACCORDION
  // ==========================================================================
  let currentOpenSlide = cfg.lineup.defaultOpenIndex;
  let hoverTimeout = null;

  function renderLineupSlides() {
    if (!lineupAccordion) return;
    lineupAccordion.innerHTML = cfg.lineup.cars
      .map((car, idx) => {
        const isOpen = idx === currentOpenSlide;
        return `
          <div class="lineup-slide ${isOpen ? 'is-open' : ''}" 
               role="tab" 
               id="slide-${car.id}"
               tabindex="0"
               aria-selected="${isOpen}"
               aria-expanded="${isOpen}"
               data-index="${idx}"
               data-cursor="${isOpen ? 'CONFIGURE' : 'OPEN'}">

            <div class="slide-closed-view">
              <span class="slide-closed-num hud-mono">${car.number}</span>
              <span class="slide-closed-name hud-mono">${car.name}</span>
              <img class="slide-closed-thumb" src="${car.image}" alt="" aria-hidden="true" loading="lazy">
            </div>

            <div class="slide-open-view">
              <div class="slide-header">
                <div class="slide-model-name display-font">${car.name}</div>
                <div class="slide-model-number hud-mono">${car.number} / 05</div>
              </div>

              <div class="slide-floor-line"></div>
              <div class="slide-car-container">
                <img class="slide-car-img" src="${car.image}" alt="${car.alt}" loading="lazy">
              </div>

              <div class="slide-details">
                <p class="slide-tagline">${car.tagline}</p>
                <div class="slide-specs-row">
                  ${car.specs
                    .map(
                      (sp) => `
                    <div class="spec-col">
                      <span class="spec-label hud-mono">${sp.label}</span>
                      <span class="spec-val hud-mono">${sp.value}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>

                <div class="slide-footer-row">
                  <div class="slide-swatches" aria-label="Available Finishes">
                    ${car.swatches
                      .map(
                        (sw, sIdx) => `
                      <button type="button" 
                              class="swatch-btn ${sIdx === 0 ? 'is-active' : ''}" 
                              style="background-color: ${sw.color}" 
                              title="${sw.name}" 
                              aria-label="${sw.name}">
                      </button>
                    `
                      )
                      .join('')}
                  </div>
                  <a href="#reserve" class="slide-configure-link hud-mono" data-cursor="RESERVE">Configure →</a>
                </div>
              </div>
            </div>

          </div>
        `;
      })
      .join('');

    bindLineupEvents();
  }

  function setActiveSlide(index) {
    if (index === currentOpenSlide) return;
    currentOpenSlide = index;
    const slides = lineupAccordion.querySelectorAll('.lineup-slide');
    slides.forEach((slide, idx) => {
      const isOpen = idx === currentOpenSlide;
      slide.classList.toggle('is-open', isOpen);
      slide.setAttribute('aria-selected', isOpen);
      slide.setAttribute('aria-expanded', isOpen);
      slide.setAttribute('data-cursor', isOpen ? 'CONFIGURE' : 'OPEN');
      if (isOpen && customCursor) {
        cursorLabel.textContent = 'CONFIGURE';
      }
    });
  }

  function bindLineupEvents() {
    const slides = lineupAccordion.querySelectorAll('.lineup-slide');

    slides.forEach((slide, idx) => {
      slide.addEventListener('mouseenter', () => {
        if (isMobile) return;
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          setActiveSlide(idx);
        }, cfg.lineup.hoverDebounceMs);
      });

      slide.addEventListener('click', (e) => {
        if (e.target.closest('.swatch-btn')) {
          const swatches = slide.querySelectorAll('.swatch-btn');
          swatches.forEach((sw) => sw.classList.remove('is-active'));
          e.target.classList.add('is-active');
          return;
        }
        setActiveSlide(idx);
      });

      slide.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (idx + 1) % slides.length;
          setActiveSlide(next);
          slides[next].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = (idx - 1 + slides.length) % slides.length;
          setActiveSlide(prev);
          slides[prev].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveSlide(idx);
        }
      });
    });

    const lineupObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            slides.forEach((sl, sIdx) => {
              setTimeout(() => {
                sl.classList.add('is-revealed');
              }, sIdx * 80);
            });
            lineupObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    lineupObserver.observe(lineupSection);
  }

  // ==========================================================================
  // 8. FILM GRAIN PATTERN (GPU OPTIMIZED)
  // ==========================================================================
  function setupFilmGrain() {
    if (!grainCanvas) return;
    const grainCtx = grainCanvas.getContext('2d');
    const tileSize = cfg.noise.size;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = tileSize;
    offCanvas.height = tileSize;
    const offCtx = offCanvas.getContext('2d');
    const imgData = offCtx.createImageData(tileSize, tileSize);
    const buf32 = new Uint32Array(imgData.data.buffer);

    for (let i = 0; i < buf32.length; i++) {
      const val = (Math.random() * 255) | 0;
      buf32[i] = (45 << 24) | (val << 16) | (val << 8) | val;
    }
    offCtx.putImageData(imgData, 0, 0);

    const grainPattern = grainCtx.createPattern(offCanvas, 'repeat');

    function resizeGrain() {
      grainCanvas.width = window.innerWidth;
      grainCanvas.height = window.innerHeight;
    }
    resizeGrain();
    window.addEventListener('resize', resizeGrain, { passive: true });

    setInterval(() => {
      grainCtx.clearRect(0, 0, grainCanvas.width, grainCanvas.height);
      grainCtx.fillStyle = grainPattern;
      grainCtx.fillRect(0, 0, grainCanvas.width, grainCanvas.height);
    }, 1000 / cfg.noise.fps);
  }

  // ==========================================================================
  // 9. HARDWARE-ACCELERATED CURSOR
  // ==========================================================================
  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;

  function setupCustomCursor() {
    if (isReducedMotion || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    document.body.classList.add('has-custom-cursor');

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      if (customCursor) {
        customCursor.classList.add('is-pressed');
        setTimeout(() => customCursor.classList.remove('is-pressed'), 120);
      }
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [data-cursor]');
      if (target) {
        customCursor.classList.add('is-hover');
        const customText = target.getAttribute('data-cursor') || (target.tagName === 'A' ? 'VIEW' : 'MENU');
        if (cursorLabel) cursorLabel.textContent = customText;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [data-cursor]');
      if (target) {
        customCursor.classList.remove('is-hover');
        if (cursorLabel) cursorLabel.textContent = '';
      }
    });
  }

  // ==========================================================================
  // 10. MAIN RAF ANIMATION LOOP
  // ==========================================================================
  function tick() {
    // 1. Hero Scrollytelling
    updateHero();

    // 2. Statement Word Reveal
    updateStatement();

    // 3. Dismantle Scrollytelling
    updateDismantle();

    // 4. Header Visibility
    if (currentScrollY > 100 && currentScrollY > lastScrollY && !isHeaderHidden) {
      siteHeader.classList.add('is-hidden');
      isHeaderHidden = true;
    } else if (currentScrollY < lastScrollY && isHeaderHidden) {
      siteHeader.classList.remove('is-hidden');
      isHeaderHidden = false;
    }
    lastScrollY = currentScrollY;

    // 5. Cursor Lerp
    if (document.body.classList.contains('has-custom-cursor')) {
      cursorX += (mouseX - cursorX) * cfg.cursor.lerp;
      cursorY += (mouseY - cursorY) * cfg.cursor.lerp;
      customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    }

    requestAnimationFrame(tick);
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  function init() {
    updateLayoutCache();
    setupStatement();
    setupDismantleCallouts();
    renderLineupSlides();
    setupFilmGrain();
    setupCustomCursor();

    runPreloader();

    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ============================================================
   DIGISYN CO. — REAL WEBSITE AUDIT ENGINE
   Uses Google PageSpeed Insights API (Lighthouse v5)
   ============================================================ */

(function () {
  'use strict';

  // ---- CONFIG ----
  // PageSpeed API key - set via window.PAGESPEED_KEY or use keyless (rate-limited)
  const API_BASE = 'https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed';
  const PAGESPEED_KEY = window.PAGESPEED_KEY || 'AIzaSyAp1T6yRYwyMMnD5e0ufosuVDMgEKI7uJ4';

  // ---- UTILITIES ----
  function scoreColor(score) {
    if (score >= 90) return '#00C853';
    if (score >= 50) return '#FFA726';
    return '#EF5350';
  }

  function scoreLabel(score) {
    if (score >= 90) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  }

  function formatMs(ms) {
    if (!ms && ms !== 0) return 'N/A';
    if (ms >= 1000) return (ms / 1000).toFixed(1) + 's';
    return Math.round(ms) + 'ms';
  }

  function normalizeUrl(raw) {
    raw = raw.trim();
    if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
    return raw;
  }

  // ---- DRAW RING ----
  function buildRing(score, label, title) {
    const r = 38, cx = 50, cy = 50;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = scoreColor(score);
    return `
      <div class="audit-score-ring">
        <svg viewBox="0 0 100 100" width="120" height="120">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E8EDF2" stroke-width="8"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="8"
            stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ / 4}"
            stroke-linecap="round" transform="rotate(-90 50 50)"/>
          <text x="50" y="46" text-anchor="middle" font-size="18" font-weight="700" fill="${color}">${score}</text>
          <text x="50" y="60" text-anchor="middle" font-size="8" fill="#8A96A6">${scoreLabel(score)}</text>
        </svg>
        <div class="audit-score-label">${title}</div>
      </div>`;
  }

  // ---- PARSE API RESPONSE ----
  function parseResult(data) {
    const cats = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};

    // Core scores (0-100)
    const perf = Math.round((cats.performance?.score || 0) * 100);
    const seo = Math.round((cats.seo?.score || 0) * 100);
    const acc = Math.round((cats.accessibility?.score || 0) * 100);
    const bp = Math.round((cats['best-practices']?.score || 0) * 100);

    // Core Web Vitals
    const lcp = audits['largest-contentful-paint']?.displayValue || 'N/A';
    const fid = audits['total-blocking-time']?.displayValue || 'N/A';
    const cls = audits['cumulative-layout-shift']?.displayValue || 'N/A';
    const fcp = audits['first-contentful-paint']?.displayValue || 'N/A';
    const si  = audits['speed-index']?.displayValue || 'N/A';
    const tti = audits['interactive']?.displayValue || 'N/A';

    // Top opportunities (issues to fix)
    const opportunityAudits = [
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'uses-optimized-images',
      'uses-webp-images',
      'uses-text-compression',
      'uses-responsive-images',
      'efficient-animated-content',
      'offscreen-images',
      'redirects',
    ];

    const opportunities = opportunityAudits
      .map(id => audits[id])
      .filter(a => a && a.score !== null && a.score < 1 && a.details)
      .slice(0, 5)
      .map(a => ({
        title: a.title,
        description: a.description?.split('.')[0] + '.' || '',
        savings: a.displayValue || '',
      }));

    // SEO findings
    const seoChecks = [
      { id: 'document-title', good: 'Page has a title tag', bad: 'Missing title tag' },
      { id: 'meta-description', good: 'Meta description present', bad: 'Missing meta description' },
      { id: 'link-text', good: 'Descriptive link text used', bad: 'Links have poor text' },
      { id: 'crawlable-anchors', good: 'Links are crawlable', bad: 'Some links are not crawlable' },
      { id: 'is-crawlable', good: 'Page is indexable', bad: 'Page blocked from indexing' },
      { id: 'hreflang', good: 'Hreflang valid', bad: 'Hreflang issues detected' },
      { id: 'canonical', good: 'Canonical tag present', bad: 'Missing canonical tag' },
      { id: 'robots-txt', good: 'robots.txt is valid', bad: 'robots.txt has issues' },
    ];

    const seoItems = seoChecks.map(c => {
      const a = audits[c.id];
      const pass = !a || a.score === 1 || a.score === null;
      return { text: pass ? c.good : c.bad, pass };
    }).filter((v, i, arr) => arr.findIndex(x => x.text === v.text) === i);

    return { perf, seo, acc, bp, lcp, fid, cls, fcp, si, tti, opportunities, seoItems };
  }

  // ---- RENDER RESULTS ----
  function renderResults(url, mobile, desktop, container) {
    const m = parseResult(mobile);
    const d = parseResult(desktop);

    const opp = m.opportunities.length
      ? m.opportunities.map(o => `
          <div class="audit-opportunity">
            <div class="audit-opp-title">⚠ ${o.title}</div>
            <div class="audit-opp-desc">${o.description}</div>
            ${o.savings ? `<div class="audit-opp-savings">${o.savings}</div>` : ''}
          </div>`).join('')
      : '<p style="color:var(--green);font-weight:600;">✓ No major performance issues found!</p>';

    const seoList = m.seoItems.map(s =>
      `<div class="audit-seo-item ${s.pass ? 'pass' : 'fail'}">${s.pass ? '✓' : '✗'} ${s.text}</div>`
    ).join('');

    container.innerHTML = `
      <div class="audit-results reveal visible">
        <div class="audit-url-badge">
          <span class="audit-url-icon">🌐</span>
          <span class="audit-url-text">${url}</span>
        </div>

        <div class="audit-tabs">
          <button class="audit-tab active" data-tab="mobile">📱 Mobile</button>
          <button class="audit-tab" data-tab="desktop">🖥 Desktop</button>
        </div>

        <div class="audit-tab-content" data-content="mobile">
          <div class="audit-scores">
            ${buildRing(m.perf, '', 'Performance')}
            ${buildRing(m.seo, '', 'SEO')}
            ${buildRing(m.acc, '', 'Accessibility')}
            ${buildRing(m.bp, '', 'Best Practices')}
          </div>
        </div>
        <div class="audit-tab-content hidden" data-content="desktop">
          <div class="audit-scores">
            ${buildRing(d.perf, '', 'Performance')}
            ${buildRing(d.seo, '', 'SEO')}
            ${buildRing(d.acc, '', 'Accessibility')}
            ${buildRing(d.bp, '', 'Best Practices')}
          </div>
        </div>

        <div class="audit-vitals">
          <h4>📊 Core Web Vitals (Mobile)</h4>
          <div class="audit-vitals-grid">
            <div class="audit-vital"><span class="vital-label">LCP</span><span class="vital-val">${m.lcp}</span><span class="vital-hint">Largest Contentful Paint</span></div>
            <div class="audit-vital"><span class="vital-label">FCP</span><span class="vital-val">${m.fcp}</span><span class="vital-hint">First Contentful Paint</span></div>
            <div class="audit-vital"><span class="vital-label">TBT</span><span class="vital-val">${m.fid}</span><span class="vital-hint">Total Blocking Time</span></div>
            <div class="audit-vital"><span class="vital-label">CLS</span><span class="vital-val">${m.cls}</span><span class="vital-hint">Layout Shift Score</span></div>
            <div class="audit-vital"><span class="vital-label">SI</span><span class="vital-val">${m.si}</span><span class="vital-hint">Speed Index</span></div>
            <div class="audit-vital"><span class="vital-label">TTI</span><span class="vital-val">${m.tti}</span><span class="vital-hint">Time to Interactive</span></div>
          </div>
        </div>

        <div class="audit-section">
          <h4>🚀 Top Opportunities to Improve</h4>
          <div class="audit-opportunities">${opp}</div>
        </div>

        <div class="audit-section">
          <h4>🔍 SEO Checklist</h4>
          <div class="audit-seo-list">${seoList}</div>
        </div>

        <div class="audit-cta-box">
          <strong>Want us to fix all of this for you?</strong><br>
          Our team can resolve every issue above — and manage your site going forward.
          <a href="https://digisyn.co/contact" class="btn btn-primary" style="margin-top:14px;display:inline-block;">Get a Free Consultation &rarr;</a>
        </div>
      </div>`;

    // Tab switching
    container.querySelectorAll('.audit-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.audit-tab').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.audit-tab-content').forEach(c => c.classList.add('hidden'));
        btn.classList.add('active');
        container.querySelector(`[data-content="${btn.dataset.tab}"]`).classList.remove('hidden');
      });
    });
  }

  // ---- RUN AUDIT ----
  async function runAudit(rawUrl, container) {
    const url = normalizeUrl(rawUrl);
    
    

    container.innerHTML = `
      <div class="audit-loading">
        <div class="audit-spinner"></div>
        <p class="audit-loading-msg">Auditing <strong>${url}</strong>…</p>
        <p class="audit-loading-sub">Running Lighthouse on mobile &amp; desktop. This takes 15–30 seconds.</p>
      </div>`;

    try {
      // Run mobile and desktop in parallel
      const [mobileRes, desktopRes] = await Promise.all([
        fetch(`${API_BASE}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices&key=${PAGESPEED_KEY}`),
        fetch(`${API_BASE}?url=${encodeURIComponent(url)}&strategy=desktop&category=performance&category=seo&category=accessibility&category=best-practices&key=${PAGESPEED_KEY}`)
      ]);

      if (!mobileRes.ok || !desktopRes.ok) {
        const errData = await mobileRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${mobileRes.status}`);
      }

      const [mobileData, desktopData] = await Promise.all([mobileRes.json(), desktopRes.json()]);
      renderResults(url, mobileData, desktopData, container);

    } catch (err) {
      container.innerHTML = `
        <div class="audit-error">
          <div class="audit-error-icon">⚠️</div>
          <h4>Could not audit this website</h4>
          <p>${err.message || 'The URL may be unreachable, or the API rate limit was exceeded. Try again in a minute.'}</p>
          <button class="btn btn-outline" onclick="this.closest('.audit-results-wrap').querySelector('.audit-error').remove()">Try Again</button>
        </div>`;
    }
  }

  // ---- SEND LEAD TO FORMSPREE (fires & forgets — doesn't block audit) ----
  // Formspree forwards submissions to johnmichaellamigo@gmail.com
  // To activate: replace FORMSPREE_ID below with your actual ID from formspree.io/new
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqeweyqv';

  function sendLead(email, url) {
    fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        email: email,
        website: url,
        _subject: '\uD83D\uDD0D New Free Audit Request — ' + url,
        _replyto: email,
        _to: 'johnmichaellamigo@gmail.com',
        message: 'A new visitor just ran a free website audit on digisyn.co.\n\n---\nEmail:   ' + email + '\nWebsite: ' + url + '\nTime:    ' + new Date().toLocaleString() + '\nSource:  digisyn.co/#free-audit\n---\n\nReply directly to this email to follow up with the lead.'
      })
    }).catch(() => {}); // Silent fail — never block the audit UI
  }

  // ---- INIT FORMS ----
  function initAuditForms() {
    document.querySelectorAll('.audit-form, [data-audit-form]').forEach(form => {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const urlInput = this.querySelector('[name="website"], [name="url"]');
        const emailInput = this.querySelector('[name="email"]');
        const resultsWrap = document.getElementById('audit-results-wrap') ||
          this.closest('section')?.querySelector('.audit-results-wrap') ||
          this.nextElementSibling;

        if (!urlInput || !urlInput.value.trim()) {
          urlInput?.focus();
          return;
        }

        // Fire lead to Formspree (non-blocking — runs in background)
        if (emailInput && emailInput.value.trim()) {
          sendLead(emailInput.value.trim(), urlInput.value.trim());
        }

        if (resultsWrap) {
          resultsWrap.style.display = 'block';
          resultsWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
          runAudit(urlInput.value.trim(), resultsWrap);
        }
      });
    });
  }

  // Boot when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuditForms);
  } else {
    initAuditForms();
  }

  // Expose for manual calls
  window.DigisynAudit = { run: runAudit };
})();

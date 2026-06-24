# Digisyn Co. — Site update changelog

**Date:** 2026-05-28
**Source:** 30-day SEO & Conversion Action Plan (see `digisyn-30-day-action-plan.docx`)

This update applies Weeks 1–2 and most of Week 4 of the 30-day plan as code. Week 3 (real local content for Sydney/Boston/Calgary pages) is left to you because it needs original client material — case studies, photos, and named testimonials — that I shouldn't fabricate.

---

## What changed

### 1. Location pruning (38 cities deleted, 9 noindex'd, 6 kept)

**Deleted (38 cities — 410 Gone via `.htaccess`):**
Austin, Baltimore, Chicago, Columbus, Dallas, Darwin, Denver, Edmonton, El Paso, Fort Worth, Gold Coast, Halifax, Hamilton, Hobart, Houston, Indianapolis, Jacksonville, Las Vegas, Los Angeles, Louisville, Memphis, Milwaukee, Montreal, Nashville, New York, Newcastle, Oklahoma City, Philadelphia, Phoenix, Portland, Quebec City, San Antonio, San Diego, San Francisco, San Jose, Seattle, Washington DC, Winnipeg.

**Noindex'd (9 cities — live for users, hidden from Google):**
Perth, Canberra, Charlotte, Ottawa, Melbourne, Brisbane, Adelaide, Toronto, Vancouver. These had measurable GSC impressions or potential demand, so they stay live but won't compete for crawl budget.

**Kept and indexed (6 pages):**
Sydney, Boston, Calgary (the three studio cities per your schema), plus the country hubs `/locations/australia/`, `/locations/united-states/`, `/locations/canada/`.

> **Week 3 to-do (not in this zip):** Rewrite the 3 city pages and 3 country hubs with real local content — named case study, embedded GBP, original photo, locally-relevant copy. Until then, they're still templates.

### 2. `.htaccess` — new rules

- **410 Gone** for the 38 deleted city URLs (ordered before trailing-slash redirect to avoid a 301→410 chain).
- **Trailing-slash canonicalisation** — `/about` 301s to `/about/` etc. Fixes the duplicate-URL split observed in GSC.
- **Subdomain consolidation templates** (commented out) for moving `digicv.digisyn.co` and `johnlamigo.digisyn.co` to subdirectories. Uncomment when ready.
- All previous redirects (HTTPS, www, legacy WordPress paths, old service slugs) preserved.

### 3. `sitemap.xml` — rebuilt

- 67 URLs (down from 120+).
- All 38 deleted URLs removed.
- All 9 noindex'd URLs removed (per Google guidelines — don't sitemap what you noindex).
- All URLs now use canonical trailing-slash form.

### 4. Homepage (`index.html`) — hero rewritten

- New `<title>`: "Website Content Management & Care Plans for Founder-Led Businesses".
- New H1: "We look after your website so you can run the business."
- New eyebrow: leads with the offer (Content care plans) + geography (AU/US/CA).
- New primary CTA: "Get a free written audit" (replaces "Start your project").
- Added the 48-hour-no-call promise directly under the CTA — the differentiator your competitors can't easily copy.
- Canonical URL set to `https://digisyn.co/`.

### 5. Service pages — 4 rewrites

| Page | New H1 | Target queries |
|---|---|---|
| `/services/website-content-management/` | "Outsourced website content management for small businesses." | "outsource content marketing", "remote content management", "content marketing management" |
| `/services/google-rankings-seo/` | "SEO for small businesses that want to stop disappearing on Google." | "small business SEO", "local SEO retainer", "SEO services" |
| `/services/google-business-profile/` | "Google Business Profile management that shows results in 2–3 weeks." | "GBP management", "google business profile optimisation" |
| `/services/web-design-and-development/` | "Web design for small business, built in-house. No templates." | "web design small business", "founder-led web design" |

Each page now has:
- Target query in `<title>`, meta description, H1, and first 100 words.
- Trailing slash on canonical URL.
- "From $X" price anchor in the hero.
- "Get a free written audit" CTA.

### 6. `/services/website-content-management/` — additional depth

Per the plan, this is your highest-impression service page. Added:

- **Comparison table** — In-house hire vs Freelancer vs Content Care Plan.
- **FAQ section** with 5 questions matching long-tail buyer queries:
  - Should I outsource my website content management?
  - What's the difference between content management and content marketing?
  - How does remote content management actually work?
  - How much does outsourced content management cost?
  - Am I locked in?
- **FAQPage schema** (JSON-LD) for rich-result eligibility.

### 7. Contact page (`/contact/index.html`)

- H1 rewritten to lead with the audit promise: "A real written audit, in your inbox within 48 hours."
- URL field on the form is now **optional** (previously required — was killing mobile completion).

### 8. Topbar message (site-wide except `/templates/`)

- Was: "Now booking Q1 retainers · Free audit, no obligation" — stale by Q2.
- Now: "Free written audit · Reply within 48 hours · No call required" — always-true positioning.

### 9. Popup timing (`/js/popup.js`)

- Was: 15 seconds OR 45% scroll (OR semantics — aggressive on brand-search arrivals).
- Now: 30 seconds AND 60% scroll (AND semantics — only engaged readers see it).

---

## What was NOT changed (and why)

- **Templates folder (`/templates/`)** — left alone. These are demo sites (Apex Pro, Catalyst, Luma Health, Meridian Law, Onyx Kitchen, Storefront) used as portfolio examples. Don't apply main-site changes to them.
- **Blog posts** — no rewrites. The plan calls for internal linking improvements in Week 4 but you have 40+ posts and changing them all without losing the editorial voice is risky for an automated pass. Recommend manual: add 2 contextual links to relevant service pages in each post, with anchor text that matches the target page's query.
- **`/services/social-media-management/` and `/services/speed-and-mobile-optimization/`** — not in the top-4 priority for rewrites per the plan. They're fine as-is for now.
- **Location pages for Sydney, Boston, Calgary** — these need real local content (case studies, photos, embedded GBPs) that I can't generate without your input. They still exist and are indexed, but they're template-form. Rewrite them in Week 3.
- **Pricing on service pages** — I used "$499/month" and "$1,200" and "$299/month" from your existing copy where present. Verify these still match your actual pricing before going live.

---

## Deployment checklist

1. **Back up your current site** before overwriting anything.
2. **Verify pricing** in the 4 rewritten service pages — search for `$499`, `$1,200`, `$299` and confirm.
3. **Upload everything.** The `.htaccess` is critical — ensure it deploys to web root.
4. **Test redirects:**
   ```
   curl -I https://digisyn.co/locations/austin/      # expect 410
   curl -I https://digisyn.co/about                   # expect 301 -> /about/
   curl -I https://digisyn.co/services/website-content-management   # expect 301 -> .../
   ```
5. **Submit the new sitemap** in Google Search Console.
6. **Use GSC Removals tool** on the 38 deleted URLs to accelerate de-indexing (helpful but not required — the 410s will do the work over a few weeks).
7. **Subdomain consolidation:** Decide whether to move `digicv.digisyn.co` and `johnlamigo.digisyn.co` to subdirectories. If yes, build the `/cv/` and `/john/` landing pages, then uncomment the redirects in `.htaccess` for those subdomains.

---

## What to monitor (week-by-week)

| Week | Look for |
|---|---|
| 1–2 | Deleted URLs moving to "Not found (410)" in GSC. Crawl rate may briefly dip — normal. |
| 3–4 | Non-brand impressions starting to consolidate on the 4 rewritten service pages. Position changes on "outsource content marketing", "small business SEO", etc. |
| 5–8 | First non-brand clicks from rewritten service pages. Audit requests should start arriving with non-empty URLs (because the form is now friendlier). |
| 9–12 | Real ranking movement. By week 12 you should see at least 3–5 commercial queries on page 1 that weren't before. |

If nothing has moved in GSC after 4 weeks, check (a) that the sitemap was actually re-submitted and is being read, (b) that the 410s are firing, and (c) that the noindex tags are present on the 9 cities.

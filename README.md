# DigiSyn Co.

Source for [digisyn.co](https://digisyn.co) — **website content management, done for you.**

DigiSyn Co. keeps founder-led businesses' websites current, ranking, and converting: monthly content updates, SEO, Google Business Profile management, social media management, and speed/mobile optimization. Founded by [John Lamigo](https://johnlamigo.digisyn.co).

## Services

- Website content management
- Google rankings / SEO
- Google Business Profile management
- Social media management
- Speed and mobile optimization
- Web design and development

## Stack

Static HTML/CSS/JS site with per-location landing pages (54+) and a blog for SEO/GEO content. No build step or framework — fast to edit, fast to ship.

## Deployment

Pushing to `main` triggers a GitHub Actions workflow (`.github/workflows/deploy.yml`) that FTP-deploys the site to cPanel hosting and purges the Cloudflare cache, so changes go live automatically.

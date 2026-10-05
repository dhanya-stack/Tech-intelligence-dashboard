# Semi & AI Radar

A readable semiconductor + AI intelligence dashboard designed for GitHub Pages.

## What it does
- Daily "Latest" feed with topic filters and search
- "Why it matters" context on each story
- Company view
- Research & technical view
- Source directory
- Dark mode
- Scheduled daily refresh using GitHub Actions
- No paid API or secret key required

## Publish
1. Create a new GitHub repository.
2. Upload **the contents of this folder** to the repository root.
3. In **Settings → Pages**, choose **Deploy from a branch**, `main`, `/ (root)`.
4. In **Settings → Actions → General → Workflow permissions**, make sure workflows have **Read and write permissions** so the daily updater can commit `data/news.json`.
5. Open **Actions → Refresh semiconductor & AI news → Run workflow** once to test it.

The workflow is scheduled for **01:30 UTC daily (07:00 IST)**. GitHub scheduled jobs can start a little later when the service is busy.

## Important limitation
The updater uses public Google News RSS search feeds and does not bypass paywalls. "Why it matters" for automatically discovered stories is generated from transparent topic rules, not an AI model. Curated seed stories can have richer hand-written context.

Google News links may redirect to the original publisher. The dashboard stores only metadata/context and links readers to the publisher rather than copying article text.

## Customize
- `data/news.json` — curated sources, companies, seed stories
- `scripts/update_news.py` — search queries, tagging and "why it matters" rules
- `styles.css` — visual design
- `app.js` — filtering/interactions

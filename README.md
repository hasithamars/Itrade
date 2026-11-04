# AlphaPulse AI - Live Trading Indicator & Forecast Terminal

Real-time trading indicator and signal intelligence terminal powered by multi-indicator technical analysis, live market feeds, scenario price projections, and AI-grounded market confluence.

---

## 🚀 How to Deploy on GitHub Pages (Fix Blank White Screen)

A blank white screen on GitHub Pages happens when GitHub Pages is set to deploy from `/ (root)` instead of deploying the built production files. 

You can choose any of these **3 easy methods** to deploy:

### Method 1: Automatic GitHub Actions (Recommended - 1 Click)
This repository includes a ready-to-use GitHub Actions workflow at `.github/workflows/deploy.yml`.

1. Go to your GitHub repository in your browser.
2. Click **Settings** (tab at the top right).
3. On the left sidebar, click **Pages**.
4. Under **Build and deployment > Source**, select:
   👉 **GitHub Actions**
5. Push your code or go to the **Actions** tab and click **Run workflow**.
6. GitHub will automatically build and publish your terminal!

---

### Method 2: Deploy from Branch via `/docs` Folder
This repository pre-builds the production bundle directly into the `docs/` folder:

1. In your GitHub repository, click **Settings > Pages**.
2. Under **Build and deployment > Source**, select **Deploy from a branch**.
3. Under **Branch**:
   - Select **`main`** (or `master`).
   - Select **`/docs`** (instead of `/ (root)`).
4. Click **Save**.
5. Your live app will be published in seconds with zero white screens!

---

### Method 3: Deploy via Command Line (`npm run deploy`)
This project includes the `gh-pages` package pre-configured:

```bash
# 1. Build & push directly to gh-pages branch
npm run deploy
```

In GitHub **Settings > Pages**, set the source to the `gh-pages` branch and click **Save**.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local full-stack dev server
npm run dev

# Build for production
npm run build
```

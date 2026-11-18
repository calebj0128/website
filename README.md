# Caleb Joslin — GitHub + Cloudflare Pages + Pages CMS

This is a **complete website** that preserves the original approved design and adds a working blog publishing system. It uses **no external build dependencies**; Node.js generates the pages from articles saved in Pages CMS. The Writing archive is initially empty until you publish your first article.

## 1. Upload to a NEW GitHub repository

1. Extract `caleb-website-READY-FOR-GITHUB.zip` on your computer.
2. Open the extracted folder and **select everything inside it** (do NOT drag the enclosing folder or the ZIP into GitHub).
3. In your new GitHub repository, click **Add file → Upload files** and upload those contents. GitHub should immediately show `package.json`, `.pages.yml`, `scripts/`, and `site/` at its top level.
4. Commit the upload. **Important: `.pages.yml` must be visible in GitHub at the repository root.** It is a dotfile, so do not accidentally skip it while selecting files.

## 2. Create Cloudflare Pages project

In Cloudflare, go to **Workers & Pages → Create → Pages → Import existing Git repository**, then select the new GitHub repository. Use these settings:

- Production branch: `main` (if you created a different default branch, use that one)
- Framework preset: `None`
- Root directory: repository root (leave blank or `/`)
- Build command: `npm run build`
- Build output directory: `_site`

Cloudflare will create a temporary `*.pages.dev` site. Verify that Home, About, Services, Resources, and Writing load before connecting your domain.

## 3. Connect Pages CMS for blog posts

1. Go to https://app.pagescms.org/ and **Sign in with GitHub**.
2. Install/authorize the Pages CMS GitHub App for your new website repository.
3. Open the repository and choose the same branch Cloudflare uses (usually `main`).
4. Pages CMS reads the root `.pages.yml` configuration, which supplies a **Blog Posts** collection.
5. Click **Blog Posts → New**. Enter a title, date, category, summary, and article body.
6. Set **Published on website** to ON when ready; save. Pages CMS commits a `.json` article file to `site/content/posts/`. Cloudflare rebuilds the site, adding the article automatically at `/writing/<article-filename>/` and linking it from `/writing/`.

If Pages CMS does not list the repository, verify its GitHub App installation permissions; if it asks for a configuration file, verify `.pages.yml` is at the repository root, not inside another folder.

## 4. Optional: connect your Cloudflare domain

In your Cloudflare Pages project, go to **Custom domains → Set up a custom domain** and add the Cloudflare domain you own. Do this only once the temporary site works.

## How to update later

- New blog post: edit through Pages CMS and save. No HTML editing required.
- Links/design: edit files under `site/` in GitHub and commit.
- Flyer: `site/assets/caleb-flyer.png`.
- PDFs: upload to `site/assets/uploads/` or use Pages CMS media manager; link from Resources.
- Videos: paste YouTube embed HTML into relevant page or article using Pages CMS Source mode.

### Draft privacy

Unpublished article files do not become public webpages. However, if your GitHub repository is **public**, anyone can read the drafts in repository source. Do not draft private/client information there.

### Free and independent

The basic site runs on Cloudflare Pages free hosting; you pay for the domain you own, and optional future services only. GitHub stores your content, independent of WordPress.

### Local testing (optional)

Install Node.js 20+ and run `npm run build`. The generated website appears in `_site/`. Run `npm test` to validate the publishing pipeline with temporary example articles. No `npm install` is required.

**Important:** The visual editor is Pages CMS, the site builder is the included `scripts/build.mjs` file (not Eleventy). This eliminates third-party build dependencies, simplifying future maintenance. The original homepage and existing pages are unchanged.


## SUD Group Resources (new)
Open Pages CMS > **SUD Group Resources** > New. Add title, topic, description, and a PDF uploaded through the file picker. Turn **Published on website** ON and save. The repository receives a resource JSON file plus the PDF at `site/assets/uploads/resources/`; Cloudflare builds a card under the existing **Resources** tab automatically.

Only upload material you own or have permission to redistribute; remove all identifying client information. PDFs are publicly available after publication. For large files, compress slide decks to PDF first and check repository/media upload limits.

# Maze

Static website for Maze Tech — TV mounts, solar lights, guards, extension cables, and installation services.

## Local development

Run a simple static server from the project root:

```bash
python -m http.server 8000
```

Then open:

- Home: http://127.0.0.1:8000/index.html
- Dashboard: http://127.0.0.1:8000/dashboard.html

In VS Code/Cursor, use the **Run Local Server** task.

## Deployment

This project is deployed as a **static site**. Vercel serves the root HTML, CSS, and JS files directly — no Next.js build step.

- `/` → `index.html`
- `/dashboard` → `dashboard.html`
- `/maze-technologies.html` → redirects to `index.html` (used by dashboard links)

## Optional Next.js app

The `app/` folder contains an experimental Next.js wrapper. It is not used for production deployment. Use the static files at the project root for the full site experience, including search, product filters, modals, and dashboard editing.

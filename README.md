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

This project is deployed as a **static site**. Vercel serves the root HTML, CSS, JS, and image files directly.

- `/` → `index.html`
- `/dashboard` → `dashboard.html`
- `/maze-technologies.html` → redirects to `index.html`

## Dashboard

Use the dashboard to edit page text, installation service descriptions and charges, products, blogs, inquiries, and SEO settings. Changes are saved to browser local storage.

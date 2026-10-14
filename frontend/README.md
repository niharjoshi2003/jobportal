# React + Vite

## Vercel deployment

Set the Vercel project's **Root Directory** to `frontend`, use the **Vite**
framework preset, build with `npm run build`, and publish the `dist` directory.
Set `VITE_API_BASE_URL` to the deployed backend's origin.

`vercel.json` rewrites browser routes to `index.html`, allowing React Router to
handle direct links and refreshes such as `/login`, `/profile`, and
`/recruiter/jobs/:jobId/applicants`. The browser URL and query string stay intact.
Vercel serves existing build assets before applying the fallback.

Redeploy after adding or changing this configuration. Verify the deployed site
by opening `/login` directly, refreshing it, and refreshing `/profile` while
logged in. Also verify that a nested job or recruiter page opens directly and
that JavaScript, CSS, and images still load.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# web-dev — My First HTML Webpage

This is a small static site built with plain HTML, CSS, and vanilla JavaScript. It is intended as a beginner-friendly educational page with a small editable sandbox, code sample gallery, and responsive layout.

## Quick start (local)

1. Open `index.html` in your browser (double-click or right-click → Open With).
2. Edit `style.css`, `index.html`, or `script.js` in your editor and refresh the page to see changes.

## Recommended local workflow

- Use Visual Studio Code or any editor you like.
- For a simple local HTTP server (recommended when working with iframes), run:

```bash
# If you have Python 3 installed
python -m http.server 8000
# or with Node.js installed (from project root)
# npm install -g http-server
http-server -p 8000
```

Then open `http://localhost:8000`.

## Deployment options

1. GitHub Pages (recommended for personal static sites)

- Create a new repository on GitHub, commit the project files, and push.
- In the repository settings, enable "Pages" from the `main` branch (root).
- Your site will be available at `https://<your-username>.github.io/<repo-name>/`.

2. Netlify (easy drag-and-drop or connect repo)

- Drag the project folder into Netlify's deploy UI, or connect your GitHub repository and set the publish directory to `/`.
- Netlify will assign a URL and manage continuous deploys from your repo.

3. Other static hosts

- Vercel, Surge, and Firebase Hosting are good alternatives.

## Security note about the sandbox

- The sandbox preview renders user-supplied HTML inside a sandboxed `iframe` (uses `sandbox="allow-scripts"`), which prevents access to the parent page and limits capabilities.
- Do not enable remote or untrusted users to inject arbitrary content without additional server-side filtering.

## What's next (optional enhancements)

- Convert the code viewer to use a syntax highlighter (highlight.js or Prism).
- Improve copy UX with a transient tooltip or toast message.
- Isolate script execution further by using `Content-Security-Policy` or by running a dedicated isolated preview service.

## License

MIT

## Contact form (send messages to your email)

This project includes a client-side integration with Formspree so form submissions can be delivered to your email address. Follow these steps to enable it:

1. Go to https://formspree.io/ and sign up (or log in).
2. Create a new form and follow the setup steps. Formspree will provide a form endpoint like `https://formspree.io/f/abcdxyz`.
3. Replace the placeholder `action` in `index.html`'s contact form with your endpoint, or update the `data-formspree-endpoint` attribute on the `<form>` element.

Notes:

- The client-side code in `script.js` sends JSON to the Formspree endpoint and displays in-page success/error messages via the `#contactFeedback` element.
- If you prefer not to use Formspree, you can configure a server-side endpoint to accept and forward messages to your email.

## Smoke test (automated)

This project includes a small Puppeteer smoke test that exercises the sandbox Run/Reset flow and the code viewer modal.

How to run locally:

1. Make sure you have Node.js (v16+) installed.
2. From the project root, install dev dependencies:

```bash
npm install
```

3. Run the smoke test:

```bash
npm run smoke
```

The script loads `index.html` using a `file://` URL, performs a few interactions, and exits with code 0 on success or non-zero on failure.

Notes:

- Headless Puppeteer is used; the test is intended for local verification and quick CI checks.
- If you host the site via `http://localhost:8000`, adjust the test script to point to that URL instead of the `file://` URL.


# Documentation

`Job-O-Hire-Architecture.pdf` is the architecture & operations guide for the
Job-O-Hire system.

## Regenerating the PDF

```bash
cd docs
npm install      # only the first time
npm run build    # runs `node generate-pdf.js`
```

The script uses [pdfkit](https://pdfkit.org/) and writes
`docs/Job-O-Hire-Architecture.pdf` in place. Re-run it whenever the
architecture, API, or roles change so the PDF stays in sync.

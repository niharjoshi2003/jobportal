// Minimal RFC-4180-style CSV exporter. Excel opens .csv natively, so this
// covers the recruiter "export to Excel" need with zero extra dependencies.

const escapeCell = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Quote if it contains comma, quote, newline, or carriage return.
    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

/**
 * Build CSV text from an array of rows and a column definition.
 * columns: Array<{ key: string, label: string, value?: (row) => any }>
 */
export const buildCsv = (rows, columns) => {
    const header = columns.map((c) => escapeCell(c.label)).join(',');
    const lines = rows.map((row) =>
        columns
            .map((c) => escapeCell(c.value ? c.value(row) : row?.[c.key]))
            .join(',')
    );
    // Prepend BOM so Excel renders UTF-8 correctly (esp. Japanese names).
    return '\uFEFF' + [header, ...lines].join('\r\n');
};

export const downloadCsv = (filename, rows, columns) => {
    const csv = buildCsv(rows, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
};

export function exportToCsv(
  filename: string,
  rows: (string | number | Date | null)[][],
): void {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          let value: string;

          if (cell === null) {
            value = '';
          } else if (cell instanceof Date) {
            value = cell.toLocaleString();
          } else {
            value = String(cell);
          }

          value = value.replace(/"/g, '""'); // Escape quotes
          return /("|,|\n)/.test(value) ? `"${value}"` : value;
        })
        .join(','),
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

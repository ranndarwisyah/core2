export function exportToCsv(filename: string, rows: string[][]): void {
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPdf(_filename: string, _rows: string[][]): void {
  window.print();
}

export function tableToMatrix(table: HTMLTableElement): string[][] {
  const rows: string[][] = [];
  for (const tr of table.rows) {
    const row: string[] = [];
    for (const cell of tr.cells) {
      row.push(cell.textContent ?? '');
    }
    rows.push(row);
  }
  return rows;
}

export function exportToCsv<T>(filename: string, rows: T[]) {
  if (!rows || !rows.length) {
    return;
  }

  // Extract headers
  const headers = Object.keys(rows[0] as object);

  // Convert rows to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(fieldName => {
        const value = (row as any)[fieldName];
        // Handle basic escaping for CSV
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

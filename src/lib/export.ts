/**
 * Utility to download an array of objects to a CSV file.
 * 
 * @param data Array of objects to export
 * @param filename Name of the file with no extension
 */
export function downloadCSV(data: Record<string, string | number | boolean | null | undefined>[], filename: string) {
    if (!data || data.length === 0) return;

    // 1. Get headers from first object
    const headers = Object.keys(data[0]);
    
    // 2. Map data rows
    const csvRows = [
        headers.join(','), // Headers line
        ...data.map(row => 
            headers.map(header => {
                const value = row[header] ?? '';
                // Escape double quotes and wrap in quotes to prevent breakages on commas
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ];

    // 3. Create Blob and Trigger download frame
    const csvContent = csvRows.join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // Adds BOM for Excel compatibility
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

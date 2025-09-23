export function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export async function exportOrders() {
  try {
    const response = await fetch('/api/export/orders');
    if (!response.ok) {
      throw new Error('Failed to export orders');
    }
    const csvData = await response.text();
    downloadCSV(csvData, `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('Export orders failed:', error);
    throw error;
  }
}

export async function exportInventory() {
  try {
    const response = await fetch('/api/export/inventory');
    if (!response.ok) {
      throw new Error('Failed to export inventory');
    }
    const csvData = await response.text();
    downloadCSV(csvData, `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('Export inventory failed:', error);
    throw error;
  }
}

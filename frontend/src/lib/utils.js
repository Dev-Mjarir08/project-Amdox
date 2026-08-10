import { toast } from 'react-toastify';
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    toast.success("No data available to export");
    return;
  }
  
  // Get all unique keys from all objects in the array (in case some objects lack some keys)
  const allKeys = Array.from(new Set(data.flatMap(item => Object.keys(item))));
  
  const headers = allKeys.join(',');
  const rows = data.map(row => 
    allKeys
      .map(key => {
        const value = row[key];
        if (value === null || value === undefined) return '';
        const str = String(value);
        return str.includes(',') || str.includes('\n') || str.includes('"') 
          ? `"${str.replace(/"/g, '""')}"` 
          : str;
      })
      .join(',')
  );
  
  const csvContent = "\uFEFF" + [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
}

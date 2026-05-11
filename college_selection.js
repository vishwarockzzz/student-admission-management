// Guard: redirect to login if no tokens are present at all
requireAuth();

function goHome() {
  window.location.href = 'index.html';
}

function goBack() {
  window.history.back();
}

async function downloadExcel() {
  const downloadUrl = `${window.env.BASE_URL}/exports`;

  try {
    const response = await authFetch(downloadUrl);
    if (!response.ok) {
      alert('Failed to download export. Please try again.');
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().split('T')[0];
    a.download = `student_export_${today}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export failed:', err);
    alert('Export failed. Please try again.');
  }
}

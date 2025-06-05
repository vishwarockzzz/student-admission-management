  function goHome() {
    window.location.href = 'index.html'; 
   // Change to your actual login route
  }

  function goBack() {

    window.history.back(); 
    
// Goes to the previous page
  }

function downloadExcel() {
  const downloadUrl = `${window.env.BASE_URL}/exports`;

  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'student_export.xlsx'; // Suggested filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}



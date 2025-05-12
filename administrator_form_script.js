
function goToUpdateRequestPage() {
  window.location.href = '/update-request'; // Replace with your actual update request page URL
}
document.getElementById('nameInput').addEventListener('input', function () {
    const value = this.value.trim();
    const isAllCaps = value === value.toUpperCase();
    const isValid = isAllCaps;

    document.getElementById('name-error').style.display = isValid ? 'none' : 'block';
  });

  document.getElementById('yearOfPassing').addEventListener('input', function () {
    const year = parseInt(this.value, 10);
    const isValid = year >= 2000 && year <= 2025;
    document.getElementById('year-error').style.display = isValid ? 'none' : 'block';
  });

  document.getElementById('phone').addEventListener('input', function () {
    const phone = this.value;
    const isValid = /^[0-9]{10}$/.test(phone);
    document.getElementById('phone-error').style.display = isValid ? 'none' : 'block';
  });

  document.getElementById('twelthMark').addEventListener('input', function () {
    const value = parseInt(this.value);
    const error = document.getElementById('twelthMark-error');

    if (isNaN(value) || value < 0 || value > 600) {
      error.style.display = 'block';
    } else {
      error.style.display = 'none';
    }
  });

  document.getElementById('aadhar').addEventListener('input', function () {
    let input = this.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (input.length > 12) input = input.slice(0, 12);
    const formatted = input.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.value = formatted;

    document.getElementById('aadhar-error').style.display = input.length === 12 ? 'none' : 'block';
  });
  document.getElementById('twelthMarkInput').addEventListener('input', function () {
    const value = parseFloat(this.value);
    const error = document.getElementById('mark-error');

    if (isNaN(value) || value < 0 || value > 100) {
      error.style.display = 'block';
    } else {
      error.style.display = 'none';
    }
  });
  
  const branches = [
'CSE', 'EEE', 'ECE', 'Mechanical', 'Mechatronics', 'IT', 'AI/ML', 'CSBS', 'Civil', 'All'
];

function populateDropdown(dropdownId, exclude = []) {
const dropdown = document.getElementById(dropdownId);
const currentValue = dropdown.value;
dropdown.innerHTML = '<option value="">-- Select --</option>'; // Reset the dropdown

// Add "All" option as the first one, if it's not already excluded
const allOption = document.createElement('option');
allOption.value = "All";
allOption.text = "All";
dropdown.add(allOption);

// Populate the dropdown with the filtered branches, excluding "All" and previously selected branches
branches
  .filter(branch => !exclude.includes(branch) && branch !== "All") // Exclude "All" and previously selected branches
  .forEach(branch => {
    const option = document.createElement('option');
    option.value = branch;
    option.text = branch;
    dropdown.add(option);
  });

// Restore the previously selected value if it is valid
if (branches.includes(currentValue)) {
  dropdown.value = currentValue;
}
}

function updateOptions() {
const pref1 = document.getElementById('pref1').value;
const pref2 = document.getElementById('pref2').value;

// Allow "All" to be selected multiple times in all preferences
populateDropdown('pref2', [pref1]);
populateDropdown('pref3', [pref1, pref2]);
}

document.addEventListener("DOMContentLoaded", () => {
// Initial population of preferences
populateDropdown('pref1');
populateDropdown('pref2');
populateDropdown('pref3');

// Add listeners for updates when preferences are changed
document.getElementById('pref1').addEventListener('change', updateOptions);
document.getElementById('pref2').addEventListener('change', updateOptions);

const inputs = document.querySelectorAll('input, select[name="twelvemax"]');
inputs.forEach(input => input.addEventListener("input", calculateCutoff));
inputs.forEach(input => input.addEventListener("change", calculateCutoff));
});

  
    function togglePreferences() {
      const degree = document.getElementById("degree").value;
      const subjectFields = document.getElementById("subject-fields");
      const nataFields = document.getElementById("nata-fields");
  
      const enggCutoff = document.getElementById("engg-cutoff-group");
      const mscCutoff = document.getElementById("msc-cutoff-group");
      const barchCutoff = document.getElementById("barch-cutoff-group");
      const bdesCutoff = document.getElementById("bdes-cutoff-group");
      const preferences = document.getElementById("preferences");
  
      subjectFields.style.display = "none";
      nataFields.style.display = "none";
      enggCutoff.style.display = "none";
      mscCutoff.style.display = "none";
      barchCutoff.style.display = "none";
      bdesCutoff.style.display = "none";
      preferences.style.display = "none";
  
      if (degree === "btech" || degree === "msc" || degree === "bdes") {
        subjectFields.style.display = "block";
      }
  
      if (degree === "btech") {
        enggCutoff.style.display = "block";
        preferences.style.display = "block";
      }
  
      if (degree === "msc") {
        mscCutoff.style.display = "block";
      }
  
      if (degree === "barch") {
        nataFields.style.display = "block";
        barchCutoff.style.display = "block";
      }
  
      if (degree === "bdes") {
        bdesCutoff.style.display = "block";
      }
  
      calculateCutoff();
    }
  
    function calculateCutoff() {
      const degree = document.getElementById("degree").value;
  
      document.getElementById("engg-cutoff-group").style.display = "none";
      document.getElementById("msc-cutoff-group").style.display = "none";
      document.getElementById("barch-cutoff-group").style.display = "none";
      document.getElementById("bdes-cutoff-group").style.display = "none";
  
      const math = parseFloat(document.querySelector('[name="maths"]').value) || 0;
      const phy = parseFloat(document.querySelector('[name="physics"]').value) || 0;
      const chem = parseFloat(document.querySelector('[name="chemistry"]').value) || 0;
  
      if (degree === "btech") {
        const cutoff = math + phy / 2 + chem / 2;
        document.getElementById("engg-cutoff").value = cutoff.toFixed(2);
        document.getElementById("engg-cutoff-group").style.display = "block";
  
      } else if (degree === "bdes") {
        const cutoff = math + phy / 2 + chem / 2;
        document.getElementById("bdes-cutoff").value = cutoff.toFixed(2);
        document.getElementById("bdes-cutoff-group").style.display = "block";
  
      } else if (degree === "msc") {
        const cutoff = math + phy + chem;
        document.getElementById("msc-cutoff").value = cutoff.toFixed(2);
        document.getElementById("msc-cutoff-group").style.display = "block";
  
      } else if (degree === "barch") {
        const nata = parseFloat(document.querySelector('[name="nata"]').value) || 0;
        const twelve = parseFloat(document.querySelector('[name="twelvemarks"]').value) || 0;
        const totalOutOf = parseFloat(document.querySelector('[name="twelvemax"]').value) || 600;
  
        const converted12th = (twelve / totalOutOf) * 200;
        const barchCutoff = nata + converted12th;
  
        if (nata > 0 && twelve > 0) {
          document.getElementById("barch-cutoff").value = barchCutoff.toFixed(2);
        } else {
          document.getElementById("barch-cutoff").value = "";
        }
  
        document.getElementById("barch-cutoff-group").style.display = "block";
      }
    }

    document.getElementById('nameInput2').addEventListener('input', function () {
        const value = this.value.trim();
        const isAllCaps = value === value.toUpperCase();
        const isValid = isAllCaps;
        // Show or hide error message based on validation for Name 2
        document.getElementById('name-error2').style.display = isValid ? 'none' : 'block';
      });
  
    // Phone number validation
    function validatePhone(inputId, errorId) {
      const phone = document.getElementById(inputId).value;
      const isValid = /^\d{10}$/.test(phone);
      document.getElementById(errorId).style.display = isValid ? 'none' : 'block';
    }
  
    document.getElementById('officePhone').addEventListener('input', () => {
      validatePhone('officePhone', 'officePhone-error');
    });
  
    document.getElementById('personalPhone').addEventListener('input', () => {
      validatePhone('personalPhone', 'personalPhone-error');
    });
  
        function handleSubmit(event) {
            event.preventDefault();
          
            const inputs = document.querySelectorAll('input, select');
            let allFilled = true;
          
            inputs.forEach(input => {
              const isHidden = input.offsetParent === null || input.disabled;
              if (!isHidden && input.type !== "button" && input.type !== "submit" && input.value.trim() === "") {
                allFilled = false;
              }
            });
          
            if (!allFilled) {
              alert("Please fill out all visible fields before submitting.");
              return;
            }
          
            // If all fields are filled, proceed to collect data
            const formData = {
              nameInput: document.getElementById("nameInput")?.value.trim(),
              email: document.getElementById("email")?.value.trim(),
              address: document.getElementById("address")?.value.trim(),
              parentsincome: document.getElementById("parentsincome")?.value.trim(),
              school: document.getElementById("school")?.value.trim(),
              district: document.getElementById("district")?.value.trim(),
              twelfthMark: document.getElementById("twelfthMark")?.value.trim(),
              applicationDate: document.getElementById("applicationDate")?.value.trim(),
              applicationStatus: document.getElementById("applicationStatus")?.value.trim(),
              stucode: document.getElementById("stucode")?.value.trim(),
              phone: document.getElementById("phone")?.value.trim(),
              aadhar: document.getElementById("aadhar")?.value.trim(),
              community: document.getElementById("community")?.value.trim(),
              boardSelect: document.getElementById("boardSelect")?.value.trim(),
              yearOfPassing: document.getElementById("yearOfPassing")?.value.trim(),
              studyBreak: document.getElementById("studyBreak")?.value.trim(),
              applicationNumber: document.getElementById("applicationNumber")?.value.trim(),
              degree: document.getElementById("degree")?.value.trim(),
              maths: document.getElementById("maths")?.value.trim(),
              physics: document.getElementById("physics")?.value.trim(),
              chemistry: document.getElementById("chemistry")?.value.trim(),
              nata: document.getElementById("nata")?.value.trim(),
              engg_cutoff: document.getElementById("engg-cutoff")?.value.trim(),
              msc_cutoff: document.getElementById("msc-cutoff")?.value.trim(),
              barch_cutoff: document.getElementById("barch-cutoff")?.value.trim(),
              bdes_cutoff: document.getElementById("bdes-cutoff")?.value.trim(),
              pref1: document.getElementById("pref1")?.value.trim(),
              pref2: document.getElementById("pref2")?.value.trim(),
              pref3: document.getElementById("pref3")?.value.trim(),
              nameInput2: document.getElementById("nameInput2")?.value.trim(),
              affiliation: document.getElementById("affiliation")?.value.trim(),
              offcode: document.getElementById("offcode")?.value.trim(),
              officePhone: document.getElementById("officePhone")?.value.trim(),
              recEmail: document.getElementById("recEmail")?.value.trim(),
              recDes: document.getElementById("recDes")?.value.trim(),
              recAddress: document.getElementById("recAddress")?.value.trim(),
              percode: document.getElementById("percode")?.value.trim(),
              personalPhone: document.getElementById("personalPhone")?.value.trim()
            };
          
            // Send the form data to FastAPI backend
            fetch("http://localhost:5000/api/students/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(formData)
            })
            .then(response => {
              if (!response.ok) throw new Error("Server error");
              return response.json();
            })
            .then(data => {
              alert("Application form is submitted successfully");
              console.log("Response:", data);
            })
            .catch(error => {
              console.error("Submission error:", error);
              alert("Failed to submit application. Please try again.");
            });
          }
  


function goToUpdateRequestPage() {
  window.location.href = "upcoming request.html";// Replace with your actual update request page URL
}
   let selectedCollege = ''; // Variable to store selected college

          function setCollege(collegeName) {
            selectedCollege = collegeName;
          
            const tceBtn = document.getElementById("tceBtn");
            const tcaBtn = document.getElementById("tcaBtn");
          
            // Remove the "active" class from both buttons
            tceBtn.classList.remove("active");
            tcaBtn.classList.remove("active");
          
            // Add the "active" class to the selected button
            if (collegeName === "TCE") {
              tceBtn.classList.add("active");
              document.getElementById("collegeMessage").textContent = "Student Applying for TCE";
            } else {
              tcaBtn.classList.add("active");
              document.getElementById("collegeMessage").textContent = "Student Applying for TCA";
            }
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

  document.getElementById('twelfthMark').addEventListener('input', function () {
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
  document.getElementById('twelfthMarkInput').addEventListener('input', function () {
    const value = parseFloat(this.value);
    const error = document.getElementById('mark-error');

    if (isNaN(value) || value < 0 || value > 100) {
      error.style.display = 'block';
    } else {
      error.style.display = 'none';
    }
  });
  
  const branches = ['CSE', 'EEE', 'ECE', 'Mechanical', 'Mechatronics', 'IT', 'AI/ML', 'CSBS', 'Civil', 'All'];

function populateDropdown(dropdownId, exclude = []) {
  const dropdown = document.getElementById(dropdownId);
  const currentValue = dropdown.value;

  dropdown.innerHTML = '<option value="">-- Select --</option>'; // Reset the dropdown

  // Always include "All"
  const allOption = document.createElement('option');
  allOption.value = "All";
  allOption.text = "All";
  dropdown.appendChild(allOption);

  // Add other branches except those in exclude
  branches
    .filter(branch => branch !== "All" && !exclude.includes(branch))
    .forEach(branch => {
      const option = document.createElement('option');
      option.value = branch;
      option.text = branch;
      dropdown.appendChild(option);
    });

  // Restore selected value if still valid
  if (branches.includes(currentValue) || currentValue === "All") {
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
    
      const math = parseFloat(document.getElementById("maths").value) || 0;
      const phy = parseFloat(document.getElementById("physics").value) || 0;
      const chem = parseFloat(document.getElementById("chemistry").value) || 0;
    
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
        const nata = parseFloat(document.getElementById("nata").value) || 0;
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
            const isHidden = input.offsetParent === null || input.disabled || input.readOnly;
            const isIgnorableType = input.type === "button" || input.type === "submit";
          
            if (!isHidden && !isIgnorableType && input.value.trim() === "") {
              allFilled = false;
            }
          });
          
          if (!allFilled) {
            alert("Please fill out all visible fields before submitting.");
            return;
          }

  // Check if a college is selected before submitting
  if (!selectedCollege) {
    alert("Please select a college.");
    return;  // Prevent form submission if no college is selected
  }

  const formData = {
    application_number: document.getElementById("applicationNumber")?.value.trim(),
    name: document.getElementById("nameInput")?.value.trim(),
    email: document.getElementById("email")?.value.trim(),
    address: document.getElementById("address")?.value.trim(),
    parent_annual_income: document.getElementById("parentsincome")?.value.trim(),
    school: document.getElementById("school")?.value.trim(),
    district: document.getElementById("district")?.value.trim(),
    twelfth_mark: document.getElementById("twelfthMark")?.value.trim(),
    date_of_application: document.getElementById("applicationDate")?.value.trim(),
    applicationstatus: document.getElementById("applicationStatus")?.value.trim(),
    stdcode: document.getElementById("stucode")?.value.trim(),
    phone_number: document.getElementById("phone")?.value.trim(),
    aadhar_number: document.getElementById("aadhar")?.value.trim(),
    community: document.getElementById("community")?.value.trim(),
    college: selectedCollege, // Set the college to the selected college
    board: document.getElementById("boardSelect")?.value.trim(),
    year_of_passing: document.getElementById("yearOfPassing")?.value.trim(),
    degree: document.getElementById("degree")?.value.trim(),
    maths: document.getElementById("maths")?.value.trim(),
    physics: document.getElementById("physics")?.value.trim(),
    chemistry: document.getElementById("chemistry")?.value.trim(),
    nata: document.getElementById("nata")?.value.trim(),
    engineering_cutoff: document.getElementById("engg-cutoff")?.value.trim(),
    msc_cutoff: document.getElementById("msc-cutoff")?.value.trim(),
    barch_cutoff: document.getElementById("barch-cutoff")?.value.trim(),
    bdes_cutoff: document.getElementById("bdes-cutoff")?.value.trim(),
    branch_1: document.getElementById("pref1")?.value.trim(),
    branch_2: document.getElementById("pref2")?.value.trim(),
    branch_3: document.getElementById("pref3")?.value.trim(),
    college: document.getElementById("nameInput2")?.value.trim(),
  
    recommender: {
      name: document.getElementById("recDes")?.value.trim(),
      designation: document.getElementById("recDes")?.value.trim(),
      affiliation: document.getElementById("affiliation")?.value.trim(),
      office_address: document.getElementById("recAddress")?.value.trim(),
      office_phone_number: document.getElementById("officePhone")?.value.trim(),
      personal_phone_number: document.getElementById("personalPhone")?.value.trim(),
      email: document.getElementById("recEmail")?.value.trim(),
      offcode: document.getElementById("offcode")?.value.trim(),
      percode: document.getElementById("percode")?.value.trim(),
    }
  };

  console.log("Form Data:", formData); // Optional: Log form data for debugging

  // Send the form data to FastAPI backend
  fetch("http://127.0.0.1:5000/api/students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  })
  .then(async response => {
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend error:", errorData);
      throw new Error(errorData.error || "Server error");
    }
    return response.json();
  })
  .then(data => {
    alert("Application form is submitted successfully");
    console.log("Response:", data);
    window.location.href = "upcoming request.html";
  })
  .catch(error => {
    console.error("Submission error:", error.message);
    alert("Failed to submit application. " + error.message);
  });
}
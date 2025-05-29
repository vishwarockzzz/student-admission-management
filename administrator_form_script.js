const API_URL = `${window.env.BASE_URL}/students`;
const API_URL_TCA =`${window.env.BASE_URL}/tcarts/students`
  function goHome() {
    window.location.href = 'index.html'; 
   // Change to your actual login route
  }

  function goBack() {

    window.history.back(); 
    
// Goes to the previous page
  }

  const buttons = document.querySelectorAll('.college-btn');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    buttons.forEach(btn => btn.classList.remove('active'));

    // Add active class to clicked button
    button.classList.add('active');
  });
});
function goToUpdateRequestPage() {
  window.location.href = "college_selection.html";
  // Replace with your actual update request page URL
}
   let selectedCollege = ''; // Variable to store selected college

function setCollege(college) {
  const tceForm = document.getElementById('tceForm');
  const tcaForm = document.getElementById('tcaForm');
  const instruction = document.getElementById('instruction'); // reference to instruction div
  const msg = document.getElementById('collegeMessage');
  selectedCollege = college
  // Hide instruction when a college is selected
  instruction.style.display = 'none';

  if (college === 'TCE') {
    tceForm.style.display = 'block';
    tcaForm.style.display = 'none';
    msg.textContent = "You have selected: Thiagarajar College of Engineering (TCE)";
  } else if (college === 'TCA') {
    tcaForm.style.display = 'block';
    tceForm.style.display = 'none';
    msg.textContent = "You have selected: Thiagarajar College (TCA)";
  } else {
    tceForm.style.display = 'none';
    tcaForm.style.display = 'none';
    msg.textContent = "";
  }
}




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
  
  const branches = ['CSE', 'EEE', 'ECE', 'Mechanical', 'Mechatronic', 'IT', 'AI&ML', 'CSBS', 'Civil', 'Any Branch'];

function populateDropdown(dropdownId, exclude = []) {
  const dropdown = document.getElementById(dropdownId);
  const currentValue = dropdown.value;

  dropdown.innerHTML = '<option value="">-- Select --</option>'; // Reset the dropdown

  // Always include "All"
  const allOption = document.createElement('option');
  allOption.value = "Any Branch";
  allOption.text = "Any Branch";
  dropdown.appendChild(allOption);

  // Add other branches except those in exclude
  branches
    .filter(branch => branch !== "Any Branch" && !exclude.includes(branch))
    .forEach(branch => {
      const option = document.createElement('option');
      option.value = branch;
      option.text = branch;
      dropdown.appendChild(option);
    });

  // Restore selected value if still valid
  if (branches.includes(currentValue) || currentValue === "Any Branch") {
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
      document.getElementById("barch-cutoff-group").style.display = "none";
    
      if (degree === "barch") {
        const nata = parseFloat(document.getElementById("nata").value) || 0;
        const twelve = parseFloat(document.querySelector('[name="twelvemarks"]').value) || 0;
        const totalOutOf = parseFloat(document.querySelector('[name="twelvemax"]').value) || 600;
    
        const converted12th = (twelve / totalOutOf) * 200;
        const barchCutoff = nata + converted12th;
    
        if (nata > 0 && twelve > 0) {
          document.getElementById("barch-cutoff").value = barchCutoff.toFixed(2);
        } 
    
        document.getElementById("barch-cutoff-group").style.display = "block";
      }
    }
    

    document.getElementById('nameInput2').addEventListener('input', function () {
        const value = this.value.trim();
        const isAllCaps = value === value.toUpperCase();
        const isValid = isAllCaps;

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
  async function handleSubmit(event) {
  event.preventDefault();

  const inputs = document.querySelectorAll('input, select, textarea');
  let missingFields = [];

  inputs.forEach(input => {
    const isHidden = input.offsetParent === null;
    const isIgnorableType = input.type === "button" || input.type === "submit";

    if (!isHidden && !isIgnorableType && input.required) {
      if (input.value.trim() === "") {
        // Try to find label text
        let labelText = "";

        if (input.id) {
          const label = document.querySelector(`label[for="${input.id}"]`);
          if (label) labelText = label.textContent.trim();
        }

        if (!labelText) {
          const parent = input.parentElement;
          if (parent) {
            const labelInParent = parent.querySelector('label');
            if (labelInParent) labelText = labelInParent.textContent.trim();
          }
        }

        if (!labelText) {
          labelText = input.name || input.id || "Unnamed field";
        }

        labelText = labelText.replace(/\*/g, '').trim();
        missingFields.push(labelText);
      }
    }
  });

  if (!selectedCollege) {
    missingFields.push("College");
  }

  if (missingFields.length > 0) {
    alert("Please fill out the following required fields:\n\n- " + missingFields.join("\n- "));
    return;
  }

  const button = document.getElementById("submitBtn");
  if (button.disabled) return; // prevent multiple clicks

  const originalHTML = button.innerHTML;

  // Show loading spinner and disable button
  button.innerHTML = `<span class="spinner"></span>Loading...`;
  button.disabled = true;

  try {
    // Replace this with your actual async submission code, e.g.:
    // await fetch('/your-api-endpoint', { method: 'POST', body: formData })

    await submitFormData();  // Dummy async function simulating a 2-second submission delay

    // Optional: clear form or show success message here

  } catch (error) {
    alert("Submission failed: " + error.message);
  } finally {
    // Re-enable the button and restore original content
    button.innerHTML = originalHTML;
    button.disabled = false;
  }


// Dummy async function to simulate form submission delay — replace with your real submission logic

  // Utility function to clean values
  function clean(value, type = "string") {
    if (value === undefined || value === null || value.trim() === "") return null;
    if (type === "float") return parseFloat(value);
    return value.trim();
  }

  const degree = document.getElementById("degree")?.value;

  const formData = {
    application_number: clean(document.getElementById("applicationNumber")?.value),
    name: clean(document.getElementById("nameInput")?.value),
    email: clean(document.getElementById("email")?.value),
    address: clean(document.getElementById("address")?.value),
    parent_annual_income: clean(document.getElementById("parentsincome")?.value),
    school: clean(document.getElementById("school")?.value),
    district: clean(document.getElementById("district")?.value),
    twelfth_mark: clean(document.getElementById("twelfthMark")?.value, "float"),
    date_of_application: clean(document.getElementById("applicationDate")?.value),
    applicationstatus: clean(document.getElementById("applicationStatus")?.value),
    stdcode: clean(document.getElementById("stucode")?.value),
    phone_number: clean(document.getElementById("phone")?.value),
    aadhar_number: clean(document.getElementById("aadhar")?.value),
    community: clean(document.getElementById("community")?.value),
    college: clean(selectedCollege),
    board: clean(document.getElementById("boardSelect")?.value),
    year_of_passing: clean(document.getElementById("yearOfPassing")?.value),
    degree: clean(degree),
    maths: (degree === "btech" || degree === "msc" || degree === "bdes") ? clean(document.getElementById("maths")?.value, "float") : null,
    physics: (degree === "btech" || degree === "msc" || degree === "bdes") ? clean(document.getElementById("physics")?.value, "float") : null,
    chemistry: (degree === "btech" || degree === "msc" || degree === "bdes") ? clean(document.getElementById("chemistry")?.value, "float") : null,
    nata: (degree === "barch") ? clean(document.getElementById("nata")?.value, "float") : null,
    engineering_cutoff: (degree === "btech") ? clean(document.getElementById("engg-cutoff")?.value, "float") : null,
    msc_cutoff: (degree === "msc") ? clean(document.getElementById("msc-cutoff")?.value, "float") : null,
    barch_cutoff: (degree === "barch") ? clean(document.getElementById("barch-cutoff")?.value, "float") : null,
    bdes_cutoff: (degree === "bdes") ? clean(document.getElementById("bdes-cutoff")?.value, "float") : null,
    branch_1: clean(document.getElementById("pref1")?.value),
    branch_2: clean(document.getElementById("pref2")?.value),
    branch_3: clean(document.getElementById("pref3")?.value),
    recommender: {
      name: clean(document.getElementById("nameInput2")?.value),
      designation: clean(document.getElementById("recDes")?.value),
      affiliation: clean(document.getElementById("affiliation")?.value),
      office_address: clean(document.getElementById("recAddress")?.value),
      office_phone_number: clean(document.getElementById("officePhone")?.value),
      personal_phone_number: clean(document.getElementById("personalPhone")?.value),
      email: clean(document.getElementById("recEmail")?.value),
      offcode: clean(document.getElementById("offcode")?.value),
      percode: clean(document.getElementById("percode")?.value),
    }
  };
  function sendStudentDetails(isConfirm = false) {
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({...formData, is_confirm: isConfirm})
  })
    .then(async (res) => {
    const data = await res.json().catch(() => ({})); // protect against invalid JSON
    if (res.status === 409) {
      const proceed = confirm(`${data.error || "Conflict detected."}\n\nDo you want to proceed anyway?`);
      if (proceed) {
        return sendStudentDetails(true); // Retry with confirmation
      } else {
        throw new Error("Operation cancelled by user.");
      }
    } 
    else if (!res.ok) {
      throw new Error(data.error || "An unknown error occurred.");
    }

    return data;
  })
    .then(data => {
      alert("Application form is submitted successfully");
      location.reload();
    })
    .catch(error => {
      console.error("Submission error:", error.message);
      alert("Failed to submit application. " + error.message);
      button.innerHTML = originalHTML;
      button.disabled = false;
    });
}
sendStudentDetails();
}


function submitFormData() {
  return new Promise(resolve => setTimeout(resolve, 2000));
}
   
window.addEventListener('pageshow', function (event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    window.location.reload(); // Reload if user returns via back/forward
  }
});


//FOR TCA //


async function handleSubmitTca(event) {
  event.preventDefault();

  const inputs = document.querySelectorAll('input, select, textarea');
  let missingFields = [];

  inputs.forEach(input => {
    const isHidden = input.offsetParent === null;
    const isIgnorableType = input.type === "button" || input.type === "submit";

    if (!isHidden && !isIgnorableType && input.required) {
      if (input.value.trim() === "") {
        // Try to find label text
        let labelText = "";

        if (input.id) {
          const label = document.querySelector(`label[for="${input.id}"]`);
          if (label) labelText = label.textContent.trim();
        }

        if (!labelText) {
          const parent = input.parentElement;
          if (parent) {
            const labelInParent = parent.querySelector('label');
            if (labelInParent) labelText = labelInParent.textContent.trim();
          }
        }

        if (!labelText) {
          labelText = input.name || input.id || "Unnamed field";
        }

        labelText = labelText.replace(/\*/g, '').trim();
        missingFields.push(labelText);
      }
    }
  });

  if (!selectedCollege) {
    missingFields.push("College");
  }

  if (missingFields.length > 0) {
    alert("Please fill out the following required fields:\n\n- " + missingFields.join("\n- "));
    return;
  }

  const button = document.getElementById("submitBtn");
  if (button.disabled) return; // prevent multiple clicks

  const originalHTML = button.innerHTML;

  // Show loading spinner and disable button
  button.innerHTML = `<span class="spinner"></span>Loading...`;
  button.disabled = true;

  try {
    // Replace this with your actual async submission code, e.g.:
    // await fetch('/your-api-endpoint', { method: 'POST', body: formData })

    await submitFormData();  // Dummy async function simulating a 2-second submission delay

    // Optional: clear form or show success message here

  } catch (error) {
    alert("Submission failed: " + error.message);
  } finally {
    // Re-enable the button and restore original content
    button.innerHTML = originalHTML;
    button.disabled = false;
  }

  // Utility function to clean values
  function clean(value, type = "string") {
  if (value === null || value === undefined || value === "") return null;
  if (type === "float") {
    const floatVal = parseFloat(value);
    return isNaN(floatVal) ? null : floatVal;
  }
  return value.trim();
}

  const degree = document.getElementById("tcaDegree")?.value;

  const formData = {
  application_number: clean(document.getElementById("tcaAppNumber")?.value),
  name: clean(document.getElementById("tcaName")?.value),
  date_of_birth: clean(document.getElementById("tcaDOB")?.value), // Added for DOB
  gender :clean(document.getElementById("tcaSex")?.value),
  school: clean(document.getElementById("tcaSchool")?.value),
  address: clean(document.getElementById("tcaAddress")?.value),
  email: clean(document.getElementById("tcaEmail")?.value),
  phone_number: clean(document.getElementById("tcaMobile")?.value),
  alternate_number: clean(document.getElementById("tcaMobile2")?.value),
  community: clean(document.getElementById("tcaCommunity")?.value),
  college: clean(selectedCollege),
  board: clean(document.getElementById("tcaBoard")?.value),
  year: clean(document.getElementById("tcayear")?.value),
  applicationstatus: clean(document.getElementById("tcaapplicationStatus")?.value),
  degreeType : clean(document.getElementById("tcaDegreeType")?.value),
  course: clean(document.getElementById("tcaCourse")?.value),
  degree: clean(degree),
  subject1: clean(document.getElementById("sub1")?.value, "float"),
  subject2: clean(document.getElementById("sub2")?.value, "float"),
  subject3: clean(document.getElementById("sub3")?.value, "float"),
  subject4: clean(document.getElementById("sub4")?.value, "float"),
  twelfth_mark: clean(document.getElementById("tcaTotalMarks")?.value, "float"),
  date_of_application: clean(document.getElementById("tcaAppDate")?.value),
  aadhar_number: clean(document.getElementById("tcaAadhar")?.value),
  cutoff: clean(document.getElementById("tcacutoff")?.value),
  recommender: {
    name: clean(document.getElementById("tcarecName")?.value),
    designation: clean(document.getElementById("tcarecDes")?.value),
    affiliation: clean(document.getElementById("tcaaffiliation")?.value),
    office_address: clean(document.getElementById("tcarecAddress")?.value),
    office_phone_number: clean(document.getElementById("tcaofficePhone")?.value),
    personal_phone_number: clean(document.getElementById("tcapersonalPhone")?.value),
    email: clean(document.getElementById("tcarecEmail")?.value),
    offcode: clean(document.getElementById("tcaoffcode")?.value),
    percode: clean(document.getElementById("tcapercode")?.value),
  }
};


  fetch(API_URL_TCA, {
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
      location.reload();
    })
    .catch(error => {
      console.error("Submission error:", error.message);
      alert("Failed to submit application. " + error.message);
      button.innerHTML = originalHTML;
      button.disabled = false;
    });
}

function submitFormData() {
  return new Promise(resolve => setTimeout(resolve, 2000));
}



//TCA form

  const aidedCourses = {
    "B.A.": ["Tamil", "English", "Economics (Tamil Medium)"],
    "B.Sc.": ["Mathematics", "Physics", "Chemistry", "Botany", "Zoology", "Computer Science"],
    "B.Com.": [],
    "B.B.A.": []
  };

  const sfCourses = {
    "B.A.": ["Tamil", "English", "Economics (English Medium)"],
    "B.Com. Professional Accounting": [],
    "B.Com. Computer Applications": [],
    "B.Com. Honours": [],
    "B.Sc.": ["Mathematics", "Physics", "Chemistry", "Biotechnology", "Microbiology", "Computer Science", "Information Technology", "Psychology", "Data Science"],
    "B.B.A.": [],
    "B.C.A.": [],
    "B.Com. (Fintech)": [],
    "B.Sc. Computer Science in AI": []
  };

  const degreeTypeSelect = document.getElementById('tcaDegreeType');
  const degreeSelect = document.getElementById('tcaDegree');
  const courseSelect = document.getElementById('tcaCourse');

  const degreeStep = document.getElementById('degreeStep');
  const courseStep = document.getElementById('courseStep');
  const marksStep = document.getElementById('marksStep');

  degreeTypeSelect.addEventListener('change', () => {
    const selectedType = degreeTypeSelect.value;
    degreeSelect.innerHTML = `<option value="">-- Select --</option>`;
    courseSelect.innerHTML = `<option value="">-- Select --</option>`;
    courseStep.style.display = 'none';
    marksStep.style.display = 'none';

    let courseData = selectedType === 'Aided' ? aidedCourses : selectedType === 'Self Finance' ? sfCourses : null;

    if (courseData) {
      Object.keys(courseData).forEach(degree => {
        const option = document.createElement('option');
        option.value = degree;
        option.textContent = degree;
        degreeSelect.appendChild(option);
      });
      degreeStep.style.display = 'block';
    } else {
      degreeStep.style.display = 'none';
    }
  });

  degreeSelect.addEventListener('change', () => {
    const selectedType = degreeTypeSelect.value;
    const selectedDegree = degreeSelect.value;
    const courseData = selectedType === 'Aided' ? aidedCourses : sfCourses;

    courseSelect.innerHTML = `<option value="">-- Select --</option>`;
    marksStep.style.display = 'none';

    if (selectedDegree && courseData[selectedDegree]) {
      const courses = courseData[selectedDegree];
      if (courses.length > 0) {
        courses.forEach(course => {
          const option = document.createElement('option');
          option.value = course;
          option.textContent = course;
          courseSelect.appendChild(option);
        });
        courseStep.style.display = 'block';
      } else {
        // No courses → Skip course step
        courseStep.style.display = 'none';
        marksStep.style.display = 'block';
      }
    } else {
      courseStep.style.display = 'none';
    }
  });

  courseSelect.addEventListener('change', () => {
    if (courseSelect.value) {
      marksStep.style.display = 'block';
    } else {
      marksStep.style.display = 'none';
    }
  });
function validatePhone(inputId, errorId) {
      const phone = document.getElementById(inputId).value;
      const isValid = /^\d{10}$/.test(phone);
      document.getElementById(errorId).style.display = isValid ? 'none' : 'block';
    }
  
    document.getElementById('tcaofficePhone').addEventListener('input', () => {
      validatePhone('tcaofficePhone', 'tcaofficePhone-error');
    });
  
    document.getElementById('tcapersonalPhone').addEventListener('input', () => {
      validatePhone('tcapersonalPhone', 'tcapersonalPhone-error');
    });

    document.getElementById('tcaMobile').addEventListener('input', function () {
    const phone = this.value;
    const isValid = /^[0-9]{10}$/.test(phone);
    document.getElementById('tcaMobile-error').style.display = isValid ? 'none' : 'block';
  });
 document.getElementById('tcaMobile2').addEventListener('input', function () {
    const phone = this.value;
    const isValid = /^[0-9]{10}$/.test(phone);
    document.getElementById('tcaMobile2-error').style.display = isValid ? 'none' : 'block';
  });
  document.getElementById('tcaTotalMarks').addEventListener('input', function () {
    const value = parseInt(this.value);
    const error = document.getElementById('twelthMark-error');

    if (isNaN(value) || value < 0 || value > 600) {
      error.style.display = 'block';
    } else {
      error.style.display = 'none';
    }
  });

// document.getElementById('tcaAadhar').addEventListener('input', function () {
//   let input = this.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');

//   // Limit to 12 digits
//   if (input.length > 12) input = input.slice(0, 12);

//   // Format: 4 4 4 (XXXX XXXX XXXX)
//   const formatted = input.replace(/(\d{4})(?=\d)/g, '$1 ');
//   this.value = formatted;

//   const errorEl = document.getElementById('tcaAadhar-error');

//   // Show error only if input is not empty and not 12 digits
//   if (input.length === 0 || input.length === 12) {
//     errorEl.style.display = 'none';
//   } else {
//     errorEl.style.display = 'block';
//   }
// });

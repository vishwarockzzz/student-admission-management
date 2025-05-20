
const API_URL = `${window.env.BASE_URL}/students`;
console.log(API_URL);
const UPDATE_URL = `${window.env.BASE_URL}/updatestatus`;

const SEATS_URL =`${window.env.BASE_URL}/statusdetails`;

let result = [];
let seats = {};

fetch(SEATS_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    data.forEach(entry => {
      const student_id = entry.student_id;
      const student_name = entry.student_name;
      const course_name = entry.course;
      const course_type = entry.course_type;
      const status = entry.status;
      const remaining_seats = entry.remaining_seats ?? 0;

      // Build result array
      result.push({
        student_id: student_id,
        student_name: student_name,
        course: course_name,
        course_type: course_type,
        status: status,
        remaining_seats: remaining_seats
      });

      // Build SEATS object (course name → remaining seats)
      seats[course_name] = remaining_seats;
    });

    console.log("Result array:", result);
    console.log("SEATS object:", seats);
  })
  .catch(error => {
    console.error("Failed to fetch data:", error);
  });

   function goHome() {
    window.location.href = 'index.html';  // Change to your actual login route
  }

  function goBack() {
    window.history.back();  // Goes to the previous page
  }
function toggleFilterSort() {
  const panel = document.getElementById("filterSortPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
}

// Optional: hide on outside click
document.addEventListener("click", function (event) {
  const panel = document.getElementById("filterSortPanel");
  const button = document.querySelector(".filter-sort-toggle");

  if (!panel.contains(event.target) && !button.contains(event.target)) {
    panel.style.display = "none";
  }
});


let currentStudentId = null;

window.onload = () => {
  loadStatus('UNALLOCATED');
  populateFilters(); // default
};

function handleSearch(status) {
  const query = document.getElementById("searchInput").value.trim();

  if (!query) {
    alert("Please enter a search term");
    return;
  }

  fetch(`${API_URL}?search=${encodeURIComponent(query)}&status=${status}`) 
    .then(response => response.json())
    .then(data => renderStudents(data.students || []))
    .catch(error => console.error("Error during search:", error));
}
function populateFilters() {
  const filterElement = document.getElementById("combinedFilter");

  // Options for departments and degrees
  const options = [
    "CSE", "EEE", "ECE", "Mechanical", "Mechatronics", "IT", "AI/ML", "CSBS", "Civil", "Be/BTECH", "M.SC DATA SCIENCE", "B.DES", "B.ARCH"
  ];

  // Populate the dropdown
  options.forEach(option => {
    const optElement = document.createElement("option");
    optElement.value = option;
    optElement.text = option;
    filterElement.appendChild(optElement);
  });
}

// Function to filter students based on the selected department or degree
function filterByCombined() {
  const selectedFilter = document.getElementById("combinedFilter").value;
  const sortOrder = document.getElementById("appNumberSort").value;
  // If "Clear" is selected, reset the filter and show all students
  
  if (selectedFilter === "Clear") {
    document.getElementById("combinedFilter").value = "Clear"; // Keep the dropdown as Clear
    renderStudents(allStudents); // Render all students again
    return;
  }
  if (selectedFilter === "all") {
    document.getElementById("combinedFilter").value = "all"; // Keep the dropdown as Clear
    renderStudents(allStudents); // Render all students again
    return;
  }

  // Filter by department or degree
  const filteredStudents = allStudents.filter(student => {
    const departments = [student.branch_1, student.branch_2, student.branch_3];
    const degree = student.degree;

    const degreeMatches = {
      "BE/BTECH": ["btech"],
      "M.SC DATA SCIENCE": ["msc"],
      "B.DES": ["bdes"],
      "B.ARCH": ["barch"]
    };
   

    // Check if filter is a department
    if (["CSE", "EEE", "ECE", "Mechanical", "Mechatronics", "IT", "AI/ML", "CSBS", "Civil"].includes(selectedFilter)) {
      return departments.includes(selectedFilter);
    }

    // Check if filter is a degree
    if (Object.keys(degreeMatches).includes(selectedFilter)) {
      return degreeMatches[selectedFilter].includes(degree);
    }

    return false; // In case of no match
  });
  console.log(filteredStudents.map(s => s.application_number));

   // Apply sorting
   // Apply sorting by last 5 digits of application_number
// Sort by last 5 digits of application number
if (sortOrder === "asc") {
  filteredStudents.sort((a, b) => {
    const aLast = parseInt(a.application_number.slice(-5));
    const bLast = parseInt(b.application_number.slice(-5));
    return aLast - bLast;
  });
} else if (sortOrder === "desc") {
  filteredStudents.sort((a, b) => {
    const aLast = parseInt(a.application_number.slice(-5));
    const bLast = parseInt(b.application_number.slice(-5));
    return bLast - aLast;
  });
}



  // Render the filtered students
  renderStudents(filteredStudents);
}


function fetchAndRenderStudents(status) {
  fetch(`${API_URL}?status=${status}`)
    .then(response => response.json())
    .then(data => {
      allStudents = data.students || [];
      renderStudents(allStudents);
      populateRecommenderFilter(allStudents);
    })
    .catch(error => console.error("Error fetching students:", error));
}// Populate recommender dropdown
function populateRecommenderFilter(students) {
  const dropdown = document.getElementById("recommenderFilter");
  dropdown.innerHTML = "";

  // Add "All" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "-- All Recommenders --";
  dropdown.appendChild(allOption);

  const recommenderSet = new Set();

  students.forEach(student => {
    const rec = student.recommenders?.[0];
    if (rec && rec.name) {
      const designation = rec.designation || "-";
      const label = `${rec.name} - ${designation}`;
      recommenderSet.add(label);
    }
  });

  Array.from(recommenderSet).forEach(label => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    dropdown.appendChild(option);
  });
  // Add "Clear" option
  const clearOption = document.createElement("option");
  clearOption.value = "clear";
  clearOption.textContent = "-- Clear Filter --";
  dropdown.appendChild(clearOption);

  
}




function filterByRecommender() {
  const selected = document.getElementById("recommenderFilter").value;

  if (selected === "clear") {
    // Clear the filter and show all students
    renderStudents(allStudents);
    return;
  }

  if (selected === "all") {
    // Show all students (same as the "all" option)
    renderStudents(allStudents);
    return;
  }

  // Filter by selected recommender
  const filtered = allStudents.filter(student => {
    const rec = student.recommenders?.[0];
    const designation = rec?.designation || "-";
    const label = `${rec?.name} - ${designation}`;
    return label === selected;
  });

  renderStudents(filtered);
}




function renderStudents(students) {
  const container = document.getElementById("studentList");
  container.innerHTML = "";

  students.forEach(student => {
    const row = document.createElement("div");
    row.className = "student-row";
    row.id = `student-${student.id}`;
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
      <p><strong>Name:</strong> ${student.name}</p>
      <p><strong>Application No:</strong> ${student.application_number}</p>
      <p><strong>DOA:</strong> ${student.date_of_application}</p>
      <p><strong>School:</strong> ${student.school}</p>
      <p><strong>City:</strong> ${student.district}</p>
      <button class="view-more" onclick='showViewMore(${JSON.stringify(student)})'>View More</button>
    `;

    const recommender = student.recommenders?.[0] || { name: "-", affiliation: "-", designation };

    const recommenderBox = document.createElement("div");
    recommenderBox.className = "recommender-box";
    recommenderBox.innerHTML = `
      <p><strong>Recommender:</strong> ${recommender.name}</p>
      <p><strong>Designation:</strong> ${recommender.designation}</p>
      <p><strong>Company:</strong> ${recommender.affiliation}</p>
    `;

    const actions = document.createElement("div");
    actions.className = "action-buttons";
    actions.innerHTML = `
      <button class="accept" onclick="acceptStudent(${student.id}, '${student.branch_1}')">Accept</button>
      <button class="decline" onclick="declineStudent(${student.id})">Decline</button>
      <button class="onhold" onclick="onHoldStudent(${student.id})">On Hold</button>
    `;

    row.appendChild(card);
    row.appendChild(recommenderBox);
    row.appendChild(actions);
    container.appendChild(row);
  });
}

const courseMap = {
  "CSE": "B.E. Computer Science and Engineering",
  "ECE": "B.E. Electronics and Communication Engineering",
  "EEE": "B.E. Electrical and Electronics Engineering",
  "Mechanical": "B.E. Mechanical Engineering",
  "Mechatronics": "B.E. Mechatronics",
  "IT": "B.Tech. Information Technology",
  "AI/ML": "B.E. Computer Science and Engineering (AI & ML)",
  "CSBS": "B.Tech. Computer Science and Business Systems",
  "Civil": "B.E. Civil Engineering",
  "MSC DATA SCIENCE": "Msc. Data Science",
  "B.DES": "B.Des. Interior Design",
  "B.ARCH": "B.Arch. Architecture"
};
function acceptStudent(id, branch) {
  currentStudentId = id;
  const student = allStudents.find(s => s.id === id);
  const branchSelect = document.getElementById("branchSelect");
  const modeSelect = document.getElementById("modeSelect");

  branchSelect.innerHTML = "";
  modeSelect.innerHTML = "";
  branchSelect.disabled = false;
  modeSelect.disabled = false;

  const degree = (student.degree || "").toUpperCase();
  const branch1 = (student.branch_1 || "").toLowerCase();

  const beCourses = [
    "CSE", "ECE", "EEE", "Mechanical", "Mechatronics", "IT", "AI/ML", "CSBS", "Civil"
  ];

  // Populate branch and mode
  if (degree === "MSC") {
    const option = document.createElement("option");
    option.value = "MSC DATA SCIENCE";
    option.textContent = "MSC DATA SCIENCE";
    branchSelect.appendChild(option);
    branchSelect.value = "MSC DATA SCIENCE";
    branchSelect.disabled = true;

    modeSelect.innerHTML = `<option value="self-finance" selected>Self-Finance</option>`;
    modeSelect.value = "self-finance";
    modeSelect.disabled = false;
  } else if (degree === "BARCH") {
    const option = document.createElement("option");
    option.value = "B.ARCH";
    option.textContent = "B.ARCH";
    branchSelect.appendChild(option);
    branchSelect.value = "B.ARCH";
    branchSelect.disabled = true;

    modeSelect.innerHTML = `
      <option value="">-- Select Mode --</option>
      <option value="aided">Aided</option>
      <option value="self-finance">Self-Finance</option>
    `;
    modeSelect.disabled = false;
  } else if (degree === "BDES") {
    const option = document.createElement("option");
    option.value = "B.DES";
    option.textContent = "B.DES";
    branchSelect.appendChild(option);
    branchSelect.value = "B.DES";
    branchSelect.disabled = true;

    modeSelect.innerHTML = `
      <option value="">-- Select Mode --</option>
      <option value="aided">Aided</option>
      <option value="self-finance">Self-Finance</option>
    `;
    modeSelect.disabled = false;
  }else {
  const preferences = [
    (student.branch_1 || "").toLowerCase(),
    (student.branch_2 || "").toLowerCase(),
    (student.branch_3 || "").toLowerCase()
  ];

  const isGeneral = preferences.includes("all");

  const branchesToShow = isGeneral
    ? beCourses
    : preferences.filter(course => beCourses.includes(course));

  branchesToShow.forEach(course => {
    const option = document.createElement("option");
    option.value = course;
    option.textContent = course;
    branchSelect.appendChild(option);
  });

  branchSelect.onchange = () => {
    const selected = branchSelect.value.toLowerCase();

    if (["msc data science", "data science", "b.des", "b.arch"].includes(selected)) {
      modeSelect.innerHTML = `<option value="self-finance" selected>Self-Finance</option>`;
      modeSelect.value = "self-finance";
      modeSelect.disabled = false;
    } else {
      modeSelect.innerHTML = `
        <option value="">-- Select Mode --</option>
        <option value="aided">Aided</option>
        <option value="self-finance">Self-Finance</option>
      `;
      modeSelect.disabled = false;
    }
  };

  branchSelect.dispatchEvent(new Event("change"));
}

  // Show popup
  document.getElementById("popup-overlay").style.display = "flex";
}





function confirmSelection() {
  const branch = document.getElementById("branchSelect").value;
  const selectedMode = document.getElementById("modeSelect").value;

  if (!branch || !selectedMode) {
    alert("Please select both branch and mode.");
    return;
  }
  const fullCourseName = courseMap[branch.toUpperCase()];
  const modeFormatted = !selectedMode ? "" :
  selectedMode.toLowerCase() === "aided" ? "Aided" : "Self Finance";


  if (!fullCourseName) {
    alert("Course name not recognized.");
    return;
  }

  fetch(UPDATE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: currentStudentId,
      status: "APPROVED",
      course: fullCourseName,
      course_type: modeFormatted
    })
  })
  .then(res => {
    if (!res.ok) {
      return res.json().then(err => { throw new Error(err.error); });
    }
    return res.json();
  })
  .then(data => {
    alert(data.message);
    document.getElementById("popup-overlay").style.display = "none";
    removeCard(currentStudentId);
    location.reload();
  })
  .catch(err => {
    console.error("Error approving student:", err);
    alert(`Failed to approve student: ${err.message}`);
  });
}



function declineStudent(id) {
  fetch(UPDATE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: id,
      status: "DECLINED"
    })
  })
  .then(res => res.json())
  .then(data => {
    const card = document.getElementById(`student-${id}`);
    card.classList.add("decline-shadow");
    setTimeout(() => removeCard(id), 500);
  })
  .catch(err => {
    console.error("Error declining student:", err);
    alert("Failed to decline student");
  });
}

function onHoldStudent(id) {
  fetch(UPDATE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: id,
      status: "ONHOLD"
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(`Student ${id} is on hold.`);
    removeCard(id);
  })
  .catch(err => {
    console.error("Error putting student on hold:", err);
    alert("Failed to put student on hold");
  });
}

function removeCard(id) {
  const row = document.getElementById(`student-${id}`);
  if (row) row.remove();
}
function showViewMore(student) {
  const container = document.getElementById("viewMoreContent");
  container.innerHTML = "";

  const r = student.recommender || student.recommenders?.[0] || {};

  const studentFields = [
    ["Application Number", student.application_number],
    ["Name", student.name],
    ["DOA", student.date_of_application],
    ["School", student.school],
    ["City", student.district],
    ["Std Code", student.stdcode],
    ["Phone", student.phone_number],
    ["Email", student.email],
    ["Aadhar Number", student.aadhar_number],
    ["Parent Annual Income", student.parent_annual_income],
    ["Community", student.community],
    ["Board", student.board],
    ["Year of Passing", student.year_of_passing],
    ["College", student.college],
    ["Degree", student.degree],
    ["Branch 1", student.branch_1],
    ["Branch 2", student.branch_2],
    ["Branch 3", student.branch_3],
    ["Maths", student.maths],
    ["Physics", student.physics],
    ["Chemistry", student.chemistry],
    ["Total Marks", student.twelfth_mark],
    ["Mark %", student.markpercentage],
    ["Engineering Cutoff", student.engineering_cutoff, true],
    ["MSC Cutoff", student.msc_cutoff, true],
    ["BArch Cutoff", student.barch_cutoff, true],
    ["BDes Cutoff", student.bdes_cutoff, true]
  ];

  const recommenderFields = [
    ["Name", r.name],
    ["Designation", r.designation],
    ["Affiliation", r.affiliation],
    ["Office Address", r.office_address],
    ["Offcode", r.offcode],
    ["Office Phone", r.office_phone_number],
    ["Personal Phone", r.personal_phone_number],
    ["Email", r.email]
  ];

  const makeSection = (title, fields) => {
    const section = document.createElement("div");
    section.className = "detail-section";
    section.innerHTML = `<h3>${title}</h3><table class="detail-table"></table>`;
    const table = section.querySelector("table");

    let hasData = false;
    fields.forEach(([label, value, highlight]) => {
      if (value !== null && value !== undefined && value !== "") {
        hasData = true;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${label}:</td>
          <td class="${highlight ? "highlight" : ""}">${value}</td>
        `;
        table.appendChild(row);
      }
    });

    return hasData ? section : null;
  };

  const studentSection = makeSection("STUDENT DETAILS", studentFields);
  const recommenderSection = makeSection("RECOMMENDER DETAILS", recommenderFields);

  if (studentSection) container.appendChild(studentSection);
  if (recommenderSection) container.appendChild(recommenderSection);

  document.getElementById("viewMoreOverlay").style.display = "flex";
}

function closeViewMore() {
  document.getElementById("viewMoreOverlay").style.display = "none";
}

window.onload = () => {
  fetchAndRenderStudents("UNALLOCATED");
  populateFilters();
};

function showSeatPopup() {
  fetch(SEATS_URL)
    .then(response => response.json())
    .then(result => {
      const tableBody = document.getElementById("seatTable").querySelector("tbody");
      tableBody.innerHTML = "";

      const totalSeats = 20; // If total seats per course fixed

      result.forEach((entry, index) => {
        const remainingSeats = entry.remaining_seats || 0;
        const allocatedSeats = totalSeats - remainingSeats;

        const courseWithType = `${entry.course} (${entry.course_type})`;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${courseWithType}</td>
          <td>${totalSeats}</td>
          <td>${allocatedSeats}</td>
          <td>${remainingSeats}</td>
        `;

        tableBody.appendChild(row);
      });

      document.getElementById("seatPopup").style.display = "block";
    })
    .catch(err => {
      console.error("Error fetching seat data:", err);
      alert("Failed to load seat status.");
    });
}



function closeSeatPopup() {
  document.getElementById("seatPopup").style.display = "none";
}
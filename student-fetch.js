
const API_URL = `${window.env.BASE_URL}/students`;
console.log(API_URL);
const UPDATE_URL = `${window.env.BASE_URL}/updatestatus`;

const SEATS_URL =`${window.env.BASE_URL}/statusdetails`;

let result = [];
let seats = {};

function closeSelectionModal() {
  document.getElementById("popup-overlay").style.display = "none";
}
const isAdmin = localStorage.getItem("is_admin") === "true";
function clearSearch() {
  document.getElementById("searchInput").value = "";
  currentStatus="UNALLOCATED"
  fetch(`${API_URL}?status=${currentStatus}`)
    .then(response => response.json())
    .then(data => renderStudents(data.students || []))
    .catch(error => console.error("Error loading students:", error));
}
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
    window.history.back(); 
     // Goes to the previous page
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
    "Any Branch","CSE", "EEE", "ECE", "Mechanical", "Mechatronic", "IT", "AI&ML", "CSBS", "Civil", "BE/BTECH", "M.SC DATA SCIENCE", "B.DES", "B.ARCH"
  ];

  // Populate the dropdown
  options.forEach(option => {
    const optElement = document.createElement("option");
    optElement.value = option;
    optElement.text = option;
    filterElement.appendChild(optElement);
  });
}

function filterByCombined() {
  const selectedFilter = document.getElementById("combinedFilter").value;
      document.getElementById("recommenderFilter").value = "all";

  if (selectedFilter === "Clear" || selectedFilter === "all") {
    renderStudents(allStudents);
    return;
  }
const filteredStudents = allStudents.filter(student => {
  const departments = [student.branch_1, student.branch_2, student.branch_3];
  const degree = student.degree;

  const degreeMatches = {
    "BE/BTECH": ["btech"],
    "M.SC DATA SCIENCE": ["msc"],
    "B.DES": ["bdes"],
    "B.ARCH": ["barch"]
  };

 if (selectedFilter === "Any Branch") {
  // Only allow students with degree exactly "BE/BTECH"
  if (degree !== "btech") return false;

  return (
    departments.includes("Any Branch") ||
    departments.every(branch => !branch || branch.trim() === "")
  );
}
  // Match specific departments
  if (["CSE", "EEE", "ECE", "Mechanical", "Mechatronic", "IT", "AI&ML", "CSBS", "Civil"].includes(selectedFilter)) {
    return departments.includes(selectedFilter);
  }

  // Match by degree type
  if (Object.keys(degreeMatches).includes(selectedFilter)) {
    return degreeMatches[selectedFilter].includes(degree?.toLowerCase());
  }

  return false;
});

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
  const clearOption = document.createElement("option");
  clearOption.value = "clear";
  clearOption.textContent = "-- Clear Filter --";
  dropdown.appendChild(clearOption);

  students.forEach(student => {
    const rec = student.recommenders?.[0];
    if (rec && rec.name) {
      const designation = rec.designation || "-";
      const affiliation = rec.affiliation || "-";
      const label = `${rec.name} - ${designation} - ${affiliation}`;
      recommenderSet.add(label);
    }
  });

  Array.from(recommenderSet).forEach(label => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    dropdown.appendChild(option);
  });

  
}




function filterByRecommender() {
  const selected = document.getElementById("recommenderFilter").value;
  document.getElementById("combinedFilter").value = "all";
  if (selected === "clear" || selected === "all") {
    // Clear the filter and show all students
    renderStudents(allStudents);
    return;
  }

  // Filter by selected recommender
  const filtered = allStudents.filter(student => {
    const rec = student.recommenders?.[0];
    const designation = rec?.designation || "-";
     const affiliation = rec?.affiliation || "-";
    const label = `${rec?.name} - ${designation} - ${affiliation}`;
    return label === selected;
  });

  renderStudents(filtered);
}




function renderStudents(students) {
  const container = document.getElementById("studentList");
  container.innerHTML = "";

  const degreeMap = {
    "b.e": "B.E. / B.Tech.",
    "btech": "B.E. / B.Tech.",
    "engineering": "B.E. / B.Tech.",
    "msc": "M.Sc. DS ",
    "bdes": "B.Des",
    "barch": "B.Arch."
  };

  const orderedDegreeKeys = ["b.e", "btech", "engineering", "msc", "bdes", "barch"];

  // Group students by normalized degree key
  const grouped = {};
  students.forEach(student => {
    const degreeKey = student.degree?.toLowerCase();
    if (!grouped[degreeKey]) grouped[degreeKey] = [];
    grouped[degreeKey].push(student);
  });

  let isFirstGroup = true;

  for (const key of orderedDegreeKeys) {
    const studentsList = grouped[key];
    if (!studentsList || studentsList.length === 0) continue;

    if (!isFirstGroup) {
  const divider = document.createElement("hr");
  divider.className = "degree-divider"; // ✅ Add this line
  container.appendChild(divider);
}

const title = document.createElement("h2");
title.className = "degree-section-header";
title.textContent = degreeMap[key] || key.toUpperCase();
container.appendChild(title);


    studentsList.forEach(student => {
      const row = document.createElement("div");
      row.className = "student-row";
      row.id = `student-${student.id}`;

      const card = document.createElement("div");
      card.className = "student-card";

      let cutoff = "";
      let deg = "";
      switch (student.degree.toLowerCase()) {
        case "b.e":
        case "btech":
        case "engineering":
          cutoff = student.engineering_cutoff;
          deg = degreeMap["b.e"];
          break;
        case "msc":
          cutoff = student.msc_cutoff;
          deg = degreeMap["msc"];
          break;
        case "bdes":
          cutoff = student.bdes_cutoff;
          deg = degreeMap["bdes"];
          break;
        case "barch":
          cutoff = student.barch_cutoff;
          deg = degreeMap["barch"];
          break;
        default:
          cutoff = "N/A";
      }

      card.innerHTML = `
        <p><strong>Name:</strong> ${student.name}</p>
        <p><strong>Application No:</strong> ${student.application_number}</p>
        <p><strong>DOA:</strong> ${student.date_of_application}</p>
        <p><strong>Degree:</strong> ${deg}</p>
        <p><strong>Cut-Off:</strong> ${cutoff}</p>
        <button class="view-more" onclick='showViewMore(${JSON.stringify(student)})'>View More</button>
      `;

      const recommender = student.recommenders?.[0] || {
        name: "-",
        affiliation: "-",
        designation: "-"
      };

      const recommenderBox = document.createElement("div");
      recommenderBox.className = "recommender-box";
      recommenderBox.innerHTML = `
        <p><strong>Recommender:</strong> ${recommender.name}</p>
        <p><strong>Designation:</strong> ${recommender.designation}</p>
        <p><strong>Company:</strong> ${recommender.affiliation}</p>
      `;

      const actions = document.createElement("div");
      actions.className = "action-buttons";
      let withdrawOrDeleteBtn = "";
      if (!isAdmin) {
        withdrawOrDeleteBtn = `<button class="delete" onclick="deleteStudent(${student.id})">Delete</button>`;
      }

      actions.innerHTML = `
        <button class="accept" onclick="acceptStudent(${student.id}, '${student.branch_1}')">Allot</button>
        <button class="decline" onclick="openDeclineModal(${student.id})">Decline</button>
        <button class="onhold" onclick="onHoldStudent(${student.id})">On Hold</button>
        ${withdrawOrDeleteBtn}
      `;

      row.appendChild(card);
      row.appendChild(recommenderBox);
      row.appendChild(actions);
      container.appendChild(row);
    });

    isFirstGroup = false;
  }
}



const courseMap = {
  "CSE": "B.E. Computer Science and Engineering",
  "ECE": "B.E. Electronics and Communication Engineering",
  "EEE": "B.E. Electrical and Electronics Engineering",
  "MECHANICAL": "B.E. Mechanical Engineering",
  "MECHATRONIC": "B.E. Mechatronics",
  "IT": "B.Tech. Information Technology",
  "AI&ML": "B.E. Computer Science and Engineering (AI & ML)",
  "CSBS": "B.Tech. Computer Science and Business Systems",
  "CIVIL": "B.E. Civil Engineering",
  "MSC DATA SCIENCE": "Msc. Data Science",
  "B.DES": "B.Des. Interior Design",
  "B.ARCH": "B.Arch. Architecture"
};
function acceptStudent(id, branch) {
  currentStudentId = id;
  const student = allStudents.find(s => s.id === id);
  const branchSelect = document.getElementById("branchSelect");
  const modeSelect = document.getElementById("modeSelect");

  // Reset and enable dropdowns
  branchSelect.innerHTML = "";
  modeSelect.innerHTML = "";
  branchSelect.disabled = false;
  modeSelect.disabled = false;

  const degree = (student.degree || "").toUpperCase();
  const branch1 = (student.branch || "").toLowerCase();

  const beCourses = [
    "CSE", "ECE", "EEE", "Mechanical", "Mechatronic",
    "IT", "AI&ML", "CSBS", "Civil"
  ];

  // MSC degree
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
  }

  // B.ARCH degree
  else if (degree === "BARCH") {
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
  }

  // B.DES degree
  else if (degree === "BDES") {
    const option = document.createElement("option");
    option.value = "B.DES";
    option.textContent = "B.DES";
    branchSelect.appendChild(option);
    branchSelect.value = "B.DES";
    branchSelect.disabled = true;

    modeSelect.innerHTML = `<option value="self-finance" selected>Self-Finance</option>`;
    modeSelect.value = "self-finance";
    modeSelect.disabled = false;
  }

  // General case: BE courses
  else {
    const branchesToShow = beCourses

    // Add a default option
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Select Branch";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    branchSelect.appendChild(defaultOption);

    branchesToShow.forEach(course => {
      const option = document.createElement("option");
      option.value = course;
      option.textContent = course;
      branchSelect.appendChild(option);
    });

    // Handle mode change on branch selection
    branchSelect.onchange = () => {
      const selected = branchSelect.value.toLowerCase();
      if (["msc data science", "data science", "b.des", "b.arch", "it", "mechatronic", "csbs", "ai&ml"].includes(selected)) {
        modeSelect.innerHTML = `<option value="self-finance" selected>Self-Finance</option>`;
        modeSelect.value = "self-finance";
        modeSelect.disabled = false;
      } else if (["it", "mechatronic"].includes(selected)) {
    // These branches don't support Aided
    modeSelect.innerHTML = `
      <option value="">-- Select Mode --</option>
      <option value="self-finance">Self-Finance</option>
    `;
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

    // Trigger mode dropdown update initially
    branchSelect.dispatchEvent(new Event("change"));
  }

  // Show the popup
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
 const confirmButton = document.querySelector("#popup-overlay button.accept");
  if (confirmButton) {
    confirmButton.disabled = true;
    confirmButton.innerText = "Loading...";
  }

  if (!fullCourseName) {
    alert("Course name not recognized.");
    return;
  }

  function sendApprovalRequest(isConfirm = false) {
  fetch(UPDATE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: currentStudentId,
      status: "APPROVED",
      course: fullCourseName,
      course_type: modeFormatted,
      is_confirm: isConfirm
    })
  })
  .then(async (res) => {
    const data = await res.json().catch(() => ({})); // protect against invalid JSON
    if (res.status === 409) {
      console.log("hello")
      const proceed = confirm(`${data.error || "Conflict detected."}\n\nDo you want to proceed anyway?`);
      if (proceed) {
        return sendApprovalRequest(true); // Retry with confirmation
      } else {
        throw new Error("Operation cancelled by user.");
      }
    } else if (!res.ok) {
      throw new Error(data.error || "An unknown error occurred.");
    }

    return data;
  })
  .then((data) => {
    if (data && data.message) {
      alert(data.message);
      document.getElementById("popup-overlay").style.display = "none";
      removeCard(currentStudentId);
      location.reload();
    }
  })
  .catch((err) => {
    console.error("Error approving student:", err);
    alert(`Failed to approve student: ${err.message}`);
  })
  .finally(() => {
    if (confirmButton) {
      confirmButton.disabled = false;
      confirmButton.innerText = "Allot";
    }
  });
}

// Call it initially
sendApprovalRequest();

}



let currentDeclineId = null;

function openDeclineModal(id) {
  currentDeclineId = id;
  document.getElementById("declineComment").value = "";
  document.getElementById("declineModal").style.display = "block";
}

function closeDeclineModal() {
  document.getElementById("declineModal").style.display = "none";
}

function submitDecline() {
  const comment = document.getElementById("declineComment").value.trim();
  if (!comment) {
    alert("Please provide a reason for declining.");
    return;
  }
  const submitBtn = document.querySelector("#declineModal button:nth-child(4)");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Loading...";
  }

  fetch(UPDATE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: currentDeclineId,
      status: "DECLINED",
      course: comment // use the comment here
    })
  })
    .then(res => res.json())
    .then(data => {
      const card = document.getElementById(`student-${currentDeclineId}`);
      if (card) {
        card.classList.add("decline-shadow");
        setTimeout(() => card.remove(), 500);
      }
      closeDeclineModal();
    })
    .catch(err => {
      console.error("Error declining student:", err);
      alert("Failed to decline student");
    });
     if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit";
      }
}


function onHoldStudent(id) {
  const confirmed = confirm("Are you sure you want to On-Hold this student's application?");
  if (!confirmed) return;
  const btn = document.querySelector(`#student-${id} .onhold`);
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Loading...";
  }
  const student = allStudents.find(s => s.id === id);
  const studentName = student?.name || `ID ${id}`;
  fetch(UPDATE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: id,
      status: "ONHOLD",
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(`Student ${studentName} is on hold.`);
    removeCard(id);
  })
  .catch(err => {
    console.error("Error putting student on hold:", err);
    alert("Failed to put student on hold");
      if (btn) {
      btn.disabled = false;
      btn.innerText = "Put On Hold";
    }
  });
}
function withdrawStudent(id) {
  // Show confirmation dialog before proceeding
  const confirmed = confirm("Are you sure you want to withdraw this student?");
  if (!confirmed) return; // Exit if user cancels

  const btn = document.querySelector(`#student-${id} .withdraw`);
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Loading...";
  }

  fetch(UPDATE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: id,
      status: "WITHDRAWN"
    })
  })
  .then(res => res.json())
  .then(data => {
    const card = document.getElementById(`student-${id}`);
    card.classList.add("decline-shadow");
    setTimeout(() => removeCard(id), 500);
  })
  .catch(err => {
    console.error("Error withdrawing student:", err);
    alert("Failed to withdraw student");
  })
  .finally(() => {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Withdraw";
    }
  });
}

function deleteStudent(id) {
  const confirmed = confirm("Are you sure you want to delete this student's application?");
  if (!confirmed) return;
  fetch(UPDATE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: id,
      status: "DELETE"
    })
  })
  .then(res => res.json())
  .then(data => {
    const card = document.getElementById(`student-${id}`);
    card.classList.add("decline-shadow");
    setTimeout(() => removeCard(id), 500);
  })
  .catch(err => {
    console.error("Error Deleting student:", err);
    alert("Failed to delete student");
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
        ["Address", student.address],
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

      result.forEach((entry, index) => {

        const courseWithType = `${entry.course} (${entry.course_type})`;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${courseWithType}</td>
          <td>${entry.total_seats}</td>
          <td>${entry.allocated_seats}</td>
          <td>${entry.remaining_seats}</td>
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
window.addEventListener('pageshow', function (event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    window.location.reload(); // Reload if user returns via back/forward
  }
});
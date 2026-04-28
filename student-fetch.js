
const BASE_URL = window.env.BASE_URL.replace(/\/$/, '');
const API_URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/students` : `${BASE_URL}/api/students`;
console.log('API_URL', API_URL);
const UPDATE_URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/updatestatus` : `${BASE_URL}/api/updatestatus`;

const SEATS_URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/statusdetails` : `${BASE_URL}/api/statusdetails`;

const SEATS_UPDATE_URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/updateseats` : `${BASE_URL}/api/updateseats`;

let result = [];
let seats = {};

function closeSelectionModal() {
  document.getElementById("popup-overlay").style.display = "none";
}
const isAdmin = localStorage.getItem("is_admin") === "true";
function clearSearch() {
  document.getElementById("searchInput").value = "";
  currentStatus = "UNALLOCATED"
  authFetch(`${API_URL}?status=${currentStatus}`)
    .then(response => response.json())
    .then(data => renderStudents(data.students || []))
    .catch(error => console.error("Error loading students:", error));
}
authFetch(SEATS_URL)
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

function handleSearch(status) {
  const query = document.getElementById("searchInput").value.trim();

  if (!query) {
    alert("Please enter a search term");
    return;
  }

  authFetch(`${API_URL}?search=${encodeURIComponent(query)}&status=${status}`)
    .then(response => response.json())
    .then(data => renderStudents(data.students || []))
    .catch(error => console.error("Error during search:", error));
}
function populateFilters() {
  const filterElement = document.getElementById("combinedFilter");

  // Options for departments and degrees
  const options = [
    "Any Branch", "CSE", "EEE", "ECE", "Mechanical", "Mechatronic", "IT", "AI&ML", "CSBS", "Civil", "BE/BTECH", "M.E/M.TECH", "M.ARCH", "M.C.A", "M.SC DATA SCIENCE", "B.DES", "B.ARCH"
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
      "M.E/M.TECH": ["me_mtech", "me", "mtech"],
      "M.ARCH": ["march"],
      "M.C.A": ["mca"],
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
  authFetch(`${API_URL}?status=${status}`)
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
    "me_mtech": "M.E. / M.Tech.",
    "march": "M.Arch.",
    "mca": "M.C.A.",
    "msc": "M.Sc. Data Science",
    "bdes": "B.Des",
    "barch": "B.Arch."
  };

  const degreeConfig = [
    { key: "btech", displayName: "BE / B.Tech", isPG: false },
    { key: "msc", displayName: "M.Sc. Data Science", isPG: true },
    { key: "bdes", displayName: "B.Des", isPG: false },
    { key: "barch", displayName: "B.Arch", isPG: false },
    { key: "me_mtech", displayName: "ME / M.Tech", isPG: true },
    { key: "march", displayName: "M.Arch", isPG: true },
    { key: "mca", displayName: "MCA", isPG: true }
  ];

  const grouped = {};
  students.forEach(student => {
    const degreeKey = student.degree?.toLowerCase();
    if (!grouped[degreeKey]) grouped[degreeKey] = [];
    grouped[degreeKey].push(student);
  });

  // Create main container
  const mainContainer = document.createElement("div");
  mainContainer.className = "degree-sections-container";

  let ugGroup = null;
  let pgGroup = null;

  degreeConfig.forEach(degreeItem => {
    const { key, displayName, isPG } = degreeItem;
    const studentsList = grouped[key] || [];
    const count = studentsList.length;

    // Create degree group separator if needed
    if (isPG && !pgGroup) {
      pgGroup = document.createElement("div");
      pgGroup.className = "degree-group";

      const pgLabel = document.createElement("div");
      pgLabel.className = "degree-group-title";
      pgLabel.textContent = "POST GRADUATE (PG) DEGREES";
      pgGroup.appendChild(pgLabel);
      mainContainer.appendChild(pgGroup);
    } else if (!isPG && !ugGroup) {
      ugGroup = document.createElement("div");
      ugGroup.className = "degree-group";

      const ugLabel = document.createElement("div");
      ugLabel.className = "degree-group-title";
      ugLabel.textContent = "UNDER GRADUATE (UG) DEGREES";
      ugGroup.appendChild(ugLabel);
      mainContainer.appendChild(ugGroup);
    }

    const targetGroup = isPG ? pgGroup : ugGroup;

    // Create dropdown
    const dropdown = document.createElement("div");
    dropdown.className = "degree-dropdown";
    dropdown.id = `degree-${key}`;

    // Create header
    const header = document.createElement("div");
    header.className = "degree-dropdown-header";
    header.onclick = () => toggleDegreeDropdown(key);

    header.innerHTML = `
      <div class="degree-header-left">
        <span class="degree-name">${displayName}</span>
        <span class="degree-count">${count} Student${count !== 1 ? 's' : ''}</span>
      </div>
      <span class="toggle-icon">▼</span>
    `;

    // Create content area
    const content = document.createElement("div");
    content.className = "degree-content";

    // Create grid
    const grid = document.createElement("div");
    grid.className = "student-grid";

    studentsList.forEach(student => {
      const row = document.createElement("div");
      row.className = "student-row";
      row.id = `student-${student.id}`;

      let cutoff = "";

      // Determine cutoff based on key
      if (["b.e", "btech", "engineering"].includes(key)) cutoff = student.engineering_cutoff;
      else if (key === "msc") cutoff = student.msc_cutoff;
      else if (key === "bdes") cutoff = student.bdes_cutoff;
      else if (key === "barch") cutoff = student.barch_cutoff;

      const degreeDisplayMap = { 'me_mtech': 'M.E/M.TECH', 'march': 'M.Arch', 'mca': 'M.C.A', 'msc': 'M.Sc. DS', 'bdes': 'B.Des', 'barch': 'B.Arch', 'btech': 'B.E/B.Tech' };

      let cutoffDisplay = '';
      let ugDetailsDisplay = '';

      if (!isPG) {
        cutoffDisplay = `<p><strong>Cut-Off:</strong> ${cutoff}</p>`;
      } else {
        // For PG students, show UG details
        const ugCourse = student.ug_course_name ? `${student.ug_course_name}` : '-';
        const ugInstitution = student.ug_institution ? `${student.ug_institution}` : '-';
        const ugCutoff = student.engineering_cutoff || student.msc_cutoff || student.barch_cutoff || student.bdes_cutoff || '-';

        ugDetailsDisplay = `
          <p><strong>UG Course:</strong> ${ugCourse}</p>
          <p><strong>UG Institute:</strong> ${ugInstitution}</p>
          <p><strong>UG Cut-Off:</strong> ${ugCutoff}</p>
        `;
      }

      const recommender = student.recommenders?.[0] || { name: "-", affiliation: "-", designation: "-" };
      let deleteBtn = !isAdmin ? `<button class="delete" onclick="deleteStudent(${student.id})">Delete</button>` : "";

      row.innerHTML = `
        <div class="student-info">
          <p><strong>Name:</strong> ${student.name}</p>
          <p><strong>App No:</strong> ${student.application_number}</p>
          <p><strong>Recommender:</strong> ${recommender.name}</p>
          <p><strong>Designation:</strong> ${recommender.designation}</p>
          ${cutoffDisplay}
          ${ugDetailsDisplay}
          <button class="view-more-btn" onclick='showViewMore(${JSON.stringify(student)})'>View More</button>
        </div>
        <div class="action-buttons">
          <button class="accept allot" onclick="acceptStudent(${student.id}, '${student.branch_1}')">Allot</button>
          <button class="decline" onclick="openDeclineModal(${student.id})">Decline</button>
          <button class="onhold" onclick="onHoldStudent(${student.id})">On Hold</button>
          ${deleteBtn}
        </div>
      `;

      grid.appendChild(row);
    });

    // Add empty state if no students
    if (studentsList.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.style.padding = "30px 20px";
      emptyMsg.style.textAlign = "center";
      emptyMsg.style.color = "#999";
      emptyMsg.style.fontSize = "14px";
      emptyMsg.innerHTML = "<p>No students in this category</p>";
      grid.appendChild(emptyMsg);
    }

    content.appendChild(grid);
    dropdown.appendChild(header);
    dropdown.appendChild(content);
    targetGroup.appendChild(dropdown);
  });

  container.appendChild(mainContainer);
}

function toggleDegreeDropdown(degreeKey) {
  const dropdown = document.getElementById(`degree-${degreeKey}`);
  if (dropdown) {
    dropdown.classList.toggle("active");
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
  "B.ARCH": "B.Arch. Architecture",
  "M.E. STRUCTURAL ENGINEERING": "M.E. Structural Engineering",
  "M.E. ENVIRONMENTAL ENGINEERING": "M.E. Environmental Engineering",
  "M.E. CONSTRUCTION ENGINEERING AND MANAGEMENT": "M.E. Construction Engineering and Management",
  "M.E. ENGINEERING DESIGN": "M.E. Engineering Design",
  "M.E. POWER SYSTEM ENGINEERING": "M.E. Power System Engineering",
  "M.E. COMMUNICATION SYSTEMS": "M.E. Communication Systems",
  "M.E. COMPUTER SCIENCE AND ENGINEERING": "M.E. Computer Science and Engineering"
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

  // M.E/M.Tech degree
  else if (degree === "ME_MTECH") {
    const meCourses = [
      "M.E. Structural Engineering",
      "M.E. Environmental Engineering",
      "M.E. Construction Engineering and Management",
      "M.E. Engineering Design",
      "M.E. Power System Engineering",
      "M.E. Communication Systems",
      "M.E. Computer Science and Engineering"
    ];

    // Add a default option
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Select Branch";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    branchSelect.appendChild(defaultOption);

    meCourses.forEach(course => {
      const option = document.createElement("option");
      option.value = course;
      option.textContent = course;
      branchSelect.appendChild(option);
    });

    modeSelect.innerHTML = `<option value="self-finance" selected>Self-Finance</option>`;
    modeSelect.disabled = true;
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
    authFetch(UPDATE_URL, {
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
  document.getElementById("declineModal").style.display = "flex";
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

  authFetch(UPDATE_URL, {
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
  authFetch(UPDATE_URL, {
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

  authFetch(UPDATE_URL, {
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
  authFetch(UPDATE_URL, {
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

  const makeSection = (title, fields) => {
    const section = document.createElement("div");
    // Bold Section Heading
    section.innerHTML = `
      <h3 style="color: #800000; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 20px; font-weight: 800;">
        ${title.toUpperCase()}
      </h3>
      <table class="neat-table"></table>
    `;
    const table = section.querySelector("table");

    fields.forEach(([label, value]) => {
      if (value) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td style="font-weight: bold; width: 45%;">${label}:</td>
          <td>${value}</td>
        `;
        table.appendChild(row);
      }
    });
    return section;
  };

  const studentProgramType = student.program_type ? student.program_type.toUpperCase() : 'UG';
  const degreeDisplayMap = { 'me_mtech': 'M.E/M.TECH', 'march': 'M.Arch', 'mca': 'M.C.A', 'msc': 'M.Sc. DS', 'bdes': 'B.Des', 'barch': 'B.Arch', 'btech': 'B.E/B.Tech' };
  const degreeDisplay = degreeDisplayMap[(student.degree || '').toLowerCase()] || student.degree;

  let studentFields = [
    ["Application Number", student.application_number],
    ["Name", student.name],
    ["Program Type", studentProgramType],
    ["Degree", degreeDisplay],
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
    ["Branch 1", student.branch_1],
    ["Branch 2", student.branch_2],
    ["Branch 3", student.branch_3]
  ];

  if (studentProgramType === 'PG') {
    studentFields.push(
      ["UG Consolidated Mark", student.ug_consolidated_mark],
      ["UG Course Name", student.ug_course_name],
      ["UG Institution", student.ug_institution],
      ["Tancet/GATE Score", student.tancet_gate_score],
      ["Maths", student.maths],
      ["Physics", student.physics],
      ["Chemistry", student.chemistry],
      ["Total Marks", student.twelfth_mark],
      ["Mark %", student.markpercentage],
      ["Engineering Cutoff", student.engineering_cutoff],
      ["MSC Cutoff", student.msc_cutoff],
      ["BArch Cutoff", student.barch_cutoff],
      ["BDes Cutoff", student.bdes_cutoff]
    );
  } else {
    studentFields.push(
      ["Maths", student.maths],
      ["Physics", student.physics],
      ["Chemistry", student.chemistry],
      ["Total Marks", student.twelfth_mark],
      ["Mark %", student.markpercentage],
      ["Engineering Cutoff", student.engineering_cutoff],
      ["MSC Cutoff", student.msc_cutoff],
      ["BArch Cutoff", student.barch_cutoff],
      ["BDes Cutoff", student.bdes_cutoff]
    );
  }

  container.appendChild(makeSection("Student Details", studentFields));

  container.appendChild(makeSection("Recommender Details", [
    ["Name", r.name],
    ["Designation", r.designation],
    ["Affiliation", r.affiliation],
    ["Office Address", r.office_address],
    ["Offcode", r.offcode],
    ["Office Phone", r.office_phone_number],
    ["Personal Phone", r.personal_phone_number],
    ["Email", r.email]
  ]));

  // Opens in center using flex
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
  authFetch(SEATS_URL)
    .then(response => response.json())
    .then(result => {
      const tableBody = document.getElementById("seatTable").querySelector("tbody");
      tableBody.innerHTML = "";

      let sfTotal = 0, totalApps = 0;
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

      document.getElementById("seatPopup").style.display = "flex";
    })
    .catch(err => {
      console.error("Error fetching seat data:", err);
      alert("Failed to load seat status.");
    });
}



function closeSeatPopup() {
  document.getElementById("seatPopup").style.display = "none";
}

function closeChangeSeatPopup() {
  document.getElementById("changeSeatPopup").style.display = "none";
}

let currentSeatData = [];

function updateRemaining(index) {
  const row = document.querySelector(`#changeSeatTable tbody tr:nth-child(${index + 1})`);
  if (!row) return;

  const totalInput = row.querySelector(`#total-${index}`);
  const allocatedInput = row.querySelector(`#allocated-${index}`);
  const remainingInput = row.querySelector(`#remaining-${index}`);
  if (!totalInput || !allocatedInput || !remainingInput) return;

  const total = parseInt(totalInput.value) || 0;
  const allocated = parseInt(allocatedInput.value) || 0;
  const remaining = Math.max(0, total - allocated);
  remainingInput.value = remaining;

  updateSummaryTotals();
}

function updateSummaryTotals() {
  const tableBody = document.getElementById("changeSeatTable").querySelector("tbody");
  const rows = tableBody.querySelectorAll("tr:not(.summary-row)");
  let sfTotal = 0;
  let sfAllocated = 0;
  let sfRemaining = 0;

  rows.forEach(row => {
    if (row.dataset.courseType !== 'self finance') return;

    const total = parseInt(row.querySelector("input[id^='total-']")?.value) || 0;
    const allocated = parseInt(row.querySelector("input[id^='allocated-']")?.value) || 0;
    const remaining = parseInt(row.querySelector("input[id^='remaining-']")?.value) || 0;

    sfTotal += total;
    sfAllocated += allocated;
    sfRemaining += remaining;
  });

  const totalSummary = document.getElementById("sf-total-summary");
  const allocatedSummary = document.getElementById("sf-allocated-summary");
  const remainingSummary = document.getElementById("sf-remaining-summary");
  if (totalSummary) totalSummary.value = sfTotal;
  if (allocatedSummary) allocatedSummary.value = sfAllocated;
  if (remainingSummary) remainingSummary.value = sfRemaining;
}

function showChangeSeatsPopup() {
  authFetch(SEATS_URL)
    .then(response => response.json())
    .then(result => {
      currentSeatData = result;
      const aided = result.filter(entry => entry.course_type.toLowerCase() === 'aided');
      const sf = result.filter(entry => entry.course_type.toLowerCase() === 'self finance');
      const grouped = [...aided, ...sf];

      const tableBody = document.getElementById("changeSeatTable").querySelector("tbody");
      tableBody.innerHTML = "";

      grouped.forEach((entry, index) => {
        const courseWithType = `${entry.course} (${entry.course_type})`;
        const row = document.createElement("tr");
        row.dataset.courseType = entry.course_type.toLowerCase();
        row.dataset.courseName = entry.course;
        const remainingSeats = Math.max(0, (parseInt(entry.total_seats) || 0) - (parseInt(entry.allocated_seats) || 0));
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${courseWithType}</td>
          <td><input type="number" value="${entry.total_seats}" id="total-${index}" min="0" onchange="updateRemaining(${index})"></td>
          <td><input type="number" value="${entry.allocated_seats}" id="allocated-${index}" min="0" readonly disabled></td>
          <td><input type="number" value="${remainingSeats}" id="remaining-${index}" min="0" readonly disabled></td>
        `;
        tableBody.appendChild(row);
      });

      const sfSummary = result.find(r => r.course_type === 'Total Count' && r.course === 'Self Finance');
      let summaryTotal = 0;
      let summaryAllocated = 0;
      let summaryRemaining = 0;

      const sfEntries = grouped.filter(entry => entry.course_type.toLowerCase() === 'self finance');
      sfEntries.forEach(entry => {
        summaryTotal += parseInt(entry.total_seats) || 0;
        summaryAllocated += parseInt(entry.allocated_seats) || 0;
        summaryRemaining += Math.max(0, (parseInt(entry.total_seats) || 0) - (parseInt(entry.allocated_seats) || 0));
      });

      if (sfSummary) {
        summaryTotal = parseInt(sfSummary.total_seats) || summaryTotal;
        summaryAllocated = parseInt(sfSummary.allocated_seats) || summaryAllocated;
        summaryRemaining = parseInt(sfSummary.remaining_seats) || summaryRemaining;
      }

      const summaryRow = document.createElement("tr");
      summaryRow.classList.add("summary-row");
      summaryRow.innerHTML = `
        <td colspan="2"><strong>Self Finance (Total Count)</strong></td>
        <td><input type="number" value="${summaryTotal}" id="sf-total-summary" readonly disabled></td>
        <td><input type="number" value="${summaryAllocated}" id="sf-allocated-summary" readonly disabled></td>
        <td><input type="number" value="${summaryRemaining}" id="sf-remaining-summary" readonly disabled></td>
      `;
      tableBody.appendChild(summaryRow);
      document.getElementById("changeSeatPopup").style.display = "flex";
      updateSummaryTotals();
    })
    .catch(err => {
      console.error("Error fetching seat data:", err);
      alert("Failed to load seat status.");
    });
}

function saveChangeSeats() {
  const tableBody = document.getElementById("changeSeatTable").querySelector("tbody");
  const rows = tableBody.querySelectorAll("tr:not(.summary-row)");
  const updatedData = [];
  const aided = currentSeatData.filter(entry => entry.course_type.toLowerCase() === 'aided');
  const sf = currentSeatData.filter(entry => entry.course_type.toLowerCase() === 'self finance');
  const grouped = [...aided, ...sf];

  rows.forEach((row, index) => {
    if (index < grouped.length) {
      const totalInput = row.querySelector(`#total-${index}`);
      const originalAllocated = grouped[index].allocated_seats || 0;
      if (totalInput) {
        const newTotal = parseInt(totalInput.value) || 0;
        const newRemaining = Math.max(0, newTotal - originalAllocated);

        updatedData.push({
          course: grouped[index].course,
          course_type: grouped[index].course_type,
          total_seats: newTotal,
          allocated_seats: originalAllocated,
          remaining_seats: newRemaining
        });
      }
    }
  });

  const invalidEntries = updatedData.filter(d => d.total_seats < d.allocated_seats);
  if (invalidEntries.length > 0) {
    const courses = invalidEntries.map(d => d.course).join(", ");
    alert(`Cannot set total seats less than allocated seats for: ${courses}`);
    return;
  }

  function doSeatUpdate(url) {
    return authFetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });
  }

  const fallbackUrl = `${window.env.BASE_URL.replace(/\/api\/?$/, '')}/updateseats`; // supports missing prefix

  doSeatUpdate(SEATS_UPDATE_URL)
    .then(res => {
      if (res.status === 404) {
        console.warn('Primary update URL returned 404, retrying with fallback URL', fallbackUrl);
        return doSeatUpdate(fallbackUrl);
      }
      return res;
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.error) {
        throw new Error(data.error);
      }
      alert("Seats updated successfully");
      location.reload();
    })
    .catch(err => {
      console.error("Error updating seats:", err);
      alert("Failed to update seats: " + err.message);
    });
}

window.addEventListener('pageshow', function (event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    window.location.reload(); // Reload if user returns via back/forward
  }
});
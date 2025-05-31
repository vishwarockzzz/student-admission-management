
const API_URL = `${window.env.BASE_URL}/tcarts/students`;
const UPDATE_URL = `${window.env.BASE_URL}/tcarts/updatestatus`;
const SEATS_URL =`${window.env.BASE_URL}/tcarts/statusdetails`;
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

  // Clear existing options
  filterElement.innerHTML = '<option value="">-- Select --</option>';

  // Aided UG Courses
  const aidedUG = [
    "B.A. - Tamil",
    "B.A. - English",
    "B.A. - Economics (Tamil Medium)",
    "B.Sc. - Mathematics",
    "B.Sc. - Physics",
    "B.Sc. - Chemistry",
    "B.Sc. - Botany",
    "B.Sc. - Zoology",
    "B.Sc. - Computer Science",
    "B.Com.",
    "B.B.A."
  ];

  // Self-Finance UG Courses
  const sfUG = [
    "B.A. - Tamil",
    "B.A. - English",
    "B.A. - Economics (English Medium)",
    "B.Com. Professional Accounting",
    "B.Com. Computer Applications",
    "B.Com. Honours",
    "B.Sc. - Mathematics",
    "B.Sc. - Physics",
    "B.Sc. - Chemistry",
    "B.Sc. - Biotechnology",
    "B.Sc. - Microbiology",
    "B.Sc. - Computer Science",
    "B.Sc. - Information Technology",
    "B.Sc. - Psychology",
    "B.Sc. - Data Science",
    "B.B.A.",
    "B.C.A.",
    "B.Com. (Fintech)",
    "B.Sc. Computer Science in AI"
  ];

  // Add Aided options
  const aidedOptGroup = document.createElement("optgroup");
  aidedOptGroup.label = "Aided";
  aidedUG.forEach(course => {
    const opt = document.createElement("option");
    opt.value = `Aided - ${course}`;
    opt.text = `Aided - ${course}`;
    aidedOptGroup.appendChild(opt);
  });
  filterElement.appendChild(aidedOptGroup);

  // Add SF options
  const sfOptGroup = document.createElement("optgroup");
  sfOptGroup.label = "Self Finance";
  sfUG.forEach(course => {
    const opt = document.createElement("option");
    opt.value = `Self Finance - ${course}`;
    opt.text = `Self Finance - ${course}`;
    sfOptGroup.appendChild(opt);
  });
  filterElement.appendChild(sfOptGroup);
}

function filterByCombined() {
  const selectedFilter = document.getElementById("combinedFilter").value;

  if (selectedFilter === "Clear" || selectedFilter === "all" || selectedFilter === "") {
    renderStudents(allStudents);
    return;
  }

const [type, degree, course] = selectedFilter.split(" - ").map(part => part.trim().toLowerCase());

const filteredStudents = allStudents.filter(student => {
  const degreeType = student.degreeType?.toLowerCase() || "";
  const studentDegree = student.degree?.toLowerCase() || "";
  const studentCourse = student.course?.toLowerCase() || "";

  return (
    degreeType === type &&
    studentDegree === degree &&(
    studentCourse === course || studentCourse =="")
  );
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
     const affiliation = rec?.affiliation || "-";
    const label = `${rec?.name} - ${designation} - ${affiliation}`;
    return label === selected;
  });

  renderStudents(filtered);
}




function renderStudents(students) {
  const container = document.getElementById("studentList");
  container.innerHTML = "";

  // Group students by "type - course"
  const grouped = {};
  students.forEach(student => {
    const type = student.degreeType?.trim() || "Unknown"; // e.g., "Aided" or "Self-Finance"
    const degree = student.degree?.trim() || "Unknown";
    const course = student.course?.trim();
    const coursePart = course && course.toLowerCase() !== "unknown" ? ` - ${course}` : "";

    const key = `${type} - ${degree}${coursePart}`;

  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(student);
});

// Sort keys: Aided groups first, then SF, then alphabetically within each
const orderedKeys = Object.keys(grouped).sort((a, b) => {
  const [typeA] = a.split(" - ");
  const [typeB] = b.split(" - ");
  return typeA.toLowerCase() === "aided" && typeB.toLowerCase() !== "aided"
    ? -1
    : typeA.toLowerCase() !== "aided" && typeB.toLowerCase() === "aided"
    ? 1
    : a.localeCompare(b);
});
let isFirstGroup = true;

  orderedKeys.forEach(groupKey => {
    const studentsList = grouped[groupKey];
    if (!studentsList || studentsList.length === 0) return;

    if (!isFirstGroup) {
      const divider = document.createElement("hr");
      divider.className = "degree-divider";
      container.appendChild(divider);
    }

    const title = document.createElement("h2");
    title.className = "degree-section-header";
    title.textContent = groupKey;
    container.appendChild(title);

    studentsList.forEach(student => {
      const row = document.createElement("div");
      row.className = "student-row";
      row.id = `student-${student.id}`;

      const card = document.createElement("div");
      card.className = "student-card";
      const type = student.degreeType?.trim() || "Unknown";
      const degree = student.degree?.trim() || "Unknown";
      const course = student.course?.trim() || "Unknown";
      const key = course.toLowerCase() !== "unknown"
        ? `${type} - ${degree} - ${course}`
        : `${type} - ${degree}`;

      card.innerHTML = `
        <p><strong>Name:</strong> ${student.name}</p>
        <p><strong>Application No:</strong> ${student.application_number}</p>
        <p><strong>DOA:</strong> ${student.date_of_application}</p>
        <p><strong>Course:</strong> ${key}</p>
        <p><strong>Total Mark:</strong> ${student.twelfth_mark}</p>
        <p><strong>Cut-Off:</strong> ${student.cutoff || "N/A"}</p>
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
        <button class="accept" onclick="acceptStudent(${student.id}, '${key}')">Allot</button>
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
  });
}
// Use global vars on window, since you're storing there in acceptStudent
// Just avoid re-declaring local vars with the same name to prevent confusion.

function acceptStudent(id, key) {
  const [degreeType, degree, course] = key.split(" - ");
  const courseName = course ? `${degree} ${course}` : degree; // combine degree + course if course exists, else degree alone

  const fullCourseName = `${degreeType} - ${courseName}`;

  const branchSelect = document.getElementById("branchSelect");
  branchSelect.innerHTML = "";

  const option = document.createElement("option");
  option.value = fullCourseName;
  option.textContent = fullCourseName;
  option.disabled = false;
  option.selected = true;
  branchSelect.appendChild(option);

  // Store globally for confirmSelection
  window.selectedStudentInfo = {
    course_type: degreeType,
    course_name: courseName,
  };
  window.currentStudentId = id;

  document.getElementById("popup-overlay").style.display = "flex";
}

function confirmSelection() {
  const selectedStudentInfo = window.selectedStudentInfo;
  const currentStudentId = window.currentStudentId;

  if (!selectedStudentInfo || !currentStudentId) {
    alert("Invalid student selection.");
    return;
  }

  // Validate required fields: course_type and course_name must exist
  if (!selectedStudentInfo.course_type || !selectedStudentInfo.course_name) {
    alert("Course type and course name must be selected.");
    return;
  }

  const confirmButton = document.getElementById("confirmBtn");
  confirmButton.disabled = true;
  confirmButton.innerText = "Loading...";

  function sendApprovalRequest(isConfirm = false) {
    fetch(UPDATE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: currentStudentId,
        status: "APPROVED",
        course_type: selectedStudentInfo.course_type,
        course_name: selectedStudentInfo.course_name,
        is_confirm: isConfirm,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          const proceed = confirm(
            `${data.error || "Conflict detected"}\nDo you want to continue?`
          );
          if (proceed) return sendApprovalRequest(true);
          else throw new Error("User cancelled");
        } else if (!res.ok) {
          throw new Error(data.error || "Unknown error");
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
        alert("Error: " + err.message);
      })
      .finally(() => {
        confirmButton.disabled = false;
        confirmButton.innerText = "Confirm";
      });
  }

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
  if (!confirmed) return;

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
        ["Gender", student.gender],
        ["School", student.school],
        ["Phone Number", student.phone_number],
        ["Alternate Number", student.alternate_number],
        ["Address", student.address],
        ["Email", student.email],
        ["Aadhar Number", student.aadhar],
        ["Community", student.community],
        ["Board", student.board],
        ["Year", student.year],
        ["College", student.college],
        ["DegreeType", student.degreeType],
        ["Degree", student.degree],
        ["Course", student.course],
        ["Subject 1", student.subject1],
        ["Subject 2", student.subject2],
        ["Subject 3", student.subject3],
        ["Subject 4", student.subject4],
        ["Total Marks", student.twelfth_mark],
        ["Cutoff", student.cutoff, true],

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
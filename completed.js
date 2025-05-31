const API_URL = `${window.env.BASE_URL}/students`;
const UPDATE_URL = `${window.env.BASE_URL}/updatestatus`;
const SEATS_URL =`${window.env.BASE_URL}/statusdetails`;

function goHome() {
    window.location.href = 'index.html'; 
   // Change to your actual login route
  }

  function goBack() {

    window.history.back(); 
    
// Goes to the previous page
  }
  function clearSearch() { 
  document.getElementById("searchInput").value = "";
   if (currentStatus === "ALL") {
    const statuses = ["APPROVED", "DECLINED", "WITHDRAWN", "ONHOLD"];
    const fetches = statuses.map(s =>
      fetch(`${API_URL}?status=${s}`).then(res => res.json())
    );

    Promise.all(fetches)
      .then(results => {
        const combined = results.flatMap((data, i) => {
          const s = statuses[i];
          return (data.students || []).map(stu => ({ ...stu, application_status: s }));
        });

        renderCards(combined, "ALL", true); // showStatus = true
      })
      .catch(error => console.error("Error restoring all statuses:", error));
  } else {
    fetch(`${API_URL}?status=${currentStatus}`)
      .then(response => response.json())
      .then(data => {
        const students = data.students || [];
        renderCards(students, currentStatus); // showStatus = false
      })
      .catch(error => console.error("Error restoring current status:", error));
  }

}
    window.onload = () => {
    loadStatus('APPROVED'); 
    };

let outcomeCache = [];
let currentStatus = 'APPROVED'; // Default status on initial load
  function printSeatsTable() {
    const tableHtml = document.getElementById("seatsTableContainer").innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>TCE</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 8px; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h2 style="text-align:center;">Thiagarajar Group of Institutions: Management Quota Application Dashboard</h2>');
    printWindow.document.write(tableHtml);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
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
let allStudentsData = []; // global variable
  // global variable

function loadStatus(status, buttonElement) {
  currentStatus = status;
    // Update print button visibility based on selected status
  updateButtonVisibility(status);

  const titleMap = {
    "ONHOLD": "OnHold Applications",
    "APPROVED": "Allotted Applications",
    "DECLINED": "Declined Applications",
    "WITHDRAWN": "Withdrawn Applications",
    "ALL": "All Applications"
  };

  document.getElementById('statusTitle').textContent = titleMap[status] || "";

  // Remove active from all buttons (nav and status)
  document.querySelectorAll('.status-buttons button, .nav-btn2').forEach(btn => {
    btn.classList.remove('active');
  });

  // Highlight clicked button
  if (buttonElement) {
    buttonElement.classList.add('active');
  }

  if (status === "ALL") {
    const statuses = ["APPROVED", "DECLINED", "WITHDRAWN", "ONHOLD"];
    const fetches = statuses.map(s =>
      fetch(`${API_URL}?status=${s}`).then(res => res.json())
    );

    Promise.all(fetches)
      .then(results => {
        const combined = results.flatMap((data, i) => {
          const s = statuses[i];
          return (data.students || []).map(stu => ({ ...stu, application_status: s }));
        });

        allStudentsData = combined; // ✅ store for search
        renderCards(combined, "ALL", true); // ✅ showStatus = true
      })
      .catch(err => console.error("Error fetching all statuses:", err));
  } else {
    fetch(`${API_URL}?status=${status}`)
      .then(response => response.json())
      .then(data => {
        const students = data.students || [];
        allStudentsData = students; // ✅ store for search
        renderCards(students, status, false); // ✅ showStatus = false
      })
      .catch(err => console.error("Error fetching students:", err));
  }

  // Clear search input
  document.getElementById("searchInput").value = "";
}

function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();

  if (!query) {
    alert("Please enter a search term");
    return;
  }

  if (currentStatus === "ALL") {
    // Fetch search results across all statuses
    const statuses = ["APPROVED", "DECLINED", "WITHDRAWN", "ONHOLD"];
    const fetches = statuses.map(s =>
      fetch(`${API_URL}?search=${encodeURIComponent(query)}&status=${s}`)
        .then(res => res.json())
    );

    Promise.all(fetches)
      .then(results => {
        const combined = results.flatMap((data, i) => {
          const s = statuses[i];
          return (data.students || []).map(stu => ({ ...stu, application_status: s }));
        });

        renderCards(combined, "ALL", true); // showStatus = true
      })
      .catch(error => console.error("Error during multi-status search:", error));
  } else {
    // Single-status search
    fetch(`${API_URL}?search=${encodeURIComponent(query)}&status=${currentStatus}`) 
      .then(response => response.json())
      .then(data => {
        const students = data.students || [];
        renderCards(students, currentStatus); // showStatus = false for single
      })
      .catch(error => console.error("Error during search:", error));
  }
}


function renderCards(students, status, showStatus = false) {
  const container = document.getElementById("studentCards");
  container.innerHTML = "";

  const grouped = students.reduce((acc, student) => {
    const degreeKey = student.degree.trim().toLowerCase();
    if (!acc[degreeKey]) acc[degreeKey] = [];
    acc[degreeKey].push(student);
    return acc;
  }, {});

  const degreeTitles = {
    "b.e": "B.E / B.Tech :",
    "btech": "B.E / B.Tech :",
    "engineering": "B.E / B.Tech :",
    "msc": "M.Sc Data Science :",
    "barch": "B.Arch :",
    "bdes": "B.Des :"
  };

  let isFirstGroup = true;

  for (const [degreeKey, studentsList] of Object.entries(grouped)) {
    if (!isFirstGroup) {
      const divider = document.createElement("hr");
      container.appendChild(divider);
    }

     const titleContainer = document.createElement("div");
    titleContainer.className = "degree-title-container";

    const title = document.createElement("h2");
    title.textContent = degreeTitles[degreeKey] || degreeKey.toUpperCase() + " :";
    title.className = "degree-title";

    titleContainer.appendChild(title);
    container.appendChild(titleContainer);

    // Card wrapper with left aligned cards
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "card-wrapper";

    studentsList.forEach(student => {
      const card = document.createElement("div");
      card.className = "card";
      card.id = `student-${student.id}`;


      let cutoff = "";
      switch (student.degree.toLowerCase()) {
        case "b.e":
        case "btech":
        case "engineering":
          cutoff = student.engineering_cutoff;
          break;
        case "msc":
          cutoff = student.msc_cutoff;
          break;
        case "bdes":
          cutoff = student.bdes_cutoff;
          break;
        case "barch":
          cutoff = student.barch_cutoff;
          break;
        default:
          cutoff = "N/A";
      }

      const recommender = student.recommender || student.recommenders?.[0] || {};
      let buttonsHTML = "";
      if (status === "ONHOLD") {
        buttonsHTML += `<button class="accept" onclick="acceptStudent(${student.id}, '${student.branch_1}')">Allot</button>`;
        buttonsHTML += `<button class="decline" onclick="openDeclineModal(${student.id})">Decline</button>`;
      } else if (status === "APPROVED") {
        buttonsHTML += `<button class="decline" onclick="openDeclineModal(${student.id})">Decline</button>`;
        buttonsHTML += `<button class="withdraw" onclick="withdrawStudent(${student.id})">Withdraw</button>`;
      }

      const statusHTML = showStatus
  ? `<p class="status-line"><strong>Status:</strong> ${student.application_status || status}</p>`
  
  : "";


    card.innerHTML = `
  <div class="card-row">
    <div class="student-box">
      <p><strong>${student.application_number}</strong></p>
      <p>${student.name}</p>
      <p><strong>DOA:</strong> ${student.date_of_application}</p>
      <p><strong>Degree:</strong> ${student.degree}</p>
      <p><strong>Cut-Off:</strong> ${cutoff}</p>
       ${statusHTML}
    </div>
    <div class="recommender-box">
      <p><strong>Recommender</strong></p>
      <p>${recommender.name || '-'}</p>
      <p>${recommender.designation || '-'}</p>
      <p>${recommender.affiliation || '-'}</p>
    </div>
  </div>
  <div class="card-bottom">
    <div class="action-buttons">${buttonsHTML}</div>
    <button class="view-more" onclick='showViewMore(${JSON.stringify(student)})'>View More</button>
  </div>
`;

      const currentStatus = showStatus ? student.application_status : status;

  if (currentStatus === "APPROVED" && student.outcomes.length > 0) {
    const firstOutcome = student.outcomes[0];
    const commentBox = document.createElement("div");
    commentBox.className = "decline-comment-box";
    commentBox.innerHTML = `
      <p><strong>Alloted Department :</strong> ${firstOutcome.course_name}</p>
      <p><strong>Type :</strong> ${firstOutcome.course_type}</p>
    `;
    card.appendChild(commentBox);
  } else if (currentStatus === "DECLINED" && student.outcomes.length > 0) {
    const firstOutcome = student.outcomes[0];
    const commentBox = document.createElement("div");
    commentBox.className = "decline-comment-box";
    commentBox.innerHTML = `<p><strong>Decline Reason:</strong> ${firstOutcome.course_name}</p>`;
    card.appendChild(commentBox);
  }

      cardWrapper.appendChild(card);
    });

    container.appendChild(cardWrapper);
    isFirstGroup = false;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  updateButtonVisibility("APPROVED"); // Show "Allotted" Print button initially
});

function generateTableView(status) {
    const students = allStudentsData.filter(stu => stu.application_status === status || currentStatus === status);
    // Normalize degree value
const degreeT = {
  "b.e": "B.E / B.Tech ",
  "btech": "B.E / B.Tech ",
  "engineering": "B.E / B.Tech ",
  "msc": "M.Sc Data Science ",
  "barch": "B.Arch ",
  "bdes": "B.Des "
};

  if (!students.length) {
    alert(`No ${status === "APPROVED" ? "Allotted" : "Declined"} applications found.`);
    return;
  } // Toggle button visibility
  updateButtonVisibility(status);
  // Show popup
  document.getElementById("studentPopup").style.display = "block";
  document.getElementById("popupTitle").textContent =
    status === "APPROVED" ? "Allotted Students" : "Declined Students";

  const tableHead = document.getElementById("studentTableHead");
  const tableBody = document.getElementById("studentTableBody");
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  const headers = [
    "S.No",
    "Student Name",
    "Application No",
    "Cut-Off",
    "Phone",
    "Address",
    ...(status === "APPROVED" ? ["Degree Type","Degree", "Allotted Course"] : ["Decline Reason"]),
    "Recommender Name",
    "Designation"
  ];

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    tableHead.appendChild(th);
  });

  students.forEach((student, index) => {
    const rawDegree = (student.degree || "-").toLowerCase().replace(/\s/g, "");
    const degreeDisplay = degreeT[rawDegree] || student.degree || "-";
    const outcome = student.outcomes[0] || {};
    const r = student.recommender || student.recommenders?.[0] || {};
    const cutoff = student.engineering_cutoff || student.msc_cutoff || student.barch_cutoff || student.bdes_cutoff || "N/A";

    const rowData = [
      index + 1,
      student.name || "-",
      student.application_number || "-",
      cutoff,
      student.phone_number || "-",
      student.address || "-",
      ...(status === "APPROVED"
        ? [outcome.course_type,degreeDisplay, outcome.course_name || "-"]
        : [outcome.course_name || "-"]),
      r.name || "-",
      r.designation || "-"
    ];

    const tr = document.createElement("tr");
    rowData.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

function closeStudentPopup() {
  document.getElementById("studentPopup").style.display = "none";
}


function printStudentTable() {
  const popupContent = document.getElementById("studentTableContainer").innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>TCE</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 8px; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h2 style="text-align:center;">Thiagarajar Group of Institutions: Management Quota Application Dashboard</h2>');
    printWindow.document.write(popupContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function updateButtonVisibility(status) {
  const allottedBtn = document.getElementById("allottedBtn");
  const declinedBtn = document.getElementById("declinedBtn");

  // Default: hide all buttons
  allottedBtn.style.display = "none";
  declinedBtn.style.display = "none";

  if (status === "APPROVED") {
    allottedBtn.style.display = "inline-block";
  } else if (status === "DECLINED") {
    declinedBtn.style.display = "inline-block";
  }
}

const courseMap = {
  "CSE": "B.E. Computer Science and Engineering",
  "ECE": "B.E. Electronics and Communication Engineering",
  "EEE": "B.E. Electrical and Electronics Engineering",
  "MECHANICAL": "B.E. Mechanical Engineering",
  "MECHATRONICS": "B.E. Mechatronics",
  "IT": "B.Tech. Information Technology",
  "AI/ML": "B.E. Computer Science and Engineering (AI & ML)",
  "CSBS": "B.Tech. Computer Science and Business Systems",
  "CIVIL": "B.E. Civil Engineering",
  "MSC DATA SCIENCE": "Msc. Data Science",
  "B.DES": "B.Des. Interior Design",
  "B.ARCH": "B.Arch. Architecture"
};


function closeSelectionModal() {
  document.getElementById("popup-overlay").style.display = "none";
}
function acceptStudent(id, branch) {
  currentStudentId = id;
  const student = allStudentsData.find(s => s.id === id);
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
    "CSE", "ECE", "EEE", "Mechanical", "Mechatronics",
    "IT", "AI/ML", "CSBS", "Civil"
  ];

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


  else if (["BDES", "IT", "Mechatronics", "CSBS"].includes(degree)) {
  const option = document.createElement("option");
  option.value = degree;
  option.textContent = degree;
  branchSelect.appendChild(option);
  branchSelect.value = degree;
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
      if (["msc data science", "data science", "b.des", "b.arch", "it", "mechatronics", "csbs", "ai/ml"].includes(selected)) {
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


function withdrawStudent(withdraw_id) {
  const confirmWithdraw = confirm("Are you sure you want to withdraw this student?");
  if (!confirmWithdraw) return;

  const btn = document.querySelector(`#student-${withdraw_id} .withdraw`);
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Loading...";
  }

  fetch(UPDATE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: withdraw_id,
      status: "WITHDRAWN"
    })
  })
  .then(res => res.json())
  .then(data => {
    const card = document.getElementById(`student-${withdraw_id}`);
    if (card) {
      card.classList.add("decline-shadow");
      setTimeout(() => card.remove(), 500); // remove after animation
    }
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

window.onload = function() {
  const defaultButton = document.querySelector(".status-buttons button.active");
  loadStatus('APPROVED', defaultButton);
};

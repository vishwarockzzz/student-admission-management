const API_URL = `${window.env.BASE_URL}/tcarts/students`;
const UPDATE_URL = `${window.env.BASE_URL}/tcarts/updatestatus`;
const SEATS_URL =`${window.env.BASE_URL}/tcarts/statusdetails`;

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

  const grouped = {};
  students.forEach(student => {
    const type = student.degreeType?.trim() || "Unknown";
    const degree = student.degree?.trim() || "Unknown";
    const course = student.course?.trim();
    const coursePart = course && course.toLowerCase() !== "unknown" ? ` - ${course}` : "";
    const key = `${type} - ${degree}${coursePart}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(student);
  });

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

  // Title Section
  const titleContainer = document.createElement("div");
  titleContainer.className = "degree-title-container";

   const title = document.createElement("h2");
    title.className = "degree-section-header";
    title.textContent = groupKey;
    container.appendChild(title);

  titleContainer.appendChild(title);
  container.appendChild(titleContainer);

  // Card Wrapper
  const cardWrapper = document.createElement("div");
  cardWrapper.className = "card-wrapper";

  studentsList.forEach(student => {
    const card = document.createElement("div");
    card.className = "card";
    card.id = `student-${student.id}`;

    const cutoff = student.cutoff || "N/A";
    const recommender = student.recommender || student.recommenders?.[0] || {};
    const currentStatus = showStatus ? student.application_status : status;

    const statusHTML = showStatus
      ? `<p class="status-line"><strong>Status:</strong> ${student.application_status || status}</p>`
      : "";

    let buttonsHTML = "";
    if (currentStatus === "ONHOLD") {
      buttonsHTML += `<button class="accept" onclick="acceptStudent(${student.id}, '${groupKey}')">Allot</button>`;
      buttonsHTML += `<button class="decline" onclick="openDeclineModal(${student.id})">Decline</button>`;
    } else if (currentStatus === "APPROVED") {
      buttonsHTML += `<button class="decline" onclick="openDeclineModal(${student.id})">Decline</button>`;
      buttonsHTML += `<button class="withdraw" onclick="withdrawStudent(${student.id})">Withdraw</button>`;
    }

    card.innerHTML = `
      <div class="card-row">
        <div class="student-box">
          <p><strong>${student.application_number}</strong></p>
          <p><strong>Name:</strong> ${student.name}</p>
          <p><strong>DOA:</strong> ${student.date_of_application}</p>
          <p><strong>Course:</strong> ${groupKey}</p>
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

    // Outcome / Decline Reason Box
    const outcome = student.outcomes?.[0];
    if (currentStatus === "APPROVED" && outcome) {
      const outcomeBox = document.createElement("div");
      outcomeBox.className = "decline-comment-box";
      outcomeBox.innerHTML = `
        <p><strong>Allotted Department:</strong> ${outcome.course_name}</p>
        <p><strong>Type:</strong> ${outcome.course_type}</p>
      `;
      card.appendChild(outcomeBox);
    } else if (currentStatus === "DECLINED" && outcome) {
      const reasonBox = document.createElement("div");
      reasonBox.className = "decline-comment-box";
      reasonBox.innerHTML = `<p><strong>Decline Reason:</strong> ${outcome.course_name}</p>`;
      card.appendChild(reasonBox);
    }

    cardWrapper.appendChild(card);
  });

  container.appendChild(cardWrapper);
  isFirstGroup = false;
});
}

document.addEventListener("DOMContentLoaded", () => {
  updateButtonVisibility("APPROVED"); // Show "Allotted" Print button initially
});

function generateTableView(status) {
    const students = allStudentsData.filter(stu => stu.application_status === status || currentStatus === status);


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
    ...(status === "APPROVED" ? ["Degree", "Allotted Course"] : ["Decline Reason"]),
    "Recommender Name",
    "Designation"
  ];

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    tableHead.appendChild(th);
  });

  students.forEach((student, index) => {

    const outcome = student.outcomes[0] || {};
    const r = student.recommender || student.recommenders?.[0] || {};
    const cutoff = student.cutoff || "N/A";

    const rowData = [
      index + 1,
      student.name || "-",
      student.application_number || "-",
      cutoff,
      student.phone_number || "-",
      student.address || "-",
      ...(status === "APPROVED"
        ? [student.degreeType || "-",outcome.course_name || "-"]
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


function closeSelectionModal() {
  document.getElementById("popup-overlay").style.display = "none";
}

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

function withdrawStudent(withdraw_id) {
  // Show confirmation dialog first
  const confirmWithdraw = window.confirm("Are you sure you want to withdraw this student?");
  if (!confirmWithdraw) return; // If canceled, stop execution

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
      setTimeout(() => card.remove(), 500); // visually remove the card
    }
    alert("Student has been withdrawn successfully.");
  })
  .catch(err => {
    console.error("Error withdrawing student:", err);
    alert("Failed to withdraw student.");
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


window.onload = function() {
  const defaultButton = document.querySelector(".status-buttons button.active");
  loadStatus('APPROVED', defaultButton);
};

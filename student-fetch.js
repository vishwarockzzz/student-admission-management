const API_URL = "http://127.0.0.1:5000/api/students";
const UPDATE_URL = "http://127.0.0.1:5000/api/updatestatus";


const seats = {
  CSE: 20,
  ECE: 20,
  IT: 20
};

let currentStudentId = null;

window.onload = () => {
  loadStatus('UNALLOCATED'); // default
};

function fetchAndRenderStudents(status) {
  fetch(`${API_URL}?status=${status}`)
    .then(response => response.json())
    .then(data => renderStudents(data.students || []))
    .catch(error => console.error("Error fetching students:", error));
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
      <p><strong>DOB:</strong> ${student.date_of_application}</p>
      <p><strong>School:</strong> ${student.school}</p>
      <p><strong>City:</strong> ${student.district}</p>
      <button class="view-more" onclick='showViewMore(${JSON.stringify(student)})'>View More</button>
    `;

    const recommender = student.recommenders?.[0] || { name: "-", affiliation: "-" };

    const recommenderBox = document.createElement("div");
    recommenderBox.className = "recommender-box";
    recommenderBox.innerHTML = `
      <p><strong>Recommender:</strong> ${recommender.name}</p>
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

function acceptStudent(id, branch) {
  currentStudentId = id;
  document.getElementById("popup-overlay").style.display = "flex";
  document.getElementById("branchSelect").value = branch;
}

function confirmSelection() {
  const branch = document.getElementById("branchSelect").value;
  const mode = document.getElementById("modeSelect").value;

  if (seats[branch] > 0) {
    seats[branch]--;

    fetch(UPDATE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: currentStudentId,
        status: "APPROVED"
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(`Student ${currentStudentId} accepted for ${branch} (${mode}).\nRemaining ${branch} seats: ${seats[branch]}`);
      document.getElementById("popup-overlay").style.display = "none";
      removeCard(currentStudentId);
    })
    .catch(err => {
      console.error("Error approving student:", err);
      alert("Failed to approve student");
    });

  } else {
    alert(`No seats available in ${branch}`);
  }
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
    ["DOB", student.date_of_application],
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



window.onload = fetchAndRenderStudents;

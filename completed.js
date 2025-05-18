const API_URL = `${window.env.BASE_URL}/students`;

window.onload = () => {
  loadStatus('APPROVED'); // default
};

function loadStatus(status) {
  fetch(`${API_URL}?status=${status}`)
    .then(response => response.json())
    .then(data => {
      const students = data.students || [];
      renderCards(students);
    })
    .catch(err => console.error("Error fetching students:", err));
}

function renderCards(students) {
  const container = document.getElementById("studentCards");
  container.innerHTML = "";

  students.forEach(student => {
    const card = document.createElement("div");
    card.className = "card";

    const left = document.createElement("div");
    left.className = "left";
    left.innerHTML = `
      <p><strong>Name:</strong> ${student.name}</p>
      <p><strong>DOB:</strong> ${student.date_of_application}</p>
      <p><strong>School:</strong> ${student.school}</p>
      <p><strong>City:</strong> ${student.district}</p>
      <button class="view-more" onclick='alert(JSON.stringify(${JSON.stringify(student, null, 2)}))'>View More</button>
    `;

    const rec = student.recommenders?.[0] || {};
    const right = document.createElement("div");
    right.className = "right";
    right.innerHTML = `
      <p><strong>Recommender:</strong> ${rec.name || "-"}</p>
      <p><strong>Company:</strong> ${rec.affiliation || "-"}</p>
      <p><strong>Designation:</strong> ${rec.designation || "-"}</p>
    `;

    card.appendChild(left);
    card.appendChild(right);
    container.appendChild(card);
  });
}

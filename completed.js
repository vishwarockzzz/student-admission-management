function goHome() {
    window.location.href = 'index.html'; 
   // Change to your actual login route
  }

  function goBack() {

    window.history.back(); 
    
// Goes to the previous page
  }
    const API_URL = `${window.env.BASE_URL}/students`;

    window.onload = () => {
      loadStatus('APPROVED');
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

        const recommender = student.recommender || student.recommenders?.[0] || {};

        card.innerHTML = `
          <p><strong>Name:</strong> ${student.name}</p>
          <p><strong>DOB:</strong> ${student.date_of_application}</p>
          <p><strong>School:</strong> ${student.school}</p>
          <p><strong>City:</strong> ${student.district}</p>
          <button class="view-more" onclick='showViewMore(${JSON.stringify(student)})'>View More</button>
          <p><strong>Recommender:</strong> ${recommender.name || '-'}</p>
          <p><strong>Company:</strong> ${recommender.affiliation || '-'}</p>
          <p><strong>Designation:</strong> ${recommender.designation || '-'}</p>
        `;

        container.appendChild(card);
      });
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
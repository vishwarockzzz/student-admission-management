// Guard: redirect to login if no tokens are present at all
requireAuth();

const API_URL = `${window.env.BASE_URL}/students`;
const UPDATE_URL = `${window.env.BASE_URL}/updatestatus`;
const SEATS_URL =`${window.env.BASE_URL}/statusdetails`;

const STATUS_QUERY_ALIASES = {
  ONHOLD: ["ONHOLD", "OnHold", "onhold", "ON HOLD", "On Hold", "on hold"]
};

async function fetchStudentsByStatus(status) {
  const queries = STATUS_QUERY_ALIASES[status] || [status];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    try {
      const response = await authFetch(`${API_URL}?status=${encodeURIComponent(query)}`);
      if (!response.ok) continue;
      const data = await response.json();
      if ((data.students || []).length > 0 || i === queries.length - 1) {
        return data.students || [];
      }
    } catch (err) {
      console.warn(`Status query fallback failed for ${query}:`, err);
    }
  }
  return [];
}

async function fetchStudentsByStatusAndSearch(status, searchTerm) {
  const queries = STATUS_QUERY_ALIASES[status] || [status];
  const encodedQuery = encodeURIComponent(searchTerm);

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    try {
      const response = await authFetch(`${API_URL}?search=${encodedQuery}&status=${encodeURIComponent(query)}`);
      if (!response.ok) continue;
      const data = await response.json();
      if ((data.students || []).length > 0 || i === queries.length - 1) {
        return data.students || [];
      }
    } catch (err) {
      console.warn(`Search status query fallback failed for ${query}:`, err);
    }
  }
  return [];
}

function goHome() {
    window.location.href = 'index.html'; 
   // Change to your actual login route
  }

  function goBack() {

    window.history.back(); 
    
// Goes to the previous page
  }

  function goToApplicationProcessing() {
    window.location.href = 'upcoming_request.html';
  }
  function clearSearch() { 
  document.getElementById("searchInput").value = "";
  document.getElementById("ugFilter").value = "";
  document.getElementById("pgFilter").value = "";
  const recommenderFilter = document.getElementById("recommenderFilter");
  if (recommenderFilter) recommenderFilter.value = "all";
  const combinedFilter = document.getElementById("combinedFilter");
  if (combinedFilter) combinedFilter.value = "";
  const panel = document.getElementById("filterSortPanel");
  if (panel) panel.style.display = "none";

   if (currentStatus === "ALL") {
    const statuses = ["APPROVED", "DECLINED", "WITHDRAWN", "ONHOLD"];
    const fetchPromises = statuses.map(async s => {
      const students = await fetchStudentsByStatus(s);
      return students.map(stu => ({ ...stu, application_status: s }));
    });

    Promise.all(fetchPromises)
      .then(results => {
        const combined = results.flatMap(students => students);
        allStudentsData = combined;
        filteredStudentsData = combined;
        populateDegreeFilters();
        renderCards(combined, "ALL", true); // showStatus = true
      })
      .catch(error => console.error("Error restoring all statuses:", error));
  } else {
    fetchStudentsByStatus(currentStatus)
      .then(students => {
        const normalized = students.map(stu => ({ ...stu, application_status: currentStatus }));
        allStudentsData = normalized;
        filteredStudentsData = normalized;
        populateDegreeFilters();
        renderCards(normalized, currentStatus); // showStatus = false
      })
      .catch(error => console.error("Error restoring current status:", error));
  }

}
    window.onload = () => {
    // Pre-fetch seat data
    authFetch(SEATS_URL)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        data.forEach(entry => {
          const remaining_seats = entry.remaining_seats ?? 0;
          result.push({ student_id: entry.student_id, student_name: entry.student_name,
            course: entry.course, course_type: entry.course_type,
            status: entry.status, remaining_seats });
          seats[entry.course] = remaining_seats;
        });
        console.log("Seats pre-loaded:", seats);
      })
      .catch(err => console.error("Failed to pre-load seat data:", err));

    loadStatus('APPROVED');
    };

let outcomeCache = [];
let currentStatus = 'APPROVED'; // Default status on initial load
  function printSeatsTable() {
    const tableHtml = document.getElementById("seatsTableContainer").innerHTML;
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>TCE</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 8px; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h2 style="text-align:center;">Thiagarajar Group of Institutions: Management Quota Application Dashboard</h2>');
    printWindow.document.write(`<p style="text-align:center; font-size: 14px; margin: 10px 0;">Downloaded on: ${currentDate}</p>`);
    printWindow.document.write(tableHtml);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
let result = [];
let seats = {};

function loadSeatTable() {
  const seatTbody = document.querySelectorAll("#seatTable tbody");
  seatTbody.forEach(tbody => tbody.innerHTML = "");

  authFetch(SEATS_URL)
    .then(response => response.json())
    .then(result => {
      seatTbody.forEach(tbody => {
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
          tbody.appendChild(row);
        });
      });
    })
    .catch(err => {
      console.error("Error fetching seat data:", err);
      alert("Failed to load seat status.");
    });
}
// NOTE: seats pre-fetch moved inside window.onload to avoid
// module-level async calls that can race with auth setup.

let allStudentsData = []; // global variable
let filteredStudentsData = []; // for filtering by degree

function normalizeDegreeValue(degree) {
  return (degree || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function populateDegreeFilters() {
  const degrees = {
    ug: new Set(),
    pg: new Set()
  };

  const knownPgKeys = new Set([
    'me', 'm.e', 'mtech', 'm.tech', 'me_mtech', 'me mtech', 'me-mtech', 'memtech', 'mca', 'm.c.a', 'march', 'm.arch', 'mba', 'm.b.a'
  ]);

  allStudentsData.forEach(student => {
    const rawDegree = student.degree || "";
    const degreeKey = normalizeDegreeValue(rawDegree);

    if (degreeKey === 'msc' || degreeKey === 'mscdata' || degreeKey === 'mscdatascience') {
      degrees.ug.add(rawDegree);
    } else if (knownPgKeys.has(degreeKey)) {
      degrees.pg.add(rawDegree);
    } else {
      degrees.ug.add(rawDegree);
    }
  });

  const ugFilter = document.getElementById("ugFilter");
  ugFilter.innerHTML = '<option value="">All UG</option>';
  Array.from(degrees.ug).sort().forEach(degree => {
    const option = document.createElement("option");
    option.value = degree;
    option.textContent = degree.toUpperCase();
    ugFilter.appendChild(option);
  });

  const pgFilter = document.getElementById("pgFilter");
  pgFilter.innerHTML = '<option value="">All PG</option>';
  Array.from(degrees.pg).sort().forEach(degree => {
    const option = document.createElement("option");
    option.value = degree;
    option.textContent = degree.toUpperCase();
    pgFilter.appendChild(option);
  });
}

function populateRecommenderFilter(students) {
  const dropdown = document.getElementById("recommenderFilter");
  if (!dropdown) return;
  dropdown.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Recommenders";
  dropdown.appendChild(allOption);

  const clearOption = document.createElement("option");
  clearOption.value = "clear";
  clearOption.textContent = "Clear Filter";
  dropdown.appendChild(clearOption);

  const recommenderSet = new Set();
  students.forEach(student => {
    const rec = student.recommender || student.recommenders?.[0] || {};
    if (rec.name) {
      const designation = rec.designation || "-";
      const affiliation = rec.affiliation || "-";
      const label = `${rec.name} - ${designation} - ${affiliation}`;
      recommenderSet.add(label);
    }
  });

  Array.from(recommenderSet).sort().forEach(label => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    dropdown.appendChild(option);
  });
}

function toggleFilterSort() {
  const panel = document.getElementById("filterSortPanel");
  if (panel) {
    panel.style.display = panel.style.display === "none" || panel.style.display === "" ? "flex" : "none";
  }
}

function populateCombinedFilter() {
  const dropdown = document.getElementById("combinedFilter");
  if (!dropdown) return;
  dropdown.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All Degrees";
  dropdown.appendChild(allOption);

  const degreeSet = new Set();
  allStudentsData.forEach(student => {
    const degree = student.degree || "";
    if (degree) {
      degreeSet.add(degree);
    }
  });

  Array.from(degreeSet).sort().forEach(degree => {
    const option = document.createElement("option");
    option.value = degree;
    option.textContent = degree.toUpperCase();
    dropdown.appendChild(option);
  });
}

function filterByCombined() {
  const degreeFilter = document.getElementById("combinedFilter")?.value;
  
  let filtered = allStudentsData;

  if (degreeFilter) {
    filtered = filtered.filter(s => (s.degree || "").toLowerCase() === degreeFilter.toLowerCase());
  }

  filteredStudentsData = filtered;
  renderCards(filtered, currentStatus, currentStatus === "ALL");
}

function filterByRecommender() {
  const selected = document.getElementById("recommenderFilter")?.value;
  if (!selected || selected === "all") {
    filteredStudentsData = allStudentsData;
    renderCards(filteredStudentsData, currentStatus, currentStatus === "ALL");
    return;
  }

  if (selected === "clear") {
    document.getElementById("recommenderFilter").value = "all";
    filteredStudentsData = allStudentsData;
    renderCards(filteredStudentsData, currentStatus, currentStatus === "ALL");
    return;
  }

  const filtered = allStudentsData.filter(student => {
    const rec = student.recommender || student.recommenders?.[0] || {};
    const designation = rec.designation || "-";
    const affiliation = rec.affiliation || "-";
    const label = `${rec.name} - ${designation} - ${affiliation}`;
    return label === selected;
  });
  filteredStudentsData = filtered;
  renderCards(filtered, currentStatus, currentStatus === "ALL");
}

function filterByDegree() {
  const ugFilter = document.getElementById("ugFilter").value;
  const pgFilter = document.getElementById("pgFilter").value;

  let filtered = allStudentsData;

  if (ugFilter) {
    filtered = filtered.filter(s => (s.degree || "").toLowerCase() === ugFilter.toLowerCase());
  }

  if (pgFilter) {
    filtered = filtered.filter(s => (s.degree || "").toLowerCase() === pgFilter.toLowerCase());
  }

  filteredStudentsData = filtered;
  renderCards(filtered, currentStatus, currentStatus === "ALL");
}

function loadStatus(status, buttonElement) {
  currentStatus = status;
    // Update print button visibility based on selected status
  updateButtonVisibility(status);

  const titleMap = {
    "ONHOLD": "OnHold Applications",
    "APPROVED": "Allocated Applications",
    "DECLINED": "Declined Applications",
    "WITHDRAWN": "Withdrawn Applications",
    "ALL": "All Applications"
  };

  const statusTitle = document.getElementById('statusTitle');
  statusTitle.textContent = titleMap[status] || "";
  statusTitle.className = '';
  if (status === 'APPROVED') statusTitle.classList.add('status-title-approved');
  else if (status === 'ONHOLD') statusTitle.classList.add('status-title-onhold');
  else if (status === 'DECLINED') statusTitle.classList.add('status-title-declined');
  else if (status === 'WITHDRAWN') statusTitle.classList.add('status-title-withdrawn');
  else statusTitle.classList.add('status-title-all');

  // Remove active from all buttons (nav and status)
  document.querySelectorAll('.status-buttons button, .nav-btn2').forEach(btn => {
    btn.classList.remove('active');
  });

  // Highlight clicked button
  if (buttonElement) {
    buttonElement.classList.add('active');
  }

  // Reset filters
  document.getElementById("ugFilter").value = "";
  document.getElementById("pgFilter").value = "";

  if (status === "ALL") {
    const statuses = ["APPROVED", "DECLINED", "WITHDRAWN", "ONHOLD"];
    const fetchPromises = statuses.map(async s => {
      const students = await fetchStudentsByStatus(s);
      return students.map(stu => ({ ...stu, application_status: s }));
    });

    Promise.all(fetchPromises)
      .then(results => {
        const combined = results.flatMap(students => students);
        allStudentsData = combined; // ✅ store for search
        filteredStudentsData = combined;
        populateDegreeFilters();
        populateRecommenderFilter(allStudentsData);
        populateCombinedFilter();
        const recommenderFilter = document.getElementById("recommenderFilter");
        if (recommenderFilter) recommenderFilter.value = "all";
        const combinedFilter = document.getElementById("combinedFilter");
        if (combinedFilter) combinedFilter.value = "";
        renderCards(combined, "ALL", true); // ✅ showStatus = true
      })
      .catch(err => console.error("Error fetching all statuses:", err));
  } else {
    fetchStudentsByStatus(status)
      .then(students => {
        const normalized = students.map(stu => ({ ...stu, application_status: status }));
        allStudentsData = normalized; // ✅ store for search
        filteredStudentsData = normalized;
        populateDegreeFilters();
        populateRecommenderFilter(allStudentsData);
        populateCombinedFilter();
        const recommenderFilter = document.getElementById("recommenderFilter");
        if (recommenderFilter) recommenderFilter.value = "all";
        const combinedFilter = document.getElementById("combinedFilter");
        if (combinedFilter) combinedFilter.value = "";
        renderCards(normalized, status, false); // ✅ showStatus = false
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

  // Close the filter panel when searching
  const panel = document.getElementById("filterSortPanel");
  if (panel) panel.style.display = "none";

  if (currentStatus === "ALL") {
    const statuses = ["APPROVED", "DECLINED", "WITHDRAWN", "ONHOLD"];
    const fetchPromises = statuses.map(async s => {
      const students = await fetchStudentsByStatusAndSearch(s, query);
      return students.map(stu => ({ ...stu, application_status: s }));
    });

    Promise.all(fetchPromises)
      .then(results => {
        const combined = results.flatMap(students => students);
        allStudentsData = combined;
        filteredStudentsData = combined;
        populateDegreeFilters();
        populateRecommenderFilter(allStudentsData);
        populateCombinedFilter();
        renderCards(combined, "ALL", true);
      })
      .catch(error => console.error("Error during multi-status search:", error));
  } else {
    fetchStudentsByStatusAndSearch(currentStatus, query)
      .then(students => {
        const normalized = students.map(stu => ({ ...stu, application_status: currentStatus }));
        allStudentsData = normalized;
        filteredStudentsData = normalized;
        populateDegreeFilters();
        populateRecommenderFilter(allStudentsData);
        populateCombinedFilter();
        renderCards(normalized, currentStatus);
      })
      .catch(error => console.error("Error during search:", error));
  }
}


function renderCards(students, statusParam, showStatus = false) {
  const container = document.getElementById("studentCards");
  container.innerHTML = "";

  // Degree configuration
  const degreeConfig = [
    { keys: ["b.e", "btech", "engineering"], displayName: "B.E / B.Tech", isPG: false, cutoffField: "engineering_cutoff" },
    { keys: ["msc", "mscdata", "mscdatascience"], displayName: "M.Sc Data Science", isPG: false, cutoffField: "msc_cutoff" },
    { keys: ["bdes", "b.des"], displayName: "B.Des", isPG: false, cutoffField: "bdes_cutoff" },
    { keys: ["barch", "b.arch"], displayName: "B.Arch", isPG: false, cutoffField: "barch_cutoff" },
    { keys: ["me", "m.e", "mtech", "m.tech", "me_mtech", "me mtech", "me-mtech", "memtech"], displayName: "M.E / M.Tech", isPG: true, cutoffField: "engineering_cutoff" },
    { keys: ["mca", "m.c.a"], displayName: "M.C.A", isPG: true, cutoffField: "mca_cutoff" },
    { keys: ["march", "m.arch"], displayName: "M.Arch", isPG: true, cutoffField: "march_cutoff" }
  ];

  const normalizeDegreeValue = degree => (degree || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const allKnownDegreeKeys = new Set(degreeConfig.flatMap(item => item.keys.map(normalizeDegreeValue)));
  
  const mainContainer = document.createElement("div");
  mainContainer.className = "degree-sections-container";

  let ugGroup = null;
  let pgGroup = null;

  degreeConfig.forEach(degreeItem => {
    const { keys, displayName, isPG, cutoffField } = degreeItem;
    const normalizedKeys = keys.map(normalizeDegreeValue);
    const studentsList = normalizedKeys.length
      ? students.filter(student => normalizedKeys.includes(normalizeDegreeValue(student.degree)))
      : students.filter(student => !allKnownDegreeKeys.has(normalizeDegreeValue(student.degree)));
    const count = studentsList.length;

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

    const degreeId = `degree-${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const dropdown = document.createElement("div");
    dropdown.className = "degree-dropdown";
    dropdown.id = degreeId;

    const header = document.createElement("div");
    header.className = "degree-dropdown-header";
    header.onclick = () => toggleDegreeDropdown(degreeId);

    header.innerHTML = `
      <div class="degree-header-left">
        <span class="degree-name">${displayName}</span>
        <span class="degree-count">${count} Student${count !== 1 ? 's' : ''}</span>
      </div>
      <span class="toggle-icon">▼</span>
    `;

    const content = document.createElement("div");
    content.className = "degree-content";

    const grid = document.createElement("div");
    grid.className = "student-grid";

    if (count === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.style.padding = "20px";
      emptyMsg.style.textAlign = "center";
      emptyMsg.style.color = "#999";
      emptyMsg.textContent = "No students in this degree";
      grid.appendChild(emptyMsg);
    } else {
      studentsList.forEach(student => {
        const row = document.createElement("div");
        const statusClass = showStatus ? `status-${student.application_status.toLowerCase()}` : `status-${statusParam.toLowerCase()}`;
        row.className = `student-row ${statusClass}`;
        row.id = `student-${student.id}`;

        let cutoff = student[cutoffField] || "";
        if (!cutoff) {
          cutoff = student.engineering_cutoff || student.msc_cutoff || student.barch_cutoff || student.bdes_cutoff || "";
        }

        const recommender = student.recommender || student.recommenders?.[0] || {};
        const currentStatus = showStatus ? student.application_status : statusParam;
        const statusLabelMap = {
          APPROVED: 'Allocated',
          ONHOLD: 'On Hold',
          DECLINED: 'Declined',
          WITHDRAWN: 'Withdrawn'
        };
        const statusDisplay = statusLabelMap[currentStatus] || currentStatus || 'Unknown';
        const statusBadge = `
          <div class="status-badge status-${currentStatus.toLowerCase()}">
            ${statusDisplay}
          </div>
        `;

      let buttonsHTML = "";
      if (currentStatus === "ONHOLD") {
        buttonsHTML = `
          <button class="accept" onclick="acceptStudent(${student.id}, '${student.branch_1}')">Allot</button>
          <button class="decline" onclick="openDeclineModal(${student.id})">Decline</button>
        `;
      } else if (currentStatus === "APPROVED") {
        buttonsHTML = `
          <button class="decline" onclick="openDeclineModal(${student.id})">Decline</button>
          <button class="onhold" onclick="onHoldStudent(${student.id})">On Hold</button>
          <button class="withdraw" onclick="withdrawStudent(${student.id})">Withdraw</button>
          <button class="change_allotment" onclick="acceptStudent(${student.id}, '${student.branch_1}')">Change Allot</button>
        `;
      } else if (currentStatus === "DECLINED") {
        buttonsHTML = `
          <button class="onhold" onclick="onHoldStudent(${student.id})">On Hold</button>
        `;
      }

      const outcome = student.outcomes?.[0];
      let outcomeHTML = "";
      if (currentStatus === "APPROVED" && outcome) {
        outcomeHTML = `
          <div style="background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 12px;">
            <p style="margin: 4px 0;"><strong>Allotted Dept:</strong> ${outcome.course_name}</p>
            <p style="margin: 4px 0;"><strong>Type:</strong> ${outcome.course_type}</p>
          </div>
        `;
      } else if (currentStatus === "DECLINED" && outcome) {
        outcomeHTML = `
          <div style="background: #fff5f5; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 12px;">
            <p style="margin: 4px 0;"><strong>Reason:</strong> ${outcome.course_name}</p>
          </div>
        `;
      }

      const preferredBranches = [
        student.branch_1 || student.branch1,
        student.branch_2,
        student.branch_3
      ]
        .filter(branch => branch && branch.trim())
        .map(branch => branch.trim());
      const preferredBranch = preferredBranches.length ? preferredBranches.join('/') : '-';
      row.innerHTML = `
        ${statusBadge}
        <div class="student-info">
          <div class="card-row">
            <div class="card-cell"><p><strong>Name:</strong> ${student.name || '-'}</p></div>
            <div class="card-cell"><p><strong>App No:</strong> ${student.application_number || '-'}</p></div>
          </div>
          <div class="card-row">
            <div class="card-cell"><p><strong>Recommender:</strong> ${recommender.name || '-'}</p></div>
            <div class="card-cell"><p><strong>Designation:</strong> ${recommender.designation || '-'}</p></div>
          </div>
          <div class="card-row">
            <div class="card-cell"><p><strong>Cut-Off:</strong> ${cutoff || '-'}</p></div>
            <div class="card-cell"><p><strong>Preferred Branch:</strong> ${preferredBranch || '-'}</p></div>
          </div>
          <button class="view-more-btn" onclick='showViewMore(${JSON.stringify(student).replace(/'/g, "&apos;")})'>View More</button>
        </div>
        <div class="action-buttons">
          ${buttonsHTML}
        </div>
        ${outcomeHTML}
      `;

      grid.appendChild(row);
      });
    }

    content.appendChild(grid);
    dropdown.appendChild(header);
    dropdown.appendChild(content);
    targetGroup.appendChild(dropdown);
  });

  container.appendChild(mainContainer);
}

function toggleDegreeDropdown(degreeId) {
  const dropdown = document.getElementById(degreeId);
  if (dropdown) {
    dropdown.classList.toggle("active");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  updateButtonVisibility("APPROVED"); // Show "Allotted" Print button initially
});

function generateTableView(status) {
  const students = allStudentsData.filter(stu => {
    if (status === "ALL") return true;
    if (stu.application_status === status) return true;
    return !stu.application_status && currentStatus === status;
  });
  const degreeT = {
    "b.e": "B.E / B.Tech",
    "btech": "B.E / B.Tech",
    "engineering": "B.E / B.Tech",
    "msc": "M.Sc Data Science",
    "mscdata": "M.Sc Data Science",
    "mscdatascience": "M.Sc Data Science",
    "bdes": "B.Des",
    "b.des": "B.Des",
    "barch": "B.Arch",
    "b.arch": "B.Arch",
    "me": "M.E / M.Tech",
    "m.e": "M.E / M.Tech",
    "mtech": "M.E / M.Tech",
    "m.tech": "M.E / M.Tech",
    "mca": "M.C.A",
    "m.c.a": "M.C.A",
    "march": "M.Arch",
    "m.arch": "M.Arch"
  };

  if (!students.length) {
    const label = status === "APPROVED" ? "Allotted" : status === "ONHOLD" ? "On Hold" : status === "DECLINED" ? "Declined" : "Requested";
    alert(`No ${label} applications found.`);
    return;
  }

  updateButtonVisibility(status);
  document.getElementById("studentPopup").style.display = "flex";
  document.getElementById("popupTitle").textContent =
    status === "APPROVED"
      ? "Allotted Students"
      : status === "ONHOLD"
      ? "On Hold Students"
      : status === "DECLINED"
      ? "Declined Students"
      : "Student Status";

  window.currentPopupStudents = students;
  window.currentPopupStatus = status;

  const branchFilter = document.getElementById("branchPrintFilter");
  if (branchFilter) {
    if (status === "APPROVED" || status === "ALL") {
      branchFilter.innerHTML = '<option value="ALL">All Branches</option>';
      const uniqueBranches = new Set();
      students.forEach(student => {
        const outcome = student.outcomes[0] || {};
        const courseName = outcome.course_name || "-";
        if (courseName !== "-") uniqueBranches.add(courseName);
      });
      uniqueBranches.forEach(branch => {
        const option = document.createElement("option");
        option.value = branch;
        option.textContent = branch;
        branchFilter.appendChild(option);
      });
      branchFilter.value = "ALL";
    } else {
      branchFilter.style.display = "none";
    }
  }

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
    ...(status === "APPROVED" || status === "ONHOLD"
      ? ["Degree Type", "Degree", status === "APPROVED" ? "Allotted Course" : "On Hold Detail"]
      : ["Decline Reason"]),
    "Recommender Name",
    "Designation"
  ];

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    tableHead.appendChild(th);
  });

  students.forEach((student, index) => {
    const rawDegree = (student.degree || "-").toLowerCase().replace(/\s|\./g, "");
    const degreeDisplay = degreeT[rawDegree] || student.degree || "-";
    const outcome = (student.outcomes || [])[0] || {};
    const r = student.recommender || student.recommenders?.[0] || {};
    const cutoff = student.engineering_cutoff || student.msc_cutoff || student.barch_cutoff || student.bdes_cutoff || "N/A";

    const onHoldDetail = student.onhold_reason || student.on_hold_reason || outcome.course_name || "-";
    const declineDetail = outcome.course_name || "-";
    const rowData = [
      index + 1,
      student.name || "-",
      student.application_number || "-",
      cutoff,
      student.phone_number || "-",
      student.address || "-",
      ...(status === "APPROVED"
        ? [outcome.course_type || "-", degreeDisplay, outcome.course_name || "-"]
        : status === "ONHOLD"
        ? [outcome.course_type || "-", degreeDisplay, onHoldDetail]
        : [declineDetail]),
      r.name || "-",
      r.designation || "-"
    ];

    const tr = document.createElement("tr");
    tr.dataset.course = outcome.course_name || "-";
    rowData.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
 
loadSeatTable();
}

function applyPrintFilter() {
  const filterVal = document.getElementById("branchPrintFilter").value;
  const tbody = document.getElementById("studentTableBody");
  const rows = tbody.getElementsByTagName("tr");
  let displayIndex = 1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (filterVal === "ALL" || row.dataset.course === filterVal) {
      row.style.display = "";
      row.cells[0].textContent = displayIndex++;
    } else {
      row.style.display = "none";
    }
  }
}

function closeStudentPopup() {
  document.getElementById("studentPopup").style.display = "none";
}
const degreeT = {
  "b.e": "B.E / B.Tech",
  "btech": "B.E / B.Tech",
  "engineering": "B.E / B.Tech",
  "msc": "M.Sc Data Science",
  "mscdata": "M.Sc Data Science",
  "mscdatascience": "M.Sc Data Science",
  "barch": "B.Arch",
  "bdes": "B.Des",
  "b.des": "B.Des",
  "m.e": "M.E / M.Tech",
  "me": "M.E / M.Tech",
  "mtech": "M.E / M.Tech",
  "m.tech": "M.E / M.Tech",
  "mca": "M.C.A",
  "m.c.a": "M.C.A",
  "march": "M.Arch",
  "m.arch": "M.Arch"
};

function generateAllStudentTableView(allStudents) {
  // Fill table header
  const headers = [
    "S.No",
    "Student Name",
    "Application No",
    "Cut-Off",
    "Phone",
    "Course Name",
    "Course Type",
    "Status"
  ];

  const theadRow = document.getElementById("studentTableHead");
  const tbody = document.getElementById("studentTableBody");

  theadRow.innerHTML = ""; // Clear old headers
  tbody.innerHTML = "";    // Clear old body

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    theadRow.appendChild(th);
  });

  // Fix 3: Populate branch filter for Print All view
  const branchFilter = document.getElementById("branchPrintFilter");
  if (branchFilter) {
    branchFilter.innerHTML = '<option value="ALL">All Branches</option>';
    const uniqueCourses = new Set();
    allStudents.forEach(student => {
      const outcome = student.outcomes?.[0] || {};
      const courseName = outcome.course_name || "-";
      if (courseName !== "-") uniqueCourses.add(courseName);
    });
    uniqueCourses.forEach(course => {
      const option = document.createElement("option");
      option.value = course;
      option.textContent = course;
      branchFilter.appendChild(option);
    });
    branchFilter.value = "ALL";
  }

  allStudents.forEach((student, index) => {
    const outcome = student.outcomes?.[0] || {};
    const cutoff = student.engineering_cutoff || student.msc_cutoff || student.barch_cutoff || student.bdes_cutoff || "N/A";

    const rowData = [
      index + 1,
      student.name || "-",
      student.application_number || "-",
      cutoff,
      student.phone_number || "-",
      outcome.course_name || "-",
      outcome.course_type || "-",
      student.application_status || "-"
    ];

    const tr = document.createElement("tr");
    tr.dataset.course = outcome.course_name || "-";
    rowData.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  loadSeatTable();
}

function printAllWithUnallocated() {
  const statuses = ["APPROVED", "DECLINED", "WITHDRAWN", "ONHOLD", "UNALLOCATED"];
  const fetchStatus = statuses.map(status =>
    authFetch(`${API_URL}?status=${status}`).then(res => res.json())
  );

  const fetchAll = authFetch(`${API_URL}?status=ALL`).then(res => res.json());

  Promise.all([...fetchStatus, fetchAll])
    .then(results => {
      const allStudents = results.slice(0, 4).flatMap((result, i) =>
        (result.students || []).map(stu => ({
          ...stu,
          application_status: statuses[i]
        }))
      );

      const allFetched = results[4].students || [];
      const knownIds = new Set(allStudents.map(s => s.id));
      const unallocated = allFetched
        .filter(stu => !knownIds.has(stu.id))
        .map(stu => ({ ...stu, application_status: "UNALLOCATED" }));

      const combined = [...allStudents, ...unallocated];

      generateAllStudentTableView(combined);
      openStudentPopup();
    })
    .catch(err => console.error("Failed to print all with unallocated:", err));
}

function openStudentPopup() {
  const popup = document.getElementById("studentPopup");
  if (popup) popup.style.display = "flex";
}

function closeStudentPopup() {
  const popup = document.getElementById("studentPopup");
  if (popup) popup.style.display = "none";
}


// function printAllStudentsTable() {
//   const popupContent = document.getElementById("allStudentTableContainer").innerHTML;

//   const printWindow = window.open('', '', 'height=600,width=800');
//   printWindow.document.write('<html><head><title>TCE - All Students</title>');
//   printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 8px; } button { margin: 10px 0; padding: 6px 12px; font-size: 14px; cursor: pointer; }</style>');
//   printWindow.document.write('</head><body>');
//   printWindow.document.write('<h2 style="text-align:center;">Thiagarajar Group of Institutions: Management Quota Application Dashboard - All Students</h2>');
//   printWindow.document.write('<button id="printBtn">Print Table</button>');
//   printWindow.document.write(popupContent);
//   printWindow.document.write('<script>document.getElementById("printBtn").onclick = function() { window.print(); }<\/script>');
//   printWindow.document.write('</body></html>');
//   printWindow.document.close();
//   printWindow.focus();
// }


function printStudentTable() {
  const popupContent = document.getElementById("studentTableContainer").innerHTML;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>TCE</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 8px; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h2 style="text-align:center;">Thiagarajar Group of Institutions: Management Quota Application Dashboard TCE</h2>');
    printWindow.document.write(`<p style="text-align:center; font-size: 14px; margin: 10px 0;">Downloaded on: ${currentDate}</p>`);
    printWindow.document.write(popupContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function updateButtonVisibility(status) {
  const allottedBtn = document.getElementById("allottedBtn");
  const onholdBtn = document.getElementById("onholdBtn");
  const declinedBtn = document.getElementById("declinedBtn");

  // Default: hide all buttons
  allottedBtn.style.display = "none";
  onholdBtn.style.display = "none";
  declinedBtn.style.display = "none";

  if (status === "APPROVED") {
    allottedBtn.style.display = "inline-block";
  } else if (status === "ONHOLD") {
    onholdBtn.style.display = "inline-block";
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

  // PG course logic
  if (
    ["ME", "M.E", "MTECH", "M.TECH", "ME_MTECH", "ME MTECH", "ME-MTECH", "MEMTECH"].includes(degree)
  ) {
    // M.E/M.Tech
    beCourses.forEach(course => {
      const option = document.createElement("option");
      option.value = course;
      option.textContent = course;
      branchSelect.appendChild(option);
    });
    branchSelect.disabled = false;
    modeSelect.innerHTML = `
      <option value="">-- Select Mode --</option>
      <option value="self-finance">Self-Finance</option>
    `;
    modeSelect.disabled = false;
  } else if (["MCA", "M.C.A"].includes(degree)) {
    // MCA
    const option = document.createElement("option");
    option.value = "MCA";
    option.textContent = "MCA";
    branchSelect.appendChild(option);
    branchSelect.value = "MCA";
    branchSelect.disabled = true;
    modeSelect.innerHTML = `<option value="self-finance" selected>Self-Finance</option>`;
    modeSelect.value = "self-finance";
    modeSelect.disabled = false;
  } else if (["MARCH", "M.ARCH"].includes(degree)) {
    // M.Arch
    const option = document.createElement("option");
    option.value = "M.ARCH";
    option.textContent = "M.ARCH";
    branchSelect.appendChild(option);
    branchSelect.value = "M.ARCH";
    branchSelect.disabled = true;
    modeSelect.innerHTML = `<option value="self-finance" selected>Self-Finance</option>`;
    modeSelect.value = "self-finance";
    modeSelect.disabled = false;
  }
  // ...existing UG/other logic...
  else if (degree === "MSC") {
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
    // ...existing BE logic...
    const branchesToShow = beCourses;
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

function onHoldStudent(onhold_id) {
  const confirmHold = confirm("Are you sure you want to put this student on hold?");
  if (!confirmHold) return;

  const btn = document.querySelector(`#student-${onhold_id} .onhold`);
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Loading...";
  }

  authFetch(UPDATE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: onhold_id,
      status: "ONHOLD"
    })
  })
  .then(res => res.json())
  .then(data => {
    const card = document.getElementById(`student-${onhold_id}`);
    if (card) {
      card.classList.add("decline-shadow"); // or any class for visual effect
      setTimeout(() => card.remove(), 500); // remove card after delay
    }
  })
  .catch(err => {
    console.error("Error putting student on hold:", err);
    alert("Failed to put student on hold");
  })
  .finally(() => {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "On Hold";
    }
  });
}

function withdrawStudent(withdraw_id) {
  const confirmWithdraw = confirm("Are you sure you want to withdraw this student?");
  if (!confirmWithdraw) return;

  const btn = document.querySelector(`#student-${withdraw_id} .withdraw`);
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Loading...";
  }

  authFetch(UPDATE_URL, {
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
        ["Address", student.address],
        ["Aadhar Number", student.aadhar_number],
        ["Parent Annual Income", student.parent_annual_income],
        ["Community", student.community],
        ["Board", student.board],
        ["Year of Passing", student.year_of_passing],
        ["College", student.college],
        ["Degree", student.degree],
        ["Preferred Branch", student.branch_1 || "-"],
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
  authFetch(SEATS_URL)
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

      document.getElementById("seatPopup").style.display = "flex";
    })
    .catch(err => {
      console.error("Error fetching seat data:", err);
      alert("Failed to load seat status.");
    });
    loadSeatTable();
}



function closeSeatPopup() {
  document.getElementById("seatPopup").style.display = "none";
}

window.onload = function() {
  const defaultButton = document.querySelector(".status-buttons button.active");
  loadStatus('APPROVED', defaultButton);
};

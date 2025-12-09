/* -------------------------
   TOGGLE COLLAPSIBLE SECTIONS
   ----------------------------- */
function toggleSection(sectionName) {
  const content = document.getElementById(sectionName + "Content");
  const toggle = document.getElementById(sectionName + "Toggle");

  if (content.classList.contains("expanded")) {
    content.classList.remove("expanded");
    toggle.classList.remove("expanded");
    toggle.textContent = "+";
  } else {
    content.classList.add("expanded");
    toggle.classList.add("expanded");
    toggle.textContent = "+";
  }
}

/* -------------------------
   Initialization
   ------------------------- */
const yearSelect = document.getElementById("year");
const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= currentYear - 5; y--) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearSelect.appendChild(opt);
}

/* Set default month = previous month */
(function setDefaultMonth() {
  const monthSelect = document.getElementById("month");
  const now = new Date();

  let prevMonthIndex = now.getMonth() - 1; // 0 = Jan, 11 = Dec

  if (prevMonthIndex < 0) {
    prevMonthIndex = 11;
    document.getElementById("year").value = now.getFullYear() - 1;
  } else {
    document.getElementById("year").value = now.getFullYear();
  }

  monthSelect.selectedIndex = prevMonthIndex;
})();

/* -------------------------
   Small utilities
   ------------------------- */
function showAlert(message, type = "success") {
  const box = document.getElementById("alertBox");
  box.textContent = message;
  box.className =
    "alert " + (type === "success" ? "alert-success" : "alert-error");
  box.style.display = "block";
  setTimeout(() => {
    box.style.display = "none";
  }, 5000);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// remove special chars from scientist name while typing
document
  .getElementById("scientist_name")
  .addEventListener("input", function () {
    this.value = this.value.replace(/[.,!@#$^&()\-_+=;:'"]/g, "");
  });

// wordcount
document.getElementById("res_highlight").addEventListener("input", function () {
  const text = this.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  document.getElementById("wordCount").textContent = words;
});

/* -------------------------
   FIGURE MODAL + PLACEHOLDERS (MODEL A)
   ------------------------- */
let figures = []; // Stored figures for this user
let figureLocalCounter = 0;

const addFigureBtn = document.getElementById("addFigureBtn");
const figureModal = document.getElementById("figureModal");
const figFileInput = document.getElementById("figFileInput");
const figCaptionInput = document.getElementById("figCaptionInput");
const figPreview = document.getElementById("figPreview");
const figInsertBtn = document.getElementById("figInsertBtn");
const figCancelBtn = document.getElementById("figCancelBtn");
const figureCardList = document.getElementById("figureCardList");
const resHighlightTextarea = document.getElementById("res_highlight");

addFigureBtn.addEventListener("click", () => {
  openFigureModal();
});

function openFigureModal() {
  figFileInput.value = "";
  figCaptionInput.value = "";
  figPreview.src = "";
  figPreview.classList.add("hidden");
  figureModal.classList.remove("hidden");
}

figFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    figPreview.src = evt.target.result;
    figPreview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

figInsertBtn.addEventListener("click", () => {
  const file = figFileInput.files[0];
  const caption = figCaptionInput.value.trim();

  if (!file) {
    showAlert("Please select an image.", "error");
    return;
  }
  if (!caption) {
    showAlert("Please enter a caption.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (evt) {
    const base64 = evt.target.result.split(",")[1];

    figureLocalCounter++;
    const localIndex = figureLocalCounter;
    const placeholder = ` [FIG-${localIndex}]`;

    const figObj = {
      id: "fig_" + Date.now() + "_" + localIndex,
      localIndex,
      caption,
      base64,
      fileName: file.name,
      mimeType: file.type || "image/jpeg",
    };

    figures.push(figObj);

    renderAllFigureCards();
    insertPlaceholderIntoHighlight(placeholder);

    figureModal.classList.add("hidden");
    // showAlert(
    //   "Figure added. Placeholder " + placeholder + " inserted.",
    //   "success"
    // );
  };
  reader.readAsDataURL(file);
});

figCancelBtn.addEventListener("click", () => {
  figureModal.classList.add("hidden");
});

// Render individual card with delete button
function renderFigureCard(fig) {
  const div = document.createElement("div");
  div.className = "fig-card";
  div.innerHTML = `
    <div class="small-text">
      <strong>[FIG-${fig.localIndex}]</strong> — ${fig.caption}
      <button class="fig-delete-btn" onclick="deleteFigure('${fig.id}')">×</button>
    </div>
  `;
  figureCardList.appendChild(div);
}

function renderAllFigureCards() {
  figureCardList.innerHTML = "";
  figures.forEach((fig) => renderFigureCard(fig));
}

// Delete a figure and renumber placeholders
function deleteFigure(id) {
  figures = figures.filter((f) => f.id !== id);

  // Renumber sequentially
  figures.forEach((f, i) => {
    f.localIndex = i + 1;
  });

  figureLocalCounter = figures.length;

  // Re-render all cards
  renderAllFigureCards();

  // Renumber placeholders in textarea
  let text = resHighlightTextarea.value;
  text = text.replace(/\[FIG-\d+\]/g, () => {
    return `[FIG-${++window._tmpIndex}]`;
  });
  window._tmpIndex = 0;
  figures.forEach((f, i) => {
    text = text.replace(`[FIG-${i + 1}]`, `[FIG-${i + 1}]`);
  });
  resHighlightTextarea.value = text;

  //   showAlert("Figure deleted and numbering updated.", "success");
}

function insertPlaceholderIntoHighlight(placeholder) {
  const target = resHighlightTextarea;
  const start = target.selectionStart;
  const end = target.selectionEnd;
  target.value =
    target.value.substring(0, start) +
    placeholder +
    target.value.substring(end);
  target.dispatchEvent(new Event("input"));
}

/* -------------------------
   TABLE ROWS MANAGEMENT
   ------------------------- */
let projectCounter = 0,
  programCounter = 0,
  iprCounter = 0,
  techComCounter = 0,
  pubCounter = 0,
  trainCounter = 0;

function addProjectRow() {
  projectCounter++;
  const tbody = document.getElementById("projectsBody");
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${projectCounter}</td>
    <td><input type="text" placeholder="Title or NA" onchange="checkProjectNA(this)"></td>
    <td>
      <select onchange="handleAgencySelect(this)">
        <option value="">Select Agency</option>
        <option>RKVY</option>
        <option>DST</option>
        <option>DBT</option>
        <option>ANRF</option>
        <option>SERB</option>
        <option>OTHER</option>
      </select>
      <input type="text" class="hidden" placeholder="Specify agency">
    </td>
    <td><input type="date" onchange="updateProjectDuration(this)"></td>
    <td><input type="date" onchange="updateProjectDuration(this)"></td>
    <td><input type="text" placeholder="Auto-calculated"></td>
    <td><input type="number" placeholder="Budget"></td>
    <td><button type="button" class="btn btn-danger" onclick="deleteRow(this)">Delete</button></td>
  `;
}
function handleAgencySelect(sel) {
  const text = sel.nextElementSibling;
  if (sel.value === "OTHER") {
    text.classList.remove("hidden");
    text.required = true;
  } else {
    text.classList.add("hidden");
    text.required = false;
    text.value = "";
  }
}
function checkProjectNA(input) {
  const row = input.closest("tr");
  const inputs = row.querySelectorAll("input, select");
  if (input.value.trim() === "NA") {
    inputs.forEach((el, i) => {
      if (i > 1) el.disabled = true;
    });
  } else inputs.forEach((el) => (el.disabled = false));
}
function updateProjectDuration(input) {
  const row = input.closest("tr");
  const s = row.cells[3].querySelector("input").value;
  const e = row.cells[4].querySelector("input").value;
  row.cells[5].querySelector("input").value = calculateMonthsDuration(s, e);
}

function addProgramRow() {
  programCounter++;
  const tbody = document.getElementById("programsBody");
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${programCounter}</td>
    <td>
      <select onchange="handleProgramSelect(this)">
        <option value="">Select Type</option>
        <option>AICRP AGM</option>
        <option>AINP AGM</option>
        <option>Conference</option>
        <option>Symposium</option>
        <option>OTHER</option>
      </select>
      <input type="text" class="hidden" placeholder="Specify type">
    </td>
    <td><input type="date" onchange="updateProgramDuration(this)"></td>
    <td><input type="date" onchange="updateProgramDuration(this)"></td>
    <td><input type="text" placeholder="Auto-calculated"></td>
    <td><input type="text" placeholder="Venue"></td>
    <td><button type="button" class="btn btn-danger" onclick="deleteRow(this)">Delete</button></td>
  `;
}
function handleProgramSelect(sel) {
  const txt = sel.nextElementSibling;
  if (sel.value === "OTHER") {
    txt.classList.remove("hidden");
    txt.required = true;
  } else {
    txt.classList.add("hidden");
    txt.required = false;
    txt.value = "";
  }
}
function updateProgramDuration(input) {
  const row = input.closest("tr");
  const s = row.cells[2].querySelector("input").value;
  const e = row.cells[3].querySelector("input").value;
  row.cells[4].querySelector("input").value = calculateFullDuration(s, e);
}

function addIPRRow() {
  iprCounter++;
  const tbody = document.getElementById("iprBody");
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${iprCounter}</td>
    <td>
      <select>
        <option value="">Select Type</option>
        <option>Patent</option>
        <option>Copyright</option>
        <option>Trademark</option>
        <option>Design</option>
        <option>GI</option>
      </select>
    </td>
    <td><input type="date"></td>
    <td><input type="text" placeholder="Registration No."></td>
    <td><button type="button" class="btn btn-danger" onclick="deleteRow(this)">Delete</button></td>
  `;
}

function addTechComRow() {
  techComCounter++;
  const tbody = document.getElementById("techComBody");
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${techComCounter}</td>
    <td>
      <select>
        <option value="">Select Head</option>
        <option>Technology</option>
        <option>Varieties</option>
        <option>MoA Signed</option>
      </select>
    </td>
    <td><input type="text" placeholder="Name"></td>
    <td><input type="text" placeholder="Licensee"></td>
    <td><input type="date"></td>
    <td><input type="number" placeholder="License Fee"></td>
    <td><button type="button" class="btn btn-danger" onclick="deleteRow(this)">Delete</button></td>
  `;
}

function addPubRow() {
  pubCounter++;
  const tbody = document.getElementById("pubBody");
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${pubCounter}</td>
    <td><textarea rows="2" placeholder="APA reference"></textarea></td>
    <td><input type="text" placeholder="IF or NA" onchange="updateNAAS(this)"></td>
    <td><input type="text" placeholder="NAAS Rating"></td>
    <td><button type="button" class="btn btn-danger" onclick="deleteRow(this)">Delete</button></td>
  `;
}
function updateNAAS(inp) {
  const row = inp.closest("tr");
  const naas = row.cells[3].querySelector("input");
  const v = inp.value.trim();
  if (v !== "NA" && v !== "" && !isNaN(parseFloat(v))) {
    naas.value = (parseFloat(v) + 6).toFixed(2);
  } else if (v === "NA") {
    naas.value = "";
    naas.readOnly = false;
  }
}

function handleTrainingTypeSelect(sel) {
  const txt = sel.nextElementSibling;
  if (sel.value === "OTHER") {
    txt.classList.remove("hidden");
    txt.required = true;
  } else {
    txt.classList.add("hidden");
    txt.required = false;
    txt.value = "";
  }
}

function addTrainRow() {
  trainCounter++;
  const tbody = document.getElementById("trainBody");
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${trainCounter}</td>
    <td>
      <select onchange="handleTrainingTypeSelect(this)">
        <option value="">Select Training Type</option>
        <option>Summer/Winter School</option>
        <option>Training for Farmers/Government officials/Others</option>
        <option>ICAR-Industry Interface Meetings</option>
        <option>OTHER</option>
      </select>
      <input type="text" class="hidden" placeholder="Specify training type">
    </td>
    <td><input type="text" placeholder="Training name"></td>
    <td>
      <select onchange="handleSponsorSelect(this)">
        <option value="">Select Sponsor</option>
        <option>ICAR</option>
        <option>RKVY</option>
        <option>DST</option>
        <option>DBT</option>
        <option>ANRF</option>
        <option>SERB</option>
        <option>OTHER</option>
      </select>
      <input type="text" class="hidden" placeholder="Specify sponsor">
    </td>
    <td><input type="date" onchange="updateTrainDuration(this)"></td>
    <td><input type="date" onchange="updateTrainDuration(this)"></td>
    <td><input type="text" placeholder="Auto-calculated"></td>
    <td><input type="number" placeholder="No. of participants"></td>
    <td><button type="button" class="btn btn-danger" onclick="deleteRow(this)">Delete</button></td>
  `;
}

function handleSponsorSelect(sel) {
  const t = sel.nextElementSibling;
  if (sel.value === "OTHER") {
    t.classList.remove("hidden");
    t.required = true;
  } else {
    t.classList.add("hidden");
    t.required = false;
    t.value = "";
  }
}
function updateTrainDuration(inp) {
  const row = inp.closest("tr");
  const s = row.cells[4].querySelector("input").value; // start date cell index
  const e = row.cells[5].querySelector("input").value; // end date cell index
  row.cells[6].querySelector("input").value = calculateFullDuration(s, e);
}

function deleteRow(btn) {
  const r = btn.closest("tr");
  r.remove();
}

/* -------------------------
   DURATIONS
   ------------------------- */
function calculateMonthsDuration(start, end) {
  if (!start || !end) return "";

  const s = new Date(start);
  const e = new Date(end);

  if (e < s) return "Invalid dates";

  const diffDays = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays < 30) {
    return diffDays + (diffDays === 1 ? " day" : " days");
  }

  let temp = new Date(s);
  let years = 0,
    months = 0;

  while (true) {
    const next = new Date(temp);
    next.setFullYear(next.getFullYear() + 1);
    if (next <= e) {
      years++;
      temp = next;
    } else break;
  }

  while (true) {
    const next = new Date(temp);
    next.setMonth(next.getMonth() + 1);
    if (next <= e) {
      months++;
      temp = next;
    } else break;
  }

  const remainingDays = Math.floor((e - temp) / (1000 * 60 * 60 * 24)) + 1;

  const parts = [];
  if (years > 0) parts.push(years + (years === 1 ? " year" : " years"));
  if (months > 0) parts.push(months + (months === 1 ? " month" : " months"));
  if (remainingDays > 0)
    parts.push(remainingDays + (remainingDays === 1 ? " day" : " days"));

  return parts.join(", ");
}

function calculateFullDuration(start, end) {
  if (!start || !end) return "";

  const s = new Date(start);
  const e = new Date(end);

  if (e < s) return "Invalid dates";

  let temp = new Date(s);
  let years = 0,
    months = 0;

  while (true) {
    let next = new Date(temp);
    next.setFullYear(next.getFullYear() + 1);

    if (next <= e) {
      years++;
      temp = next;
    } else break;
  }

  while (true) {
    let next = new Date(temp);
    next.setMonth(next.getMonth() + 1);

    if (next <= e) {
      months++;
      temp = next;
    } else break;
  }

  let remainingDays = Math.floor((e - temp) / (1000 * 60 * 60 * 24)) + 1;

  const parts = [];
  if (years > 0) parts.push(years + (years === 1 ? " year" : " years"));
  if (months > 0) parts.push(months + (months === 1 ? " month" : " months"));
  if (remainingDays > 0)
    parts.push(remainingDays + (remainingDays === 1 ? " day" : " days"));

  return parts.join(", ");
}

/* -------------------------
   DRAFT SAVE / RESTORE / CLEAR
   ------------------------- */
const DRAFT_KEY = "scientist_draft_v1";

document.getElementById("saveDraftBtn").addEventListener("click", saveDraft);
document.getElementById("clearDraftBtn").addEventListener("click", clearDraft);

async function saveDraft() {
  try {
    const draft = await collectDraftData();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    showAlert("✔ Draft saved successfully! You can continue later.", "success");
  } catch (err) {
    console.error("Save draft error:", err);
    showAlert("❌ Error saving draft: " + (err.message || err), "error");
  }
}

function clearDraft() {
  if (!confirm("Clear saved draft from this browser?")) return;
  localStorage.removeItem(DRAFT_KEY);
  resetForm(false);
  showAlert("✔ Draft cleared.", "success");
}

async function collectDraftData() {
  const tables = {
    projects: getTableData("projectsBody"),
    programs: getTableData("programsBody"),
    ipr: getTableData("iprBody"),
    tech_com: getTableData("techComBody"),
    publications: getTableData("pubBody"),
    training: getTableData("trainBody"),
  };

  return {
    smd_name: document.getElementById("smd_name").value || "",
    institute_name: document.getElementById("institute_name").value || "",
    scientist_name: document.getElementById("scientist_name").value || "",
    month: document.getElementById("month").value || "",
    year: document.getElementById("year").value || "",
    h_ind_google: document.getElementById("h_ind_google").value || "",
    h_ind_res_gate: document.getElementById("h_ind_res_gate").value || "",
    num_cit_google: document.getElementById("num_cit_google").value || "",
    num_cit_res_gate: document.getElementById("num_cit_res_gate").value || "",
    res_highlight: document.getElementById("res_highlight").value || "",
    tables: tables,
    figures: figures || [],
    saved_at: new Date().toISOString(),
  };
}

window.addEventListener("load", async function () {
  const d = localStorage.getItem(DRAFT_KEY);
  initializeTables();
  if (d) {
    try {
      const parsed = JSON.parse(d);
      await restoreDraft(parsed);
      showAlert("✔ Draft loaded successfully.", "success");
    } catch (err) {
      console.error("Restore draft error:", err);
    }
  }
});

async function restoreDraft(data) {
  if (!data) return;
  document.getElementById("smd_name").value = data.smd_name || "CROP SCIENCE";
  document.getElementById("institute_name").value =
    data.institute_name || "IIAB";
  document.getElementById("scientist_name").value = data.scientist_name || "";
  document.getElementById("month").value = data.month || "";
  document.getElementById("year").value = data.year || "";
  document.getElementById("h_ind_google").value = data.h_ind_google || "";
  document.getElementById("h_ind_res_gate").value = data.h_ind_res_gate || "";
  document.getElementById("num_cit_google").value = data.num_cit_google || "";
  document.getElementById("num_cit_res_gate").value =
    data.num_cit_res_gate || "";
  document.getElementById("res_highlight").value = data.res_highlight || "";
  document.getElementById("wordCount").textContent = data.res_highlight
    ? data.res_highlight.trim().split(/\s+/).length
    : 0;

  document.getElementById("projectsBody").innerHTML = "";
  document.getElementById("programsBody").innerHTML = "";
  document.getElementById("iprBody").innerHTML = "";
  document.getElementById("techComBody").innerHTML = "";
  document.getElementById("pubBody").innerHTML = "";
  document.getElementById("trainBody").innerHTML = "";
  projectCounter =
    programCounter =
    iprCounter =
    techComCounter =
    pubCounter =
    trainCounter =
      0;

  restoreTableRows(data.tables.projects || [], addProjectRow, "projectsBody");
  restoreTableRows(data.tables.programs || [], addProgramRow, "programsBody");
  restoreTableRows(data.tables.ipr || [], addIPRRow, "iprBody");
  restoreTableRows(data.tables.tech_com || [], addTechComRow, "techComBody");
  restoreTableRows(data.tables.publications || [], addPubRow, "pubBody");
  restoreTableRows(data.tables.training || [], addTrainRow, "trainBody");

  figures = Array.isArray(data.figures) ? data.figures : [];
  figureLocalCounter = figures.reduce(
    (max, f) => Math.max(max, f.localIndex || 0),
    0
  );
  renderAllFigureCards();
}

function restoreTableRows(rows, addFn, tbodyId) {
  rows.forEach((rowData) => {
    addFn();
    const tbody = document.getElementById(tbodyId);
    const lastRow = tbody.lastElementChild;
    const inputs = lastRow.querySelectorAll("input, select, textarea");
    let i = 1;
    for (const key in rowData) {
      if (key.startsWith("col_")) {
        const val = rowData[key] || "";
        const target = inputs[i - 1];
        if (target) target.value = val;
        i++;
      }
    }
  });
}

function getTableData(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const data = [];
  rows.forEach((row) => {
    const rowData = {};
    const cells = row.cells;
    let hasData = false;
    for (let i = 1; i < cells.length - 1; i++) {
      const inputs = cells[i].querySelectorAll("input, select, textarea");
      if (inputs.length === 1) {
        const v = inputs[0].value || "";
        rowData[`col_${i}`] = v;
        if (v.trim() !== "") hasData = true;
      } else if (inputs.length > 1) {
        const sel = cells[i].querySelector("select");
        const txt = cells[i].querySelector('input[type="text"]');
        if (txt && !txt.classList.contains("hidden")) {
          const v = txt.value || "";
          rowData[`col_${i}`] = v;
          if (v.trim() !== "") hasData = true;
        } else if (sel && sel.value) {
          rowData[`col_${i}`] = sel.value;
          hasData = true;
        } else rowData[`col_${i}`] = "";
      } else {
        rowData[`col_${i}`] = "";
      }
    }
    if (hasData) {
      rowData["col_0"] = cells[0].textContent;
      data.push(rowData);
    }
  });
  return data;
}

/* -------------------------
   FORM SUBMISSION
   ------------------------- */
document
  .getElementById("scientistForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const submitBtn = document.getElementById("submitBtn");

    if (!document.getElementById("scientist_name").value.trim()) {
      showAlert("Please enter scientist name", "error");
      return;
    }

    const text = document.getElementById("res_highlight").value.trim();
    const wc = text ? text.split(/\s+/).length : 0;
    if (wc < 1 || wc > 500) {
      showAlert(
        "Research highlight must be between 300-500 words. Current: " +
          wc +
          " words.",
        "error"
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ Uploading... Please wait";

    try {
      const images = (figures || []).map((f) => ({
        name: f.fileName,
        type: f.mimeType,
        data: f.base64,
        caption: f.caption,
        localIndex: f.localIndex,
      }));

      const payload = {
        smd_name: document.getElementById("smd_name").value || "",
        institute_name_short:
          "ICAR-" +
          (document.getElementById("institute_name").value || "").toUpperCase(),
        scientist_name: document.getElementById("scientist_name").value || "",
        month: document.getElementById("month").value || "",
        year: document.getElementById("year").value || "",
        h_ind_google: document.getElementById("h_ind_google").value || "",
        h_ind_res_gate: document.getElementById("h_ind_res_gate").value || "",
        num_cit_google: document.getElementById("num_cit_google").value || "",
        num_cit_res_gate:
          document.getElementById("num_cit_res_gate").value || "",
        projects: capitalizeTableData(getTableData("projectsBody")),
        programs: capitalizeTableData(getTableData("programsBody")),
        ipr: capitalizeTableData(getTableData("iprBody")),
        tech_com: capitalizeTableData(getTableData("techComBody")),
        publications: getTableData("pubBody"),
        training: capitalizeTableData(getTableData("trainBody")),
        res_highlight: document.getElementById("res_highlight").value || "",
        images: images,
        submission_timestamp: new Date().toISOString(),
      };

      function capitalizeTableData(tableData) {
        return tableData.map((row) => {
          const capitalizedRow = {};
          for (const key in row) {
            if (typeof row[key] === "string") {
              capitalizedRow[key] = row[key];
            } else {
              capitalizedRow[key] = row[key];
            }
          }
          return capitalizedRow;
        });
      }

      console.log("Payload ready:", payload);

      const SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbxSxyFgSzwgiRiDQQj8uk6DTabsJc8NArZ7kHfg4kMMJXYHsYqCVFDS2V8nCGbeyHlrbA/exec";

      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });

      showAlert("Data submitted successfully!", "success");
      localStorage.removeItem(DRAFT_KEY);

      /* ADD TEMP DOWNLOAD BUTTON */
      const dlBtn = document.createElement("button");
      dlBtn.textContent = "Download Submitted Report";
      dlBtn.className = "btn btn-secondary";
      dlBtn.style.marginTop = "12px";
      dlBtn.style.display = "block";
      document.getElementById("alertBox").after(dlBtn);

      dlBtn.addEventListener("click", async () => {
        const zip = new JSZip();

        /* ------------ 1) ADD JSON ------------ */
        const jsonData = JSON.stringify(payload, null, 2);
        zip.file(
          `Scientist_Report_${payload.scientist_name}_${payload.month}_${payload.year}.json`,
          jsonData
        );

        /* ------------ 2) GENERATE PDF ------------ */
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: "pt", format: "a4" });

        let y = 40;
        const spacing = 18;
        const pageHeight = pdf.internal.pageSize.height;

        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text(
          `Monthly Report of ${payload.scientist_name} (${payload.month}, ${payload.year})`,
          40,
          y
        );
        y += 30;

        /* Basic Info */
        pdf.setFont("Helvetica", "normal");
        pdf.setFontSize(12);
        const info = [
          `Scientist: ${payload.scientist_name}`,
          `Institute: ${payload.institute_name_short}`,
          `Month: ${payload.month}`,
          `Year: ${payload.year}`,
          `Google Scholar H-index: ${payload.h_ind_google}`,
          `ResearchGate H-index: ${payload.h_ind_res_gate}`,
          `Google Scholar Citations: ${payload.num_cit_google}`,
          `ResearchGate Citations: ${payload.num_cit_res_gate}`,
        ];
        info.forEach((t) => {
          pdf.text(t, 40, y);
          y += spacing;
        });
        y += 20;

        function addSection(title, data) {
          if (!data || data.length === 0) return;

          pdf.setFont("Helvetica", "bold");
          pdf.setFontSize(14);

          if (y > pageHeight - 50) {
            pdf.addPage();
            y = 40;
          }

          pdf.text(title, 40, y);
          y += 25;

          pdf.setFont("Helvetica", "normal");
          pdf.setFontSize(11);

          data.forEach((row, idx) => {
            if (y > pageHeight - 60) {
              pdf.addPage();
              y = 40;
            }

            pdf.text(`${idx + 1}.`, 40, y);

            const text = Object.keys(row)
              .filter((k) => k !== "col_0" && row[k].trim() !== "")
              .map((k) => row[k])
              .join("; ");

            const wrapped = pdf.splitTextToSize(text, 500);

            wrapped.forEach((w) => {
              if (y > pageHeight - 50) {
                pdf.addPage();
                y = 40;
              }
              pdf.text(w, 60, y);
              y += spacing;
            });

            y += 5;
          });

          y += 20;
        }

        /* Add all tables */
        addSection("Externally Funded Projects", payload.projects);
        addSection("Programs Organized", payload.programs);
        addSection("IPR Generated", payload.ipr);
        addSection("Technology Commercialization", payload.tech_com);
        addSection("Publications", payload.publications);
        addSection("Training Conducted", payload.training);

        /* Research Highlight */
        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("Significant Research Findings", 40, y);
        y += 25;

        pdf.setFont("Helvetica", "normal");
        const rhText = pdf.splitTextToSize(payload.res_highlight, 520);
        rhText.forEach((line) => {
          if (y > pageHeight - 50) {
            pdf.addPage();
            y = 40;
          }
          pdf.text(line, 40, y);
          y += spacing;
        });
        y += 20;

        /* ------------ ADD IMAGES ------------ */
        if (payload.images && payload.images.length > 0) {
          pdf.setFont("Helvetica", "bold");
          pdf.setFontSize(14);
          pdf.text("Figures Uploaded", 40, y);
          y += 30;

          for (let i = 0; i < payload.images.length; i++) {
            const img = payload.images[i];
            const imgData = `data:${img.type};base64,${img.data}`;

            const temp = new Image();
            temp.src = imgData;

            await new Promise((resolve) => {
              temp.onload = () => {
                const maxW = 450,
                  maxH = 300;
                let w = temp.width,
                  h = temp.height;

                const scale = Math.min(maxW / w, maxH / h, 1);
                w *= scale;
                h *= scale;

                if (y + h + 60 > pageHeight) {
                  pdf.addPage();
                  y = 40;
                }

                pdf.addImage(imgData, "JPEG", 40, y, w, h);
                y += h + 10;
                const captionText =
                  img.caption && img.caption.trim().length
                    ? img.caption
                    : img.name;
                pdf.text(`Figure ${i + 1}: ${captionText}`, 40, y);
                y += 30;

                resolve();
              };
            });
          }
        }

        /* Convert PDF to Blob and add to ZIP */
        const pdfBlob = pdf.output("blob");
        const pdfName = `Scientist_Report_${payload.scientist_name}_${payload.month}_${payload.year}.pdf`;
        zip.file(pdfName, pdfBlob);

        /* ------------ 3) GENERATE ZIP ------------ */
        const zipBlob = await zip.generateAsync({ type: "blob" });

        const zipName = `Scientist_Report_${payload.scientist_name}_${payload.month}_${payload.year}.zip`;

        const a = document.createElement("a");
        a.href = URL.createObjectURL(zipBlob);
        a.download = zipName;
        a.click();

        dlBtn.remove();
        resetForm(true);
      });
    } catch (err) {
      console.error("Submit error:", err);
      showAlert("❌ Submission error: " + (err.message || err), "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });

function resetForm(clearDraftReset = false) {
  if (clearDraftReset) localStorage.removeItem(DRAFT_KEY);
  document.getElementById("scientistForm").reset();
  document.getElementById("projectsBody").innerHTML = "";
  document.getElementById("programsBody").innerHTML = "";
  document.getElementById("iprBody").innerHTML = "";
  document.getElementById("techComBody").innerHTML = "";
  document.getElementById("pubBody").innerHTML = "";
  document.getElementById("trainBody").innerHTML = "";
  projectCounter =
    programCounter =
    iprCounter =
    techComCounter =
    pubCounter =
    trainCounter =
      0;

  figures = [];
  figureLocalCounter = 0;
  renderAllFigureCards();

  document.getElementById("wordCount").textContent = "0";

  ["projects", "programs", "ipr", "techCom", "pub", "train"].forEach((name) => {
    const content = document.getElementById(name + "Content");
    const toggle = document.getElementById(name + "Toggle");
    content.classList.remove("expanded");
    toggle.classList.remove("expanded");
    toggle.textContent = "+";
  });

  initializeTables();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initializeTables() {
  if (!document.getElementById("projectsBody").querySelectorAll("tr").length)
    addProjectRow();
  if (!document.getElementById("programsBody").querySelectorAll("tr").length)
    addProgramRow();
  if (!document.getElementById("iprBody").querySelectorAll("tr").length)
    addIPRRow();
  if (!document.getElementById("techComBody").querySelectorAll("tr").length)
    addTechComRow();
  if (!document.getElementById("pubBody").querySelectorAll("tr").length)
    addPubRow();
  if (!document.getElementById("trainBody").querySelectorAll("tr").length)
    addTrainRow();
}

initializeTables();

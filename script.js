/* ========================================================
   TOGGLE COLLAPSIBLE SECTIONS
   ======================================================== */
function toggleSection(name) {
  const content = document.getElementById(name + "Content");
  const toggle = document.getElementById(name + "Toggle");
  if (content.classList.contains("expanded")) {
    content.classList.remove("expanded");
    toggle.textContent = "+";
  } else {
    content.classList.add("expanded");
    toggle.textContent = "\u00D7";
  }
}

/* Sync all toggle icons to match current expanded state */
function syncToggleIcons() {
  ["projects", "programs", "ipr", "techCom", "pub", "train", "ham"].forEach(
    function (name) {
      var content = document.getElementById(name + "Content");
      var toggle = document.getElementById(name + "Toggle");
      if (!content || !toggle) return;
      toggle.textContent = content.classList.contains("expanded")
        ? "\u00D7"
        : "+";
    },
  );
}

/* ========================================================
   PERIOD / YEAR SELECTS
   ======================================================== */
const yearSelect = document.getElementById("year");
const periodSelect = document.getElementById("period");
const cautionEl = document.getElementById("dynamicCaution");
const currentYear = new Date().getFullYear();

for (let y = currentYear; y >= currentYear - 5; y--) {
  const o = document.createElement("option");
  o.value = y;
  o.textContent = y;
  yearSelect.appendChild(o);
}
yearSelect.disabled = true;

function populatePeriods() {
  const now = new Date();
  const ci = now.getMonth();
  const cy = now.getFullYear();
  periodSelect.innerHTML = "";
  for (let i = 0; i < 2; i++) {
    const d = new Date(cy, ci - i, 1);
    const mn = d.toLocaleString("default", { month: "long" });
    const yr = d.getFullYear();
    const o = document.createElement("option");
    o.value = `${mn}|${yr}`;
    o.textContent = `${mn} ${yr}`;
    periodSelect.appendChild(o);
  }
}
function getSelectedPeriodInfo() {
  if (!periodSelect.value)
    return { periodMonth: "", periodYear: "", periodRange: "" };
  const [mn, ys] = periodSelect.value.split("|");
  const yr = Number(ys);
  const mi = new Date(`${mn} 1, ${yr}`).getMonth();
  const sd = new Date(yr, mi - 1, 15);
  const sl = `15 ${sd.toLocaleString("default", { month: "long" })} ${sd.getFullYear()}`;
  const el = `15 ${mn} ${yr}`;
  return { periodMonth: mn, periodYear: yr, periodRange: `${sl} – ${el}` };
}
function updatePeriodWarning() {
  const p = getSelectedPeriodInfo();
  cautionEl.textContent = `⚠️ Input should be provided for ${p.periodRange} only`;
  yearSelect.value = p.periodYear;
}
periodSelect.addEventListener("change", updatePeriodWarning);

/* ========================================================
   ALERTS
   ======================================================== */
function showAlert(msg, type = "success") {
  const box = document.getElementById("alertBox");
  box.textContent = msg;
  box.className =
    "alert " + (type === "success" ? "alert-success" : "alert-error");
  box.style.display = "block";
  setTimeout(() => {
    box.style.display = "none";
  }, 6000);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ========================================================
   RICH TEXT EDITOR HELPERS
   ======================================================== */
function rteExec(editorId, cmd) {
  const el = document.getElementById(editorId);
  el.focus();
  document.execCommand(cmd, false, null);
}

function rteGetHtml(editorId) {
  const el = document.getElementById(editorId);
  return el ? el.innerHTML : "";
}
function rteGetText(editorId) {
  const el = document.getElementById(editorId);
  return el ? el.innerText || el.textContent : "";
}
function rteSetHtml(editorId, html) {
  const el = document.getElementById(editorId);
  if (el) el.innerHTML = html || "";
}

/* --------------------------------------------------------
   PASTE CLEANER — strips all Word/Outlook/browser span markup
   and preserves only plain text on paste into any RTE editor.
   Users apply their own bold/italic/etc. via the toolbar.
   -------------------------------------------------------- */
function handleRtePaste(e) {
  e.preventDefault();
  var text = "";
  if (e.clipboardData && e.clipboardData.getData) {
    text = e.clipboardData.getData("text/plain") || "";
  } else if (window.clipboardData && window.clipboardData.getData) {
    text = window.clipboardData.getData("Text") || "";
  }
  // Insert as plain text at cursor position
  if (document.queryCommandSupported("insertText")) {
    document.execCommand("insertText", false, text);
  } else {
    var sel = window.getSelection();
    if (sel && sel.rangeCount) {
      var range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
    }
  }
}

/* Attach paste cleaner to the main research highlight editor */
document
  .getElementById("res_highlight_editor")
  .addEventListener("paste", handleRtePaste);

/* Word count for research highlight */
document
  .getElementById("res_highlight_editor")
  .addEventListener("input", function () {
    const text = this.innerText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    document.getElementById("wordCount").textContent = words;
    document.getElementById("res_highlight").value = text;
  });

/* ========================================================
   NIL TOGGLE HELPERS
   ======================================================== */
function toggleNilText(field, mode) {
  const inputDiv = document.getElementById(field + "_input");
  const hiddenEl = document.getElementById(field + "_val");
  if (mode === "NIL") {
    inputDiv.classList.remove("nil-visible");
    inputDiv.classList.add("nil-hidden");
    if (hiddenEl) hiddenEl.value = "NIL";
  } else {
    inputDiv.classList.remove("nil-hidden");
    inputDiv.classList.add("nil-visible");
    if (hiddenEl) hiddenEl.value = "";
  }
}
function toggleRteNil(field, mode) {
  const inputDiv = document.getElementById(field + "_input");
  const hiddenEl = document.getElementById(field + "_val");
  if (mode === "NIL") {
    inputDiv.classList.remove("nil-visible");
    inputDiv.classList.add("nil-hidden");
    if (hiddenEl) hiddenEl.value = "NIL";
  } else {
    inputDiv.classList.remove("nil-hidden");
    inputDiv.classList.add("nil-visible");
    if (hiddenEl) hiddenEl.value = "";
  }
}
function toggleHamTable(mode) {
  document.getElementById("hamTableArea").style.display =
    mode === "data" ? "block" : "none";
}

function getNilOrValue(field, useHtml) {
  const radios = document.querySelectorAll(`input[name="${field}_status"]`);
  let isNil = true;
  radios.forEach((r) => {
    if (r.checked && r.value !== "NIL" && r.value !== "NA") isNil = false;
  });
  if (isNil) return "NIL";
  const editorId = field + "_editor";
  const inputId = field;
  const editorEl = document.getElementById(editorId);
  if (editorEl)
    return useHtml
      ? editorEl.innerHTML
      : editorEl.innerText || editorEl.textContent;
  const inputEl = document.getElementById(inputId);
  return inputEl ? inputEl.value : "";
}

/* ========================================================
   BREAKTHROUGHS SUBSECTION TOGGLES + PER-SUBSECTION FIGURES
   ======================================================== */
function bktSubToggle(field, mode) {
  const inputDiv = document.getElementById(field + "_input");
  if (!inputDiv) return;
  if (mode === "NIL") {
    inputDiv.classList.remove("nil-visible");
    inputDiv.classList.add("nil-hidden");
  } else {
    inputDiv.classList.remove("nil-hidden");
    inputDiv.classList.add("nil-visible");
    // Attach paste cleaner once
    const ed = document.getElementById(field + "_editor");
    if (ed && !ed._pasteCleaned) {
      ed.addEventListener("paste", handleRtePaste);
      ed._pasteCleaned = true;
    }
  }
}

function bktMasterToggle(mode) {
  [1, 2, 3, 4, 5].forEach(function (i) {
    const radios = document.querySelectorAll(
      'input[name="bkt_' + i + '_status"]',
    );
    radios.forEach(function (r) {
      r.checked = r.value === mode;
    });
    bktSubToggle("bkt_" + i, mode);
  });
}

var bktFigures = { bkt_1: [], bkt_2: [], bkt_3: [], bkt_4: [], bkt_5: [] };
var bktFigCounters = { bkt_1: 0, bkt_2: 0, bkt_3: 0, bkt_4: 0, bkt_5: 0 };
var _activeBktSection = null;

document
  .getElementById("bktFigFileInput")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = function (evt) {
      const prev = document.getElementById("bktFigPreview");
      prev.src = evt.target.result;
      prev.classList.remove("hidden");
    };
    r.readAsDataURL(file);
  });

document
  .getElementById("bktFigInsertBtn")
  .addEventListener("click", function () {
    const file = document.getElementById("bktFigFileInput").files[0];
    const bktCapEd = document.getElementById("bktFigCaptionEditor");
    const caption = bktCapEd
      ? (bktCapEd.innerText || bktCapEd.textContent || "").trim()
      : "";
    const captionHtml = bktCapEd ? bktCapEd.innerHTML.trim() : "";
    const sec = _activeBktSection;
    if (!file) {
      showAlert("Please select an image.", "error");
      return;
    }
    if (!caption) {
      showAlert("Please enter a caption.", "error");
      return;
    }
    if (!sec) return;
    const r = new FileReader();
    r.onload = function (evt) {
      const base64 = evt.target.result.split(",")[1];
      bktFigCounters[sec]++;
      const localIndex = bktFigCounters[sec];
      bktFigures[sec].push({
        id: "bktfig_" + sec + "_" + Date.now() + "_" + localIndex,
        localIndex,
        caption,
        captionHtml,
        base64,
        fileName: file.name,
        mimeType: file.type || "image/jpeg",
        section: sec,
      });
      renderBktFigCards(sec);
      bktInsertFigPlaceholder(sec, localIndex);
      document.getElementById("bktFigureModal").classList.add("hidden");
      _activeBktSection = null;
    };
    r.readAsDataURL(file);
  });

document
  .getElementById("bktFigCancelBtn")
  .addEventListener("click", function () {
    document.getElementById("bktFigureModal").classList.add("hidden");
    _activeBktSection = null;
  });

function openBktFigModal(sec) {
  _activeBktSection = sec;
  document.getElementById("bktFigFileInput").value = "";
  const bktCapClr = document.getElementById("bktFigCaptionEditor");
  if (bktCapClr) bktCapClr.innerHTML = "";
  const prev = document.getElementById("bktFigPreview");
  prev.src = "";
  prev.classList.add("hidden");
  document.getElementById("bktFigureModal").classList.remove("hidden");
}

function bktInsertFigPlaceholder(sec, idx) {
  const editor = document.getElementById(sec + "_editor");
  if (!editor) return;
  const count = idx || bktFigCounters[sec];
  const placeholder = " [FIG-" + count + "]";
  editor.focus();
  const sel = window.getSelection();
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(placeholder));
    range.collapse(false);
  } else {
    editor.innerHTML += placeholder;
  }
}

function renderBktFigCards(sec) {
  const container = document.getElementById(sec + "_figcards");
  if (!container) return;
  container.innerHTML = "";
  (bktFigures[sec] || []).forEach(function (fig) {
    const div = document.createElement("div");
    div.className = "fig-card";
    div.innerHTML =
      '<div class="small-text"><span><strong>[FIG-' +
      fig.localIndex +
      "]</strong> — " +
      fig.caption +
      "</span>" +
      '<button class="fig-delete-btn" onclick="deleteBktFigure(\'' +
      sec +
      "','" +
      fig.id +
      "')\">x Remove</button></div>";
    container.appendChild(div);
  });
}

function deleteBktFigure(sec, id) {
  bktFigures[sec] = (bktFigures[sec] || []).filter(function (f) {
    return f.id !== id;
  });
  bktFigures[sec].forEach(function (f, i) {
    f.localIndex = i + 1;
  });
  bktFigCounters[sec] = bktFigures[sec].length;
  renderBktFigCards(sec);
}

function getBreakthroughsPayload() {
  var result = {};
  var allNil = true;
  [1, 2, 3, 4, 5].forEach(function (i) {
    const radio = document.querySelector(
      'input[name="bkt_' + i + '_status"]:checked',
    );
    const isNil = !radio || radio.value === "NIL";
    if (!isNil) allNil = false;
    const editor = document.getElementById("bkt_" + i + "_editor");
    result["sub_" + i] = isNil
      ? "NIL"
      : (editor ? (editor.innerText || "").trim() : "") || "NIL";
    result["sub_" + i + "_html"] = isNil
      ? "NIL"
      : editor
        ? editor.innerHTML
        : "NIL";
    result["sub_" + i + "_figs"] = isNil ? [] : bktFigures["bkt_" + i] || [];
  });
  result.all_nil = allNil;
  result.combined = allNil
    ? "NIL"
    : [
        "I. " + result.sub_1,
        "II. " + result.sub_2,
        "III. " + result.sub_3,
        "IV. " + result.sub_4,
        "V. " + result.sub_5,
      ].join("\n\n");
  return result;
}

/* ========================================================
   SECTION 13 - BULLET LIST
   ======================================================== */
function natAgriToggle(mode) {
  const inputDiv = document.getElementById("nat_agri_input");
  const hidden = document.getElementById("nat_agri_val");
  if (mode === "NIL") {
    inputDiv.classList.remove("nil-visible");
    inputDiv.classList.add("nil-hidden");
    if (hidden) hidden.value = "NIL";
  } else {
    inputDiv.classList.remove("nil-hidden");
    inputDiv.classList.add("nil-visible");
    if (hidden) hidden.value = "";
    const list = document.getElementById("nat_agri_bullets");
    if (list && !list.querySelectorAll(".bullet-item").length) addBulletPoint();
  }
}

function addBulletPoint(value) {
  const list = document.getElementById("nat_agri_bullets");
  const item = document.createElement("div");
  item.className = "bullet-item";
  item.innerHTML =
    '<span class="bullet-dot">&#8226;</span>' +
    '<textarea class="bullet-input" rows="1" placeholder="Enter bullet point...">' +
    (value || "") +
    "</textarea>" +
    '<button type="button" class="bullet-del" onclick="removeBullet(this)">x</button>';
  const ta = item.querySelector("textarea");
  ta.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });
  ta.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addBulletPoint();
      const items = list.querySelectorAll(".bullet-input");
      items[items.length - 1].focus();
    }
  });
  list.appendChild(item);
  if (document.activeElement !== ta) ta.focus();
}

function removeBullet(btn) {
  const list = document.getElementById("nat_agri_bullets");
  const item = btn.closest(".bullet-item");
  if (list.querySelectorAll(".bullet-item").length > 1) {
    item.remove();
  } else {
    item.querySelector("textarea").value = "";
  }
}

function getBulletPoints() {
  const radio = document.querySelector('input[name="nat_agri_status"]:checked');
  if (!radio || radio.value === "NIL") return "NIL";
  const list = document.getElementById("nat_agri_bullets");
  if (!list) return "NIL";
  const items = Array.from(list.querySelectorAll(".bullet-input"))
    .map(function (ta) {
      return ta.value.trim();
    })
    .filter(function (v) {
      return v !== "";
    });
  return items.length
    ? items
        .map(function (t) {
          return "• " + t;
        })
        .join("\n")
    : "NIL";
}

let figures = [];
let figureLocalCounter = 0;

const addFigureBtn = document.getElementById("addFigureBtn");
const figureModal = document.getElementById("figureModal");
const figFileInput = document.getElementById("figFileInput");
const figPreview = document.getElementById("figPreview");
const figInsertBtn = document.getElementById("figInsertBtn");
const figCancelBtn = document.getElementById("figCancelBtn");
const figureCardList = document.getElementById("figureCardList");

addFigureBtn.addEventListener("click", () => {
  figFileInput.value = "";
  const figCapEd = document.getElementById("figCaptionEditor");
  if (figCapEd) figCapEd.innerHTML = "";
  figPreview.src = "";
  figPreview.classList.add("hidden");
  figureModal.classList.remove("hidden");
});
figFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = (evt) => {
    figPreview.src = evt.target.result;
    figPreview.classList.remove("hidden");
  };
  r.readAsDataURL(file);
});
figInsertBtn.addEventListener("click", () => {
  const file = figFileInput.files[0];
  const figCapEd2 = document.getElementById("figCaptionEditor");
  const captionHtml = figCapEd2 ? figCapEd2.innerHTML.trim() : "";
  const captionText = figCapEd2
    ? (figCapEd2.innerText || figCapEd2.textContent || "").trim()
    : "";
  if (!file) {
    showAlert("Please select an image.", "error");
    return;
  }
  if (!captionText) {
    showAlert("Please enter a caption.", "error");
    return;
  }
  const r = new FileReader();
  r.onload = (evt) => {
    const base64 = evt.target.result.split(",")[1];
    figureLocalCounter++;
    const localIndex = figureLocalCounter;
    figures.push({
      id: "fig_" + Date.now() + "_" + localIndex,
      localIndex,
      caption: captionText,
      captionHtml: captionHtml,
      base64,
      fileName: file.name,
      mimeType: file.type || "image/jpeg",
    });
    renderAllFigureCards();
    insertFigPlaceholder(localIndex);
    figureModal.classList.add("hidden");
  };
  r.readAsDataURL(file);
});
figCancelBtn.addEventListener("click", () =>
  figureModal.classList.add("hidden"),
);

function insertFigPlaceholder(idx) {
  const editor = document.getElementById("res_highlight_editor");
  const placeholder = ` [FIG-${idx || figureLocalCounter}]`;
  editor.focus();
  const sel = window.getSelection();
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(placeholder));
    range.collapse(false);
  } else {
    editor.innerHTML += placeholder;
  }
  editor.dispatchEvent(new Event("input"));
}

function renderFigureCard(fig) {
  const div = document.createElement("div");
  div.className = "fig-card";
  const capDisplay = fig.captionHtml || fig.caption || "";
  div.innerHTML =
    '<div class="small-text"><span><strong>[FIG-' +
    fig.localIndex +
    ']</strong> — <span class="fig-cap-preview">' +
    capDisplay +
    '</span></span><button class="fig-delete-btn" onclick="deleteFigure(\'' +
    fig.id +
    "')\">× Remove</button></div>";
  figureCardList.appendChild(div);
}
function renderAllFigureCards() {
  figureCardList.innerHTML = "";
  figures.forEach((f) => renderFigureCard(f));
}
function deleteFigure(id) {
  figures = figures.filter((f) => f.id !== id);
  figures.forEach((f, i) => {
    f.localIndex = i + 1;
  });
  figureLocalCounter = figures.length;
  renderAllFigureCards();
}

/* ========================================================
   TABLE ROW COUNTERS
   ======================================================== */
let projectCounter = 0,
  programCounter = 0,
  iprCounter = 0,
  techComCounter = 0,
  pubCounter = 0,
  trainCounter = 0,
  hamCounter = 0;

/* ========================================================
   PROJECT ROWS
   ======================================================== */
function addProjectRow() {
  projectCounter++;
  const tbody = document.getElementById("projectsBody");
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${projectCounter}</td>
    <td><input type="text" placeholder="Title or NIL" onchange="checkProjectNA(this)"></td>
    <td>
      <select onchange="handleAgencySelect(this)">
        <option value="">Select Agency</option>
        <option>RKVY</option><option>DST</option><option>DBT</option>
        <option>ANRF</option><option>SERB</option><option>OTHER</option>
      </select>
      <input type="text" class="hidden" placeholder="Specify agency">
    </td>
    <td><input type="date" onchange="updateProjectDuration(this)"></td>
    <td><input type="date" onchange="updateProjectDuration(this)"></td>
    <td><input type="text" placeholder="Auto-calculated" readonly></td>
    <td><input type="number" placeholder="Budget (Rs. Lakhs)" min="0"></td>
    <td><button type="button" class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button></td>`;
}
function handleAgencySelect(sel) {
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
function checkProjectNA(input) {
  const row = input.closest("tr");
  const inputs = row.querySelectorAll("input, select");
  if (input.value.trim().toUpperCase() === "NIL") {
    inputs.forEach((el, i) => {
      if (i > 0) el.disabled = true;
    });
  } else {
    inputs.forEach((el) => (el.disabled = false));
  }
}
function updateProjectDuration(input) {
  const row = input.closest("tr");
  const s = row.cells[3].querySelector("input").value;
  const e = row.cells[4].querySelector("input").value;
  row.cells[5].querySelector("input").value = calculateMonthsDuration(s, e);
}

/* ========================================================
   PROGRAM ROWS
   ======================================================== */
function addProgramRow() {
  programCounter++;
  const tbody = document.getElementById("programsBody");
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${programCounter}</td>
    <td>
      <select onchange="handleProgramSelect(this)">
        <option value="">Select Type</option>
        <option>AICRP AGM</option><option>AINP AGM</option>
        <option>Conference</option><option>Symposium</option><option>OTHER</option>
      </select>
      <input type="text" class="hidden" placeholder="Specify type">
    </td>
    <td><input type="date" onchange="updateProgramDuration(this)"></td>
    <td><input type="date" onchange="updateProgramDuration(this)"></td>
    <td><input type="text" placeholder="Auto-calculated" readonly></td>
    <td><input type="text" placeholder="Venue or NIL"></td>
    <td><button type="button" class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button></td>`;
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

/* ========================================================
   IPR ROWS (pre-populated A-E)
   ======================================================== */
const IPR_TYPES = ["Patent", "Copyright", "Trademark", "Design", "GI"];
function addIPRRow(preType) {
  iprCounter++;
  const tbody = document.getElementById("iprBody");
  const row = tbody.insertRow();
  const typeOptions = IPR_TYPES.map(
    (t) => `<option${preType === t ? " selected" : ""}>${t}</option>`,
  ).join("");
  row.innerHTML = `
    <td>${iprCounter}</td>
    <td><select><option value="">Select Type</option>${typeOptions}</select></td>
    <td><input type="date"></td>
    <td><input type="text" placeholder="Registration No. or NIL"></td>
    <td><button type="button" class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button></td>`;
}

/* ========================================================
   TECH COMMERCIALIZATION ROWS (pre-populated A-C)
   ======================================================== */
const TECH_HEADS = ["Technology", "Varieties", "MoA Signed"];
function addTechComRow(preHead) {
  techComCounter++;
  const tbody = document.getElementById("techComBody");
  const row = tbody.insertRow();
  const headOptions = TECH_HEADS.map(
    (h) => `<option${preHead === h ? " selected" : ""}>${h}</option>`,
  ).join("");
  row.innerHTML = `
    <td>${techComCounter}</td>
    <td><select><option value="">Select Head</option>${headOptions}</select></td>
    <td><input type="text" placeholder="Name or NIL"></td>
    <td><input type="text" placeholder="Licensee or NIL"></td>
    <td><input type="date"></td>
    <td><input type="number" placeholder="License Fee (Rs. Lakh)" min="0"></td>
    <td><button type="button" class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button></td>`;
}

/* ========================================================
   PUBLICATION ROWS — with rich text editor
   ======================================================== */
function addPubRow() {
  pubCounter++;
  const tbody = document.getElementById("pubBody");
  const row = tbody.insertRow();
  const edId = `pub_rte_${pubCounter}`;
  row.innerHTML = `
    <td>${pubCounter}</td>
    <td class="pub-rte-wrap">
      <div class="pub-rte-toolbar">
        <button type="button" class="rte-btn btn-sm" onclick="rteExec('${edId}','bold')" title="Bold"><b>B</b></button>
        <button type="button" class="rte-btn btn-sm" onclick="rteExec('${edId}','italic')" title="Italic"><i>I</i></button>
        <button type="button" class="rte-btn btn-sm" onclick="rteExec('${edId}','underline')" title="Underline"><u>U</u></button>
        <button type="button" class="rte-btn btn-sm" onclick="rteExec('${edId}','strikeThrough')" title="Strikethrough"><s>S</s></button>
        <button type="button" class="rte-btn btn-sm" onclick="rteExec('${edId}','superscript')" title="Super">x²</button>
        <button type="button" class="rte-btn btn-sm" onclick="rteExec('${edId}','subscript')" title="Sub">x₂</button>
      </div>
      <div id="${edId}" class="pub-rte-editor" contenteditable="true" data-placeholder="APA reference or NIL"></div>
      <input type="hidden" class="pub-html-hidden" value="" />
    </td>
    <td><input type="text" placeholder="NAAS Rating or NIL" onchange="updateNAAS(this)"></td>
    <td><input type="text" placeholder="IF or NIL"></td>
    <td><button type="button" class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button></td>`;
  // Attach paste cleaner to the new pub editor
  const newEd = document.getElementById(edId);
  if (newEd) newEd.addEventListener("paste", handleRtePaste);
}
function updateNAAS(inp) {
  const row = inp.closest("tr");
  const ifCell = row.cells[3].querySelector("input");
  const v = inp.value.trim();
  if (v !== "NIL" && v !== "" && !isNaN(parseFloat(v))) {
    ifCell.value = (parseFloat(v) - 6).toFixed(2);
  }
}

/* ========================================================
   TRAINING ROWS
   ======================================================== */
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
    <td><input type="text" placeholder="Training name or NIL"></td>
    <td>
      <select onchange="handleSponsorSelect(this)">
        <option value="">Select Sponsor</option>
        <option>ICAR</option><option>RKVY</option><option>DST</option>
        <option>DBT</option><option>ANRF</option><option>SERB</option><option>OTHER</option>
      </select>
      <input type="text" class="hidden" placeholder="Specify sponsor">
    </td>
    <td><input type="date" onchange="updateTrainDuration(this)"></td>
    <td><input type="date" onchange="updateTrainDuration(this)"></td>
    <td><input type="text" placeholder="Auto-calculated" readonly></td>
    <td><input type="number" placeholder="No. of participants" min="0"></td>
    <td><button type="button" class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button></td>`;
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
function handleSponsorSelect(sel) {
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
function updateTrainDuration(inp) {
  const row = inp.closest("tr");
  const s = row.cells[4].querySelector("input").value;
  const e = row.cells[5].querySelector("input").value;
  row.cells[6].querySelector("input").value = calculateFullDuration(s, e);
}

/* ========================================================
   HAM ROWS
   ======================================================== */
function addHAMRow() {
  hamCounter++;
  const tbody = document.getElementById("hamBody");
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${hamCounter}</td>
    <td><textarea rows="2" placeholder="Details of meeting"></textarea></td>
    <td><textarea rows="2" placeholder="HAM comments"></textarea></td>
    <td><textarea rows="2" placeholder="Follow-up action taken"></textarea></td>
    <td><button type="button" class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button></td>`;
}

/* ========================================================
   GENERIC DELETE ROW
   ======================================================== */
function deleteRow(btn) {
  btn.closest("tr").remove();
}

/* ========================================================
   DURATION CALCULATORS
   ======================================================== */
function calculateMonthsDuration(start, end) {
  if (!start || !end) return "";
  const s = new Date(start),
    e = new Date(end);
  if (e < s) return "Invalid dates";
  const diffDays = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays < 30) return diffDays + (diffDays === 1 ? " day" : " days");
  let temp = new Date(s),
    years = 0,
    months = 0;
  while (true) {
    const n = new Date(temp);
    n.setFullYear(n.getFullYear() + 1);
    if (n <= e) {
      years++;
      temp = n;
    } else break;
  }
  while (true) {
    const n = new Date(temp);
    n.setMonth(n.getMonth() + 1);
    if (n <= e) {
      months++;
      temp = n;
    } else break;
  }
  const rd = Math.floor((e - temp) / (1000 * 60 * 60 * 24)) + 1;
  const parts = [];
  if (years > 0) parts.push(years + (years === 1 ? " year" : " years"));
  if (months > 0) parts.push(months + (months === 1 ? " month" : " months"));
  if (rd > 0) parts.push(rd + (rd === 1 ? " day" : " days"));
  return parts.join(", ");
}
function calculateFullDuration(start, end) {
  return calculateMonthsDuration(start, end);
}

/* ========================================================
   GET TABLE DATA (reads all rows including NIL defaults)
   ======================================================== */
function getTableData(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  const rows = Array.from(tbody.querySelectorAll("tr"));
  return rows.map((row, rowIdx) => {
    const rowData = {};
    rowData["col_0"] = String(rowIdx + 1);
    const cells = row.cells;
    for (let i = 1; i < cells.length - 1; i++) {
      // Special handling for pub rich text editor
      const rteEl = cells[i].querySelector(".pub-rte-editor");
      if (rteEl) {
        rowData[`col_${i}_html`] = rteEl.innerHTML || "";
        rowData[`col_${i}`] = rteEl.innerText || "";
        continue;
      }
      const inputs = cells[i].querySelectorAll("input, select, textarea");
      if (inputs.length === 1) {
        rowData[`col_${i}`] = inputs[0].value || "";
      } else if (inputs.length > 1) {
        const sel = cells[i].querySelector("select");
        const txt = cells[i].querySelector('input[type="text"]');
        if (txt && !txt.classList.contains("hidden") && txt.value) {
          rowData[`col_${i}`] = txt.value;
        } else if (sel && sel.value) {
          rowData[`col_${i}`] = sel.value;
        } else {
          rowData[`col_${i}`] = "";
        }
      } else {
        rowData[`col_${i}`] = "";
      }
    }
    return rowData;
  });
}

function getHAMData() {
  const tbody = document.getElementById("hamBody");
  const hamRadio = document.querySelector('input[name="ham_status"]:checked');
  if (!hamRadio || hamRadio.value === "NA") return "NA";
  const rows = Array.from(tbody.querySelectorAll("tr"));
  if (!rows.length) return "NA";
  return rows.map((row, i) => {
    const tds = row.querySelectorAll("textarea");
    return {
      col_0: String(i + 1),
      col_1: tds[0] ? tds[0].value : "",
      col_2: tds[1] ? tds[1].value : "",
      col_3: tds[2] ? tds[2].value : "",
    };
  });
}

/* ========================================================
   DRAFT SAVE / RESTORE / CLEAR
   ======================================================== */
const DRAFT_KEY = "scientist_draft_v2";

document.getElementById("saveDraftBtn").addEventListener("click", saveDraft);
document.getElementById("clearDraftBtn").addEventListener("click", clearDraft);

async function saveDraft() {
  try {
    const draft = collectDraftData();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    showAlert("✔ Draft saved successfully! You can continue later.", "success");
  } catch (err) {
    showAlert("❌ Error saving draft: " + (err.message || err), "error");
  }
}

function clearDraft() {
  if (!confirm("Clear saved draft from this browser?")) return;
  localStorage.removeItem(DRAFT_KEY);
  resetForm(false);
  showAlert("✔ Draft cleared.", "success");
}

function collectDraftData() {
  const p = getSelectedPeriodInfo();
  return {
    smd_name: document.getElementById("smd_name").value || "",
    institute_name: document.getElementById("institute_name").value || "",
    scientist_name: document.getElementById("scientist_name").value || "",
    month: p.periodMonth,
    year: p.periodYear,
    tables: {
      projects: getTableData("projectsBody"),
      programs: getTableData("programsBody"),
      ipr: getTableData("iprBody"),
      tech_com: getTableData("techComBody"),
      publications: getTableData("pubBody"),
      training: getTableData("trainBody"),
      ham: getHAMData(),
    },
    res_highlight_html: rteGetHtml("res_highlight_editor"),
    breeder_seed: getNilOrValue("breeder_seed", false),
    variety: getNilOrValue("variety", false),
    germplasm: getNilOrValue("germplasm", false),
    microbial: getNilOrValue("microbial", false),
    breakthroughs: getBreakthroughsPayload(),
    nat_agri: getBulletPoints(),
    ham_status:
      (document.querySelector('input[name="ham_status"]:checked') || {})
        .value || "NA",
    figures: figures || [],
    saved_at: new Date().toISOString(),
  };
}

window.addEventListener("load", function () {
  populatePeriods();
  updatePeriodWarning();
  initializeTables();
  syncToggleIcons();
  const d = localStorage.getItem(DRAFT_KEY);
  if (d) {
    try {
      restoreDraft(JSON.parse(d));
      showAlert("✔ Draft loaded successfully.", "success");
    } catch (e) {
      console.error("Draft restore error", e);
    }
  }
  syncToggleIcons(); // re-sync after draft restore may change state
});

function restoreDraft(data) {
  if (!data) return;
  document.getElementById("smd_name").value = data.smd_name || "Crop Science";
  document.getElementById("institute_name").value =
    data.institute_name || "IIAB";
  document.getElementById("scientist_name").value = data.scientist_name || "";
  if (data.month && data.year) {
    periodSelect.value = `${data.month}|${data.year}`;
    updatePeriodWarning();
  }
  rteSetHtml("res_highlight_editor", data.res_highlight_html || "");
  const text = document.getElementById("res_highlight_editor").innerText || "";
  document.getElementById("wordCount").textContent = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  // Restore breakthroughs subsections
  if (data.breakthroughs && typeof data.breakthroughs === "object") {
    [1, 2, 3, 4, 5].forEach(function (i) {
      const sub = data.breakthroughs["sub_" + i];
      const isNil = !sub || sub === "NIL";
      const radios = document.querySelectorAll(
        'input[name="bkt_' + i + '_status"]',
      );
      radios.forEach(function (r) {
        r.checked = r.value === (isNil ? "NIL" : "data");
      });
      bktSubToggle("bkt_" + i, isNil ? "NIL" : "data");
      if (!isNil) {
        const html = data.breakthroughs["sub_" + i + "_html"];
        const editor = document.getElementById("bkt_" + i + "_editor");
        if (editor) editor.innerHTML = html || sub || "";
        // Restore per-subsection figures
        const figs = data.breakthroughs["sub_" + i + "_figs"];
        if (Array.isArray(figs) && figs.length) {
          bktFigures["bkt_" + i] = figs;
          bktFigCounters["bkt_" + i] = figs.reduce(function (m, f) {
            return Math.max(m, f.localIndex || 0);
          }, 0);
          renderBktFigCards("bkt_" + i);
        }
      }
    });
  }

  // Restore bullet points (section 13)
  if (data.nat_agri && data.nat_agri !== "NIL") {
    const radios = document.querySelectorAll('input[name="nat_agri_status"]');
    radios.forEach(function (r) {
      r.checked = r.value === "data";
    });
    natAgriToggle("data");
    // Parse bullet lines back into individual inputs
    const list = document.getElementById("nat_agri_bullets");
    if (list) {
      list.innerHTML = "";
      const lines = data.nat_agri
        .split("\n")
        .map(function (l) {
          return l.replace(/^•\s*/, "").trim();
        })
        .filter(Boolean);
      if (lines.length) {
        lines.forEach(function (line) {
          addBulletPoint(line);
        });
      } else {
        addBulletPoint();
      }
    }
  }

  // Clear and restore tables
  [
    "projectsBody",
    "programsBody",
    "iprBody",
    "techComBody",
    "pubBody",
    "trainBody",
    "hamBody",
  ].forEach((id) => {
    document.getElementById(id).innerHTML = "";
  });
  projectCounter =
    programCounter =
    iprCounter =
    techComCounter =
    pubCounter =
    trainCounter =
    hamCounter =
      0;

  if (data.tables) {
    restoreTableRows(data.tables.projects || [], addProjectRow, "projectsBody");
    restoreTableRows(data.tables.programs || [], addProgramRow, "programsBody");
    restoreTableRows(data.tables.ipr || [], addIPRRow, "iprBody");
    restoreTableRows(data.tables.tech_com || [], addTechComRow, "techComBody");
    restorePubRows(data.tables.publications || []);
    restoreTableRows(data.tables.training || [], addTrainRow, "trainBody");
    if (Array.isArray(data.tables.ham)) {
      data.tables.ham.forEach((r) => {
        addHAMRow();
        const lastRow = document.getElementById("hamBody").lastElementChild;
        const tds = lastRow.querySelectorAll("textarea");
        if (tds[0]) tds[0].value = r.col_1 || "";
        if (tds[1]) tds[1].value = r.col_2 || "";
        if (tds[2]) tds[2].value = r.col_3 || "";
      });
    }
  }
  figures = Array.isArray(data.figures) ? data.figures : [];
  figureLocalCounter = figures.reduce(
    (m, f) => Math.max(m, f.localIndex || 0),
    0,
  );
  renderAllFigureCards();
}

function restoreTableRows(rows, addFn, tbodyId) {
  rows.forEach((rowData) => {
    addFn();
    const tbody = document.getElementById(tbodyId);
    const lastRow = tbody.lastElementChild;
    const inputs = lastRow.querySelectorAll(
      "input:not([type=hidden]), select, textarea",
    );
    let i = 0;
    for (const key in rowData) {
      if (key === "col_0" || key.endsWith("_html")) continue;
      if (key.startsWith("col_") && inputs[i]) {
        inputs[i].value = rowData[key] || "";
        i++;
      }
    }
  });
}

function restorePubRows(rows) {
  rows.forEach((rowData) => {
    addPubRow();
    const tbody = document.getElementById("pubBody");
    const lastRow = tbody.lastElementChild;
    // Restore rich text html
    const rteEl = lastRow.querySelector(".pub-rte-editor");
    if (rteEl && rowData["col_1_html"]) rteEl.innerHTML = rowData["col_1_html"];
    else if (rteEl && rowData["col_1"]) rteEl.innerText = rowData["col_1"];
    // NAAS
    const naasIn = lastRow.cells[2].querySelector("input");
    if (naasIn && rowData["col_2"]) naasIn.value = rowData["col_2"];
    // IF
    const ifIn = lastRow.cells[3].querySelector("input");
    if (ifIn && rowData["col_3"]) ifIn.value = rowData["col_3"];
  });
}

/* ========================================================
   INITIALIZE TABLES WITH DEFAULT ROWS
   ======================================================== */
function initializeTables() {
  if (!document.getElementById("projectsBody").querySelectorAll("tr").length)
    addProjectRow();
  if (!document.getElementById("programsBody").querySelectorAll("tr").length)
    addProgramRow();
  // IPR: show one empty row so column structure is visible
  if (!document.getElementById("iprBody").querySelectorAll("tr").length)
    addIPRRow();
  // TechCom: show one empty row so column structure is visible
  if (!document.getElementById("techComBody").querySelectorAll("tr").length)
    addTechComRow();
  if (!document.getElementById("pubBody").querySelectorAll("tr").length)
    addPubRow();
  if (!document.getElementById("trainBody").querySelectorAll("tr").length)
    addTrainRow();
}

/* ========================================================
   RESET FORM
   ======================================================== */
function resetForm(clearDraftReset = false) {
  if (clearDraftReset) localStorage.removeItem(DRAFT_KEY);
  document.getElementById("scientistForm").reset();
  [
    "projectsBody",
    "programsBody",
    "iprBody",
    "techComBody",
    "pubBody",
    "trainBody",
    "hamBody",
  ].forEach((id) => {
    document.getElementById(id).innerHTML = "";
  });
  projectCounter =
    programCounter =
    iprCounter =
    techComCounter =
    pubCounter =
    trainCounter =
    hamCounter =
      0;

  // Reset section 11 figures
  figures = [];
  figureLocalCounter = 0;
  renderAllFigureCards();

  // Reset section 12 bkt figures
  [1, 2, 3, 4, 5].forEach(function (i) {
    bktFigures["bkt_" + i] = [];
    bktFigCounters["bkt_" + i] = 0;
    renderBktFigCards("bkt_" + i);
    bktSubToggle("bkt_" + i, "NIL");
    const radios = document.querySelectorAll(
      'input[name="bkt_' + i + '_status"]',
    );
    radios.forEach(function (r) {
      r.checked = r.value === "NIL";
    });
    const editor = document.getElementById("bkt_" + i + "_editor");
    if (editor) editor.innerHTML = "";
  });

  // Reset section 13 bullets
  const bulletList = document.getElementById("nat_agri_bullets");
  if (bulletList) bulletList.innerHTML = "";
  const natRadios = document.querySelectorAll('input[name="nat_agri_status"]');
  natRadios.forEach(function (r) {
    r.checked = r.value === "NIL";
  });
  natAgriToggle("NIL");

  rteSetHtml("res_highlight_editor", "");
  document.getElementById("wordCount").textContent = "0";
  initializeTables();
  syncToggleIcons();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ========================================================
   FORM SUBMISSION
   ======================================================== */
document
  .getElementById("scientistForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const submitBtn = document.getElementById("submitBtn");

    if (!document.getElementById("scientist_name").value.trim()) {
      showAlert("Please enter scientist name", "error");
      return;
    }
    const text = document
      .getElementById("res_highlight_editor")
      .innerText.trim();
    const wc = text ? text.split(/\s+/).length : 0;
    if (wc > 500) {
      /* wc < 1 || wc > 500 */
      showAlert(
        `Research highlight must be 1–500 words. Current: ${wc} words.`,
        "error",
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ Uploading... Please wait";

    try {
      const p = getSelectedPeriodInfo();
      // Section 11 figures
      const images = (figures || []).map((f) => ({
        name: f.fileName,
        type: f.mimeType,
        data: f.base64,
        caption: f.caption,
        captionHtml: f.captionHtml || f.caption,
        localIndex: f.localIndex,
        source: "sec11",
      }));
      // Section 12 per-subsection figures
      const bktImages = [];
      [1, 2, 3, 4, 5].forEach(function (i) {
        (bktFigures["bkt_" + i] || []).forEach(function (f) {
          bktImages.push({
            name: f.fileName,
            type: f.mimeType,
            data: f.base64,
            caption: f.caption,
            captionHtml: f.captionHtml || f.caption,
            localIndex: f.localIndex,
            source: "sec12_sub" + i,
          });
        });
      });

      const payload = {
        smd_name: document.getElementById("smd_name").value || "",
        institute_name_short:
          "ICAR-" +
          (document.getElementById("institute_name").value || "").toUpperCase(),
        scientist_name: document.getElementById("scientist_name").value || "",
        month: p.periodMonth,
        year: p.periodYear,
        period_range: p.periodRange,

        // H-Index kept but hidden — still submitted
        h_ind_google: document.getElementById("h_ind_google").value || "",
        h_ind_res_gate: document.getElementById("h_ind_res_gate").value || "",
        num_cit_google: document.getElementById("num_cit_google").value || "",
        num_cit_res_gate:
          document.getElementById("num_cit_res_gate").value || "",

        // Tables — always include all rows
        projects: getTableData("projectsBody"),
        programs: getTableData("programsBody"),
        ipr: getTableData("iprBody"),
        tech_com: getTableData("techComBody"),
        publications: getTableData("pubBody"),
        training: getTableData("trainBody"),
        ham: getHAMData(),

        // Items 7-10
        breeder_seed: getNilOrValue("breeder_seed", false) || "NIL",
        variety: getNilOrValue("variety", false) || "NIL",
        germplasm: getNilOrValue("germplasm", false) || "NIL",
        microbial: getNilOrValue("microbial", false) || "NIL",

        // Items 11-13
        res_highlight:
          document.getElementById("res_highlight_editor").innerText || "",
        res_highlight_html: rteGetHtml("res_highlight_editor") || "",
        breakthroughs: getBreakthroughsPayload().combined || "NIL",
        breakthroughs_detail: getBreakthroughsPayload(),
        nat_agri: getBulletPoints() || "NIL",

        images: images,
        bkt_images: bktImages,
        submission_timestamp: new Date().toISOString(),
      };

      console.log("Payload ready:", payload);

      const SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbwGQ0vmAtXuGTgtsg4zxhjqeyOubZKHiOJp-GmZ2Lw8mp-ntfjXZpQvpL7s35yzZHl4Ow/exec";

      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });

      showAlert("Data submitted successfully!", "success");
      localStorage.removeItem(DRAFT_KEY);

      /* Download button */
      const dlBtn = document.createElement("button");
      dlBtn.textContent =
        "Click to Download Submitted Report (Then please clear the draft)";
      dlBtn.className = "btn btn-secondary";
      dlBtn.style.marginTop = "12px";
      dlBtn.style.display = "block";
      document.getElementById("alertBox").after(dlBtn);

      dlBtn.addEventListener("click", async () => {
        /* --- PDF --- */
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: "pt", format: "a4" });
        let y = 40;
        const sp = 18;
        const ph = pdf.internal.pageSize.height;
        const addPage = () => {
          pdf.addPage();
          y = 40;
        };
        const checkY = (h = sp) => {
          if (y > ph - 50) addPage();
        };

        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text(
          `Monthly Report: ${payload.scientist_name} (${payload.month}, ${payload.year})`,
          40,
          y,
        );
        y += 30;

        pdf.setFont("Helvetica", "normal");
        pdf.setFontSize(11);
        [
          `Scientist: ${payload.scientist_name}`,
          `Institute: ${payload.institute_name_short}`,
          `Month: ${payload.month}`,
          `Year: ${payload.year}`,
          `Period: ${payload.period_range}`,
        ].forEach((t) => {
          checkY();
          pdf.text(t, 40, y);
          y += sp;
        });
        y += 10;

        function addTableSection(title, rows, cols) {
          if (!rows || !rows.length) return;
          checkY(30);
          pdf.setFont("Helvetica", "bold");
          pdf.setFontSize(13);
          pdf.text(title, 40, y);
          y += 22;
          pdf.setFont("Helvetica", "normal");
          pdf.setFontSize(10);
          rows.forEach((row, idx) => {
            checkY(60);
            const parts = cols
              .map((c) => row[c] || "")
              .filter(Boolean)
              .join(" | ");
            const wrapped = pdf.splitTextToSize(`${idx + 1}. ${parts}`, 500);
            wrapped.forEach((line) => {
              checkY();
              pdf.text(line, 50, y);
              y += sp;
            });
            y += 4;
          });
          y += 10;
        }

        addTableSection(
          "1. Externally Funded Projects (>50 Lakhs)",
          payload.projects,
          ["col_1", "col_2", "col_3", "col_4", "col_5", "col_6"],
        );
        addTableSection("2. Programs Organized", payload.programs, [
          "col_1",
          "col_2",
          "col_3",
          "col_4",
          "col_5",
        ]);
        addTableSection("3. IPR Generated", payload.ipr, [
          "col_1",
          "col_2",
          "col_3",
        ]);
        addTableSection("4. Technology Commercialization", payload.tech_com, [
          "col_1",
          "col_2",
          "col_3",
          "col_4",
          "col_5",
        ]);
        addTableSection("5. Publications", payload.publications, [
          "col_1",
          "col_2",
          "col_3",
        ]);
        addTableSection("6. Training Conducted", payload.training, [
          "col_1",
          "col_2",
          "col_3",
          "col_4",
          "col_5",
          "col_6",
          "col_7",
        ]);

        function addSimpleItem(label, value) {
          checkY(30);
          pdf.setFont("Helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text(label, 40, y);
          y += 18;
          pdf.setFont("Helvetica", "normal");
          pdf.setFontSize(11);
          const wrapped = pdf.splitTextToSize(String(value || "NIL"), 500);
          wrapped.forEach((line) => {
            checkY();
            pdf.text(line, 50, y);
            y += sp;
          });
          y += 8;
        }

        addSimpleItem(
          "7. Breeder Seed Produced and Supplied",
          payload.breeder_seed,
        );
        addSimpleItem("8. Variety Released and Notified", payload.variety);
        addSimpleItem(
          "9. Registered Elite Trait Specific Germplasm",
          payload.germplasm,
        );
        addSimpleItem("10. Registered Microbial Germplasm", payload.microbial);

        checkY(30);
        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(13);
        pdf.text("11. Significant Research Findings", 40, y);
        y += 22;
        pdf.setFont("Helvetica", "normal");
        pdf.setFontSize(11);
        pdf.splitTextToSize(payload.res_highlight, 520).forEach((line) => {
          checkY();
          pdf.text(line, 40, y);
          y += sp;
        });
        y += 10;

        addSimpleItem(
          "12. Breakthroughs, Innovations, and Impactful Outcomes",
          payload.breakthroughs,
        );
        addSimpleItem("13. National Agriculture Issues", payload.nat_agri);

        if (Array.isArray(payload.ham)) {
          addTableSection("14. Status of HAM Directions", payload.ham, [
            "col_1",
            "col_2",
            "col_3",
          ]);
        } else {
          addSimpleItem("14. Status of HAM Directions", payload.ham);
        }

        /* Images */
        if (payload.images && payload.images.length) {
          checkY(30);
          pdf.setFont("Helvetica", "bold");
          pdf.setFontSize(13);
          pdf.text("Figures Uploaded", 40, y);
          y += 25;
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
                const sc = Math.min(maxW / w, maxH / h, 1);
                w *= sc;
                h *= sc;
                if (y + h + 60 > ph) {
                  pdf.addPage();
                  y = 40;
                }
                pdf.addImage(imgData, "JPEG", 40, y, w, h);
                y += h + 10;
                const cap =
                  img.caption && img.caption.trim() ? img.caption : img.name;
                pdf.text(`Figure ${i + 1}: ${cap}`, 40, y);
                y += 30;
                resolve();
              };
            });
          }
        }

        const pdfBlob = pdf.output("blob");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(pdfBlob);
        a.download = `Scientist_Report_${payload.scientist_name}_${payload.month}_${payload.year}.pdf`;
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

/* Scientist name cleanup */
document
  .getElementById("scientist_name")
  .addEventListener("input", function () {
    this.value = this.value.replace(/[.,!@#$^&()\-_+=;:'"]/g, "");
  });

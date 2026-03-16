# ICAR Monthly Report System

A browser-based monthly report submission tool for scientists at **ICAR (Indian Council of Agricultural Research)** institutes. Scientists fill out a structured form covering 14 research activity sections, which is then submitted to a **Google Apps Script** backend that automatically stores data in **Google Sheets** and generates formatted **Google Docs** reports — plus a downloadable **PDF** for the scientist's own records.

---

## Table of Contents

- [ICAR Monthly Report System](#icar-monthly-report-system)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [File Structure](#file-structure)
  - [Form Sections](#form-sections)
  - [How It Works](#how-it-works)
  - [Setup Guide](#setup-guide)
    - [1. Google Drive Folder](#1-google-drive-folder)
    - [2. Google Sheets + Apps Script](#2-google-sheets--apps-script)
    - [3. Deploy the Web App](#3-deploy-the-web-app)
    - [4. Link the Frontend](#4-link-the-frontend)
    - [5. Host the Frontend](#5-host-the-frontend)
  - [Usage](#usage)
  - [Draft / Auto-save](#draft--auto-save)
  - [PDF Download](#pdf-download)
  - [Google Sheets Output](#google-sheets-output)
  - [Google Docs Output](#google-docs-output)
  - [Customisation](#customisation)
  - [Known Limitations](#known-limitations)
  - [License](#license)

---

## Overview

Each month, scientists at ICAR institutes report on their research activities — projects, publications, IPR, training events, breakthroughs, and more. This system replaces manual document preparation with a guided web form that:

- Validates and collects structured data via a responsive HTML form
- Saves draft progress locally in the browser (localStorage)
- Submits data to a Google Apps Script endpoint
- Populates dedicated Google Sheets tabs (one per data category)
- Auto-creates or updates a **combined monthly Google Doc** (one doc per month, all scientists appended) and an **individual scientist doc**
- Uploads figures to Google Drive in an organised folder hierarchy
- Generates a downloadable PDF report immediately after submission

---

## Features

- **14 report sections** covering all standard ICAR monthly reporting requirements
- **Collapsible sections** for a clean, uncluttered form experience
- **NIL / NA toggles** — sections left as NIL are completely omitted from all outputs (no filler rows in Sheets or Docs)
- **Rich Text Editor** (bold, italic, underline, superscript, subscript, strikethrough) in narrative fields
- **Figure upload** with captions — supports JPG, PNG, TIFF; images are uploaded to Drive and embedded in Google Docs
- **Bullet-list editor** for structured text fields
- **Auto-save draft** to browser localStorage; drafts reload automatically on next open
- **Word count** indicator on the Research Highlights field
- **Dynamic reporting period** selector — shows current and previous month; warns scientist of the correct input date range
- **PDF generation** using [jsPDF](https://github.com/parallax/jsPDF) — no server round-trip needed
- **Responsive layout** — works on desktop and tablet screens

---

## File Structure

```
├── index.html      # Main form UI
├── script.js       # Frontend logic (form handling, draft save/load, PDF generation, submission)
├── style.css       # All styling
└── code.gs         # Google Apps Script backend (Sheets + Docs + Drive)
```

---

## Form Sections

| #   | Section                                              | Type                                         |
| --- | ---------------------------------------------------- | -------------------------------------------- |
| 1   | Externally Funded Projects (>50 Lakhs)               | Table                                        |
| 2   | AICRP/AINP AGM / Conference / Symposium Organized    | Table                                        |
| 3   | IPR Generated                                        | Table                                        |
| 4   | Technology Commercialization                         | Table                                        |
| 5   | Publications (APA Style, NAAS Rating, Impact Factor) | Table                                        |
| 6   | Training Conducted                                   | Table                                        |
| 7   | Breeder Seed Produced and Supplied                   | NIL toggle + text                            |
| 8   | Variety Released and Notified                        | NIL toggle + text                            |
| 9   | Registered Elite Trait Specific Germplasm            | NIL toggle + text                            |
| 10  | Registered Microbial Germplasm                       | NIL toggle + text                            |
| 11  | Significant Research Findings                        | Rich text + figures                          |
| 12  | Breakthroughs, Innovations & Impactful Outcomes      | 5 subsections, each with rich text + figures |
| 13  | National Agriculture Issues                          | Bullet list                                  |
| 14  | Status of HAM Directions                             | NIL toggle or table                          |

---

## How It Works

```
Browser (index.html + script.js)
    │
    │  JSON payload (POST, no-cors)
    ▼
Google Apps Script Web App (code.gs)
    ├── Parses JSON
    ├── Uploads images → Google Drive  (Year / Month / Scientist subfolders)
    ├── Writes rows → Google Sheets    (9 dedicated sheets)
    ├── Appends data → Combined monthly Google Doc
    └── Creates individual scientist Google Doc
```

The frontend also generates a PDF client-side using jsPDF **after** a successful submission, so the scientist can download their own copy without any additional server request.

---

## Setup Guide

### 1. Google Drive Folder

1. Create a folder in Google Drive for storing all monthly reports (e.g. `Monthly Reports`).
2. Copy its **Folder ID** from the URL:
   `https://drive.google.com/drive/folders/<FOLDER_ID>`

### 2. Google Sheets + Apps Script

1. Create a new **Google Sheet** (this will hold all submitted data).
2. Open **Extensions → Apps Script**.
3. Delete any default code and paste the entire contents of `code.gs`.
4. Replace the placeholder folder ID at the top of the file:
   ```javascript
   const DRIVE_FOLDER_ID = "your_folder_id_here";
   ```
5. Under **Services** (left sidebar), enable **Google Drive API (v2)**.

### 3. Deploy the Web App

1. In Apps Script, click **Deploy → New deployment**.
2. Choose type: **Web App**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy** and copy the **Web App URL**.

### 4. Link the Frontend

Open `script.js` and find the `SCRIPT_URL` constant near the bottom of the submit handler. Replace the existing URL with your deployed Web App URL:

```javascript
const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

### 5. Host the Frontend

The frontend is a static site — no build step required. You can host it on:

- **GitHub Pages** — push to a repo and enable Pages under Settings
- Any static hosting service (Netlify, Vercel, etc.)
- Locally by opening `index.html` directly in a browser

> **Note:** Because the form submits with `mode: "no-cors"`, it works from any origin without CORS configuration on the Apps Script side.

---

## Usage

1. Open the form in a browser.
2. Fill in **Basic Information** — SMD name, institute short name, scientist name, and reporting period.
3. Work through each collapsible section. Use the **NIL** radio button to skip any section with no activity that month.
4. For narrative sections (Research Findings, Breakthroughs), use the rich text toolbar for formatting. Use `[FIG-1]`, `[FIG-2]`, etc. as placeholders in text — they resolve to figure numbers in the generated Google Doc.
5. Click **Save Draft** at any time to preserve progress locally.
6. Click **Submit** when done. On success:
   - Data is saved to Google Sheets and Google Docs.
   - A **download button** appears — click it to get the PDF.
   - The draft is cleared automatically after PDF download.

---

## Draft / Auto-save

- Drafts are stored in **browser localStorage** under the key `scientist_report_draft`.
- The form auto-loads the last saved draft on page open.
- Click **Save Draft** to manually save current state.
- Click **Clear Draft** to wipe the saved draft and reset the form.

> Drafts are device- and browser-specific. They are not synced across devices.

---

## PDF Download

Generated client-side with **jsPDF** immediately after a successful submission. The PDF includes:

- Header with scientist name, institute, month, year, and period
- All non-NIL table sections (projects, programs, IPR, etc.)
- All non-NIL narrative sections
- Embedded figure images with captions

File is named: `Scientist_Report_<Name>_<Month>_<Year>.pdf`

---

## Google Sheets Output

The Apps Script creates the following sheets automatically on first submission (headers are bold, colour-coded):

| Sheet Name               | Contents                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `Main_Data`              | Core fields + image link counts                                                                        |
| `External_Projects`      | One row per project                                                                                    |
| `Programs_Organized`     | One row per program/conference                                                                         |
| `IPR_Generated`          | One row per IPR entry                                                                                  |
| `Tech_Commercialization` | One row per tech transfer entry                                                                        |
| `Publications`           | One row per publication                                                                                |
| `Training_Conducted`     | One row per training event                                                                             |
| `Research_Images`        | Drive links for all uploaded figures                                                                   |
| `Extended_Info`          | Narrative sections (breeder seed, variety, germplasm, highlights, breakthroughs, national agri issues) |
| `HAM_Directions`         | One row per HAM direction entry                                                                        |

NIL / NA / empty fields are **not written** to any sheet — no blank filler rows are created.

---

## Google Docs Output

Two Google Docs are created per submission:

**Combined Monthly Doc** (`ICAR-<Institute>_<Month>_<Year>` in the month's root folder)

- One document per month, shared across all scientists
- Each scientist's data is appended under appropriate section headings
- Sections use Heading styles for easy navigation
- Tables are created for tabular data; figures are embedded inline

**Individual Scientist Doc** (stored in `Year / Month / ScientistName /` subfolder)

- Self-contained report for that scientist only
- Same structure and content as the combined doc entry, plus a cover header

---

## Customisation

| What                               | Where                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| Default SMD name                   | `index.html` — `value="Crop Science"` on `#smd_name`                         |
| Default institute short name       | `index.html` — `value="IIAB"` on `#institute_name`                           |
| Drive folder                       | `code.gs` — `DRIVE_FOLDER_ID` constant                                       |
| Number of breakthrough subsections | `script.js` — `bktMasterToggle` loop and HTML breakthrough subsection blocks |
| Colour scheme                      | `style.css` — `#667eea` (primary) and `#764ba2` (accent)                     |
| Period range logic                 | `script.js` — `getSelectedPeriodInfo()`                                      |

---

## Known Limitations

- **No authentication** — the form is open to anyone with the URL. For internal use, restrict access via network controls or add Google Sign-In.
- **`no-cors` submission** — the frontend cannot read the response body from Apps Script. Submission errors on the server side will not surface as error messages in the UI (check Apps Script logs via **Executions**).
- **localStorage drafts** are cleared on browser data wipe and are not accessible on other devices.
- **jsPDF image quality** — very large images may be scaled down in the PDF; the Drive-stored originals are unaffected.
- The Apps Script free tier has [quota limits](https://developers.google.com/apps-script/guides/services/quotas) on Drive writes, Doc creates, and execution time. For high-volume use, consider batching or upgrading to Google Workspace.

---

## License

This project is intended for internal use within ICAR institutes. Adapt and redistribute as needed within your organisation.

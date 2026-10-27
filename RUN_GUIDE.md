# DHL Incident System - Run Backend + Frontend + UiPath RPA (Scenario 2)

## 1. Copy these files into your DHLPROJECT folder
| From this zip | To your project |
|---|---|
| backend/routes/rpa.js | backend/routes/rpa.js (new) |
| backend/server.js | backend/server.js (replace) |
| backend/.env.example | backend/.env (copy + rename) |
| frontend/src/pages/IncidentDetail.jsx | frontend/src/pages/IncidentDetail.jsx (replace) |

## 2. Start the backend (Terminal 1)
    cd backend
    npm install
    npm start
Check in the browser: http://localhost:3001/api/rpa/health  ->  {"ok":true,...}

## 3. Start the frontend (Terminal 2)
    cd frontend
    npm install
    npm start
Open http://localhost:3000 and log in: admin / admin123

## 4. Set the OpenAI key (once, in Command Prompt), then restart UiPath Studio
    setx OPENAI_API_KEY "sk-your-key"

## 5. Create the UiPath project
1. UiPath Studio -> New -> Process. Name: DHL_RPA_Scenario2. Compatibility: Windows. Language: VB.
2. Close Studio's Main.xaml, replace it with uipath/DHL_RPA_Scenario2/Main.xaml from this zip, reopen the project.
3. Manage Packages -> make sure UiPath.System.Activities and UiPath.Mail.Activities are installed.

## 6. Put test input in the inbox
Copy the 3 files from sample_inbox/ into  C:\DHL_Inbox\Incoming
(the folder is created on the first run; create it by hand if it does not exist yet)

## 7. Run
Studio -> Run File (or F5). Watch the Output panel:
    Found 3 case(s) ...
    AI ...: OK
    Case ... -> Created INC-004 | Damaged Parcel / Claims & Insurance / Critical
    RUN DONE ...

## 8. Check the website
Refresh http://localhost:3000 -> Incidents. New incidents have the AI Analysis card on the detail page.
The first sample (MY987623400) MERGES into the existing INC-001 because it is the same tracking number.

## Outputs
- C:\DHL_Inbox\_processed\<date>\   files that were imported
- C:\DHL_Inbox\_failed\             files that failed + error screenshot
- C:\DHL_Inbox\_reports\            run_<id>.log and report_<id>.csv

## Troubleshooting
| Symptom in log / report | Fix |
|---|---|
| HTTP 0 / connection refused | Backend not running, or ApiBaseUrl is not http://localhost:3001 |
| HTTP 401 Invalid API key | ApiKey in Main.xaml must equal RPA_API_KEY in backend/.env (default dhl-rpa-dev-key) |
| AI fallback - OpenAI HTTP 401 | Wrong OPENAI_API_KEY, or Studio was not restarted after setx |
| AI fallback - OpenAI HTTP 429 | OpenAI account has no credit / rate limit |
| Duplicate skipped | Same content was imported in the last 14 days. Delete C:\DHL_Inbox\_processed\hashes.csv to re-test |

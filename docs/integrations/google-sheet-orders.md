# Website Orders → Google Sheet

Every website order is appended as a row to a **`Website Orders`** tab in the
same spreadsheet that collects the Google Form responses ("BOF Bagnetchon Order
Form (Responses)"). The form's own tab is never touched, so the client's
existing flow (and any n8n automation watching that tab) is unaffected.

**How it works:** `placeOrder` (server fn) → HTTPS POST → a container-bound
Apps Script **Web App** on the spreadsheet → `appendRow` into `Website Orders`.
The call is capped at 5 s and never fails an order; Supabase remains the source
of truth.

---

## One-time setup (~10 minutes, do while logged into the Google account that owns the sheet)

### 1. Open the script editor on the live spreadsheet
Open the **BOF Bagnetchon Order Form (Responses)** spreadsheet →
**Extensions → Apps Script**. Delete any placeholder code and paste:

```javascript
// Bagnetchon — website order intake.
// Appends one row per website order into the "Website Orders" tab.
// The website sends the shared secret in the JSON body (Apps Script cannot
// read request headers). Set SECRET in Project Settings → Script Properties.

const TAB = "Website Orders";
const HEADERS = [
  "Timestamp", "Order Ref", "Name", "Email", "Phone", "Fulfillment",
  "Address", "Items", "Subtotal", "Tax", "Delivery Fee", "Total",
  "Status", "Source",
];

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad json" });
  }

  const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  if (!secret || body.secret !== secret) {
    return reply({ ok: false, error: "unauthorized" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TAB);
  if (!sheet) {
    sheet = ss.insertSheet(TAB);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    body.createdAt || new Date().toISOString(),
    body.ref || "",
    body.name || "",
    body.email || "",
    body.phone || "",
    body.fulfillment || "",
    body.address || "",
    body.items || "",
    body.subtotal ?? "",
    body.tax ?? "",
    body.deliveryFee ?? "",
    body.total ?? "",
    "new",
    body.source || "Website",
  ]);

  return reply({ ok: true });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
```

### 2. Set the shared secret
In the Apps Script editor: **Project Settings (gear) → Script Properties →
Add script property** — name `SECRET`, value a long random string, e.g. from
PowerShell:

```powershell
-join ((48..57)+(97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

### 3. Deploy as a Web App
**Deploy → New deployment → type: Web app**
- Description: `website order intake`
- Execute as: **Me**
- Who has access: **Anyone** *(required so the website's server can POST; the
  secret is what actually gates writes)*

Authorize when prompted, then **copy the Web app URL**
(`https://script.google.com/macros/s/…/exec`).

### 4. Configure the website
Add both values in **Vercel → Project → Settings → Environment Variables**
(Production + Preview) and in the local `.env`:

```
SHEETS_WEBAPP_URL=<the /exec URL from step 3>
SHEETS_WEBAPP_SECRET=<the same secret from step 2>
```

Redeploy (or `vercel --prod`) so the running functions pick them up.

### 5. Verify
Place a test order on the site → within a few seconds a new row appears in the
**Website Orders** tab with ref, items, and totals. If not, check the Vercel
function logs for `[sheets]` errors.

---

## Notes
- **Rotating the secret:** change the Script Property AND the Vercel env var,
  then redeploy. No script redeploy needed.
- **Editing the script:** after code changes, use **Deploy → Manage
  deployments → edit (pencil) → Version: New version** — otherwise the /exec
  URL keeps serving the old code.
- **Why not the form's own tab:** the form tab's columns are controlled by
  Google Forms, and the n8n automation matches its exact headers. A separate
  tab keeps website orders clean (quantities included) and risk-free.
- **Zoho invoicing for website orders** is intentionally out of scope for now;
  the n8n pipeline only processes form submissions.

/**
 * AIUNITES Cloud Database - Google Apps Script
 * 
 * Deploy: Extensions → Apps Script → Deploy → New deployment → Web app → Anyone
 * 
 * API Endpoints:
 *   ?type=users     → Returns user accounts
 *   ?type=scores    → Returns quiz scores  
 *   ?type=waitlist  → Returns waitlist entries
 *   ?type=contacts  → Returns contact form submissions
 *   ?type=feedback  → Returns feedback messages
 *   ?type=all       → Returns all parsed data
 *   ?site=MySite    → Filter by site/source (optional)
 */

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().toLowerCase().trim());
  
  // Find column indices
  const msgIdx = headers.findIndex(h => h.includes('message') || h.includes('feedback'));
  const srcIdx = headers.findIndex(h => h.includes('source'));
  const emailIdx = headers.findIndex(h => h.includes('email'));
  const timestampIdx = headers.findIndex(h => h.includes('timestamp'));
  
  // Parse all data
  const users = [];
  const scores = [];
  const waitlist = [];
  const contacts = [];
  const feedback = [];
  const other = [];
  
  data.slice(1).forEach((row, idx) => {
    const message = msgIdx >= 0 ? row[msgIdx] : '';
    const source = srcIdx >= 0 ? row[srcIdx] : '';
    const email = emailIdx >= 0 ? row[emailIdx] : '';
    const timestamp = timestampIdx >= 0 ? row[timestampIdx] : new Date();
    
    if (!message || typeof message !== 'string') return;
    
    const parts = message.split('|');
    const type = parts[0];
    
    // Parse based on type prefix
    if (type === 'USER' && parts.length >= 8) {
      users.push({
        id: idx,
        username: parts[1],
        email: parts[2],
        password: parts[3],
        firstName: parts[4],
        lastName: parts[5],
        role: parts[6] || 'user',
        createdAt: parts[7],
        source: source
      });
    } 
    else if (type === 'SCORE' && parts.length >= 9) {
      scores.push({
        id: idx,
        username: parts[1],
        displayName: parts[2],
        score: parseInt(parts[3]) || 0,
        correct: parseInt(parts[4]) || 0,
        wrong: parseInt(parts[5]) || 0,
        streak: parseInt(parts[6]) || 0,
        mode: parts[7],
        timestamp: parts[8],
        source: source
      });
    }
    else if (type === 'WAITLIST' && parts.length >= 4) {
      waitlist.push({
        id: idx,
        email: parts[1],
        name: parts[2] || '',
        site: parts[3] || source,
        timestamp: parts[4] || timestamp,
        source: source
      });
    }
    else if (type === 'CONTACT' && parts.length >= 5) {
      contacts.push({
        id: idx,
        name: parts[1],
        email: parts[2],
        subject: parts[3] || '',
        message: parts[4],
        timestamp: parts[5] || timestamp,
        source: source
      });
    }
    else if (type === 'FEEDBACK') {
      feedback.push({
        id: idx,
        message: parts.slice(1).join('|'), // In case message has pipes
        email: email,
        timestamp: timestamp,
        source: source
      });
    }
    else {
      // Unknown type - store raw
      other.push({
        id: idx,
        type: type,
        raw: message,
        email: email,
        timestamp: timestamp,
        source: source
      });
    }
  });
  
  // Get query parameters
  const requestType = e?.parameter?.type || 'users';
  const siteFilter = e?.parameter?.site || null;
  
  // Select result based on type
  let result;
  switch (requestType.toLowerCase()) {
    case 'users':
      result = users;
      break;
    case 'scores':
      result = scores;
      break;
    case 'waitlist':
      result = waitlist;
      break;
    case 'contacts':
      result = contacts;
      break;
    case 'feedback':
      result = feedback;
      break;
    case 'all':
      result = { users, scores, waitlist, contacts, feedback, other };
      break;
    default:
      result = users;
  }
  
  // Apply site filter if specified
  if (siteFilter && Array.isArray(result)) {
    result = result.filter(item => 
      item.source && item.source.toLowerCase().includes(siteFilter.toLowerCase())
    );
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Optional: Add a simple web interface for viewing data
 */
function doGet_with_ui(e) {
  // If ?ui=true, return HTML interface
  if (e?.parameter?.ui === 'true') {
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>AIUNITES Cloud Database</title>
          <style>
            body { font-family: system-ui; background: #0f0f14; color: #fff; padding: 20px; }
            h1 { color: #8b5cf6; }
            .stat { display: inline-block; margin: 10px; padding: 15px; background: #1a1a24; border-radius: 8px; }
            .stat .num { font-size: 2rem; font-weight: bold; color: #00d4ff; }
          </style>
        </head>
        <body>
          <h1>☁️ AIUNITES Cloud Database</h1>
          <p>API Endpoints:</p>
          <ul>
            <li><code>?type=users</code> - User accounts</li>
            <li><code>?type=scores</code> - Quiz scores</li>
            <li><code>?type=waitlist</code> - Waitlist entries</li>
            <li><code>?type=contacts</code> - Contact submissions</li>
            <li><code>?type=all</code> - All data</li>
          </ul>
        </body>
      </html>
    `);
  }
  
  // Otherwise return JSON
  return doGet(e);
}

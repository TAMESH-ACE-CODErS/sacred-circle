/**
 * Sacred Circle — one free Google Sheet, three tabs, zero paid services.
 *
 * Tabs and exact headers:
 *   Comments      name | message | created_at
 *   Announcements id | title | body | date | is_pinned
 *   Events        id | title | date | time | location_or_link | description
 *
 * Deploy as: Web app, Execute as "Me", Who has access "Anyone".
 * Optional Script Property ADMIN_PIN mirrors VITE_ADMIN_PIN for a second check.
 */

var SHEETS = {
  Comments: ['name', 'message', 'created_at'],
  Announcements: ['id', 'title', 'body', 'date', 'is_pinned'],
  Events: ['id', 'title', 'date', 'time', 'location_or_link', 'description']
};
var ADMIN_PIN_PROPERTY = 'ADMIN_PIN';

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'list_comments';

    if (action === 'list_comments' || action === 'comments') {
      return json_({ comments: newestFirst_(readRows_('Comments'), 'created_at'), source: 'sheets' });
    }
    if (action === 'list_announcements' || action === 'announcements') {
      return json_({ announcements: sortAnnouncements_(readRows_('Announcements')), source: 'sheets' });
    }
    if (action === 'list_events' || action === 'events') {
      return json_({ events: sortEvents_(readRows_('Events')), source: 'sheets' });
    }

    return json_({ error: 'Unknown action' });
  } catch (error) {
    return json_({ error: String(error) });
  }
}

function doPost(e) {
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    var action = payload.action;
    var adminActions = ['announcement_create', 'announcement_delete', 'event_create', 'event_delete'];
    if (adminActions.indexOf(action) >= 0 && !isAdmin_(payload)) return forbidden_();

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (action === 'comment_create') return createComment_(payload);
      if (action === 'announcement_create') return createAnnouncement_(payload);
      if (action === 'announcement_delete') return deleteRow_('Announcements', payload.id);
      if (action === 'event_create') return createEvent_(payload);
      if (action === 'event_delete') return deleteRow_('Events', payload.id);
      return json_({ error: 'Unknown action' });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return json_({ error: String(error) });
  }
}

function createComment_(payload) {
  var name = clean_(payload.name, 80) || 'Guest';
  var message = clean_(payload.message, 2000);
  if (!message) return json_({ error: 'Please write a message before sharing.' });

  var comment = {
    name: name,
    message: message,
    created_at: new Date().toISOString()
  };
  sheet_('Comments').appendRow([
    escapeCell_(comment.name),
    escapeCell_(comment.message),
    comment.created_at
  ]);
  return json_({ comment: comment, success: true, source: 'sheets' });
}

function createAnnouncement_(payload) {
  var title = clean_(payload.title, 160);
  var body = clean_(payload.body, 4000);
  if (!title || !body) return json_({ error: 'Title and body are required.' });

  var announcement = {
    id: Utilities.getUuid(),
    title: title,
    body: body,
    date: clean_(payload.date, 40) || new Date().toISOString(),
    is_pinned: toBool_(payload.is_pinned)
  };
  sheet_('Announcements').appendRow([
    announcement.id,
    escapeCell_(announcement.title),
    escapeCell_(announcement.body),
    announcement.date,
    announcement.is_pinned ? 'TRUE' : 'FALSE'
  ]);
  return json_({ announcement: announcement, success: true, source: 'sheets' });
}

function createEvent_(payload) {
  var title = clean_(payload.title, 160);
  if (!title) return json_({ error: 'Title is required.' });

  var event = {
    id: Utilities.getUuid(),
    title: title,
    date: clean_(payload.date, 80) || new Date().toISOString(),
    time: clean_(payload.time, 40) || '2 Hrs',
    location_or_link: clean_(payload.location_or_link, 300),
    description: clean_(payload.description, 4000)
  };
  sheet_('Events').appendRow([
    event.id,
    escapeCell_(event.title),
    event.date,
    event.time,
    escapeCell_(event.location_or_link),
    escapeCell_(event.description)
  ]);
  return json_({ event: event, success: true, source: 'sheets' });
}

function deleteRow_(name, id) {
  var sheet = sheet_(name);
  var row = findRow_(sheet, id);
  if (row < 2) return json_({ error: 'Row not found.' });
  sheet.deleteRow(row);
  return json_({ success: true, source: 'sheets' });
}

function readRows_(name) {
  var values = sheet_(name).getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  var headers = values[0];
  return values.slice(1).map(function (row) {
    var record = {};
    headers.forEach(function (header, index) {
      record[header] = unescapeCell_(row[index] || '');
    });
    if (record.is_pinned !== undefined) record.is_pinned = toBool_(record.is_pinned);
    return record;
  }).filter(function (row) {
    return Object.keys(row).some(function (key) { return Boolean(row[key]); });
  });
}

function newestFirst_(rows, key) {
  return rows.sort(function (a, b) {
    return String(b[key] || '').localeCompare(String(a[key] || ''));
  });
}

function sortAnnouncements_(rows) {
  return rows.sort(function (a, b) {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return String(b.date || '').localeCompare(String(a.date || ''));
  });
}

function sortEvents_(rows) {
  return rows.sort(function (a, b) {
    return String(a.date || '').localeCompare(String(b.date || ''));
  });
}

function findRow_(sheet, id) {
  var values = sheet.getDataRange().getDisplayValues();
  var target = clean_(id, 200);
  for (var i = 1; i < values.length; i++) {
    if (unescapeCell_(values[i][0] || '') === target) return i + 1;
  }
  return -1;
}

function sheet_(name) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var headers = SHEETS[name];
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);

  var width = Math.max(sheet.getLastColumn(), headers.length);
  var header = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  headers.forEach(function (name, index) {
    if (header[index] !== name) sheet.getRange(1, index + 1).setValue(name);
  });
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function clean_(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max);
}

function toBool_(value) {
  return value === true || String(value).toLowerCase() === 'true' || String(value) === '1';
}

/** Prevents spreadsheet formula injection when a human opens the Sheet. */
function escapeCell_(value) {
  var text = String(value || '');
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function unescapeCell_(value) {
  var text = String(value || '');
  return /^'[=+\-@]/.test(text) ? text.slice(1) : text;
}

function isAdmin_(payload) {
  var expected = PropertiesService.getScriptProperties().getProperty(ADMIN_PIN_PROPERTY);
  if (!expected) return true;
  return clean_(payload && payload.adminPin, 200) === expected;
}

function forbidden_() {
  return json_({ error: 'Admin PIN not accepted.' });
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}

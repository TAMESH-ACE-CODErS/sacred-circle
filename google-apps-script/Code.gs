/**
 * Sacred Circle — CommunityQuotes (100% free Google Sheet + Apps Script).
 *
 * Sheet columns, in this exact order:
 * id | timestamp | author_name | category | content | status
 *
 * Deploy as: Web app, Execute as "Me", Who has access "Anyone".
 * Set Script Property QUOTES_ADMIN_KEY to a long random secret.
 */

var SHEET_NAME = 'CommunityQuotes';
var HEADERS = ['id', 'timestamp', 'author_name', 'category', 'content', 'status'];
var ADMIN_PROPERTY = 'QUOTES_ADMIN_KEY';
var CATEGORIES = ['quote', 'opinion', 'reflection'];
var STATUSES = ['published', 'hidden'];

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'list';

    if (action === 'list') {
      var published = readRows_().filter(function (row) {
        return row.status === 'published';
      });
      return json_({ quotes: newestFirst_(published), source: 'sheets' });
    }

    if (action === 'list_all') {
      if (!isAdmin_(e && e.parameter && e.parameter.adminKey)) return forbidden_();
      return json_({ quotes: newestFirst_(readRows_()), source: 'sheets' });
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
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      if (action === 'create') return create_(payload);
      if (action === 'update') {
        if (!isAdmin_(payload.adminKey)) return forbidden_();
        return update_(payload);
      }
      if (action === 'delete') {
        if (!isAdmin_(payload.adminKey)) return forbidden_();
        return delete_(payload);
      }
      return json_({ error: 'Unknown action' });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return json_({ error: String(error) });
  }
}

function create_(payload) {
  var content = clean_(payload.content, 4000);
  if (!content) return json_({ error: 'Please write a reflection before posting.' });

  var quote = {
    id: Utilities.getUuid(),
    timestamp: new Date().toISOString(),
    author_name: clean_(payload.author_name, 80) || 'Guest',
    category: CATEGORIES.indexOf(payload.category) >= 0 ? payload.category : 'reflection',
    content: content,
    status: 'published',
  };

  sheet_().appendRow([
    quote.id,
    quote.timestamp,
    escapeCell_(quote.author_name),
    quote.category,
    escapeCell_(quote.content),
    quote.status,
  ]);

  return json_({ quote: quote, success: true });
}

function update_(payload) {
  var sheet = sheet_();
  var row = findRow_(sheet, payload.id);
  if (row < 2) return json_({ error: 'Reflection not found.' });

  var content = clean_(payload.content, 4000);
  if (!content) return json_({ error: 'Content cannot be empty.' });

  var updated = {
    id: unescapeCell_(String(payload.id)),
    timestamp: String(sheet.getRange(row, 2).getDisplayValue()),
    author_name: clean_(payload.author_name, 80) || 'Guest',
    category: CATEGORIES.indexOf(payload.category) >= 0 ? payload.category : 'reflection',
    content: content,
    status: STATUSES.indexOf(payload.status) >= 0 ? payload.status : 'published',
  };

  sheet.getRange(row, 1, 1, HEADERS.length).setValues([[
    escapeCell_(updated.id),
    updated.timestamp,
    escapeCell_(updated.author_name),
    updated.category,
    escapeCell_(updated.content),
    updated.status,
  ]]);

  return json_({ quote: updated, success: true });
}

function delete_(payload) {
  var sheet = sheet_();
  var row = findRow_(sheet, payload.id);
  if (row < 2) return json_({ error: 'Reflection not found.' });
  sheet.deleteRow(row);
  return json_({ success: true });
}

function readRows_() {
  var values = sheet_().getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  return values.slice(1).map(function (row) {
    return {
      id: unescapeCell_(row[0] || ''),
      timestamp: row[1] || '',
      author_name: unescapeCell_(row[2] || ''),
      category: CATEGORIES.indexOf(row[3]) >= 0 ? row[3] : 'reflection',
      content: unescapeCell_(row[4] || ''),
      status: row[5] === 'hidden' ? 'hidden' : 'published',
    };
  }).filter(function (row) {
    return Boolean(row.id);
  });
}

function newestFirst_(rows) {
  return rows.sort(function (a, b) {
    return String(b.timestamp).localeCompare(String(a.timestamp));
  });
}

function findRow_(sheet, id) {
  var values = sheet.getDataRange().getDisplayValues();
  var target = unescapeCell_(String(id || ''));
  for (var i = 1; i < values.length; i++) {
    if (unescapeCell_(values[i][0] || '') === target) return i + 1;
  }
  return -1;
}

function sheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  var width = Math.max(sheet.getLastColumn(), HEADERS.length);
  var header = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  HEADERS.forEach(function (name, index) {
    if (header[index] !== name) sheet.getRange(1, index + 1).setValue(name);
  });
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function clean_(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max);
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

function isAdmin_(key) {
  var expected = PropertiesService.getScriptProperties().getProperty(ADMIN_PROPERTY);
  return Boolean(expected && key && String(key) === expected);
}

function forbidden_() {
  return json_({ error: 'Admin key not accepted.' });
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}

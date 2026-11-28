/**
 * Sacred Circle — one free Google Sheet, five tabs, zero paid services.
 *
 * Initialised tabs and exact headers:
 *   VisitorEvents  event_id | timestamp | session_id | event_type | event_detail | cards_viewed_count | time_on_brochure_sec | language | device_type | referrer
 *   SundayCheckins id | timestamp | name | phone_whatsapp | email | city | age_group | profession_role | company_or_business | website_or_linkedin | interest_area | referral_source | open_to_connect | language | device_type
 *   Posts          id | timestamp | name | post_text | email | phone_whatsapp | city | age_group | profession_role | company_or_business | website_or_linkedin | interests | referral_source | open_to_connect | language_used | device_type | status
 *   Comments       comment_id | parent_post_id | timestamp | name | comment_text | email | phone_whatsapp | city | profession_role | company_or_business | status
 *   AudioSessions  id | title | description | speaker | drive_file_id | drive_url | media_url | duration | pin_code | status | created_at
 *
 * Deploy as: Web app, Execute as "Me", Who has access "Anyone".
 * Optional Script Properties: ADMIN_PIN, AUDIO_DRIVE_FOLDER_ID.
 * Admin writes accept either adminKey or the legacy adminPin field.
 *
 * PRIVACY: public doGet responses are built from explicit allowlists. Email,
 * phone, company and website fields are never returned to the browser.
 */

var SHEETS = {
  VisitorEvents: [
    'event_id', 'timestamp', 'session_id', 'event_type', 'event_detail',
    'cards_viewed_count', 'time_on_brochure_sec', 'language', 'device_type', 'referrer'
  ],
  SundayCheckins: [
    'id', 'timestamp', 'name', 'phone_whatsapp', 'email', 'city', 'age_group',
    'profession_role', 'company_or_business', 'website_or_linkedin', 'interest_area',
    'referral_source', 'open_to_connect', 'language', 'device_type'
  ],
  Posts: [
    'id', 'timestamp', 'name', 'post_text', 'email', 'phone_whatsapp', 'city',
    'age_group', 'profession_role', 'company_or_business', 'website_or_linkedin',
    'interests', 'referral_source', 'open_to_connect', 'language_used', 'device_type', 'status'
  ],
  Comments: [
    'comment_id', 'parent_post_id', 'timestamp', 'name', 'comment_text', 'email',
    'phone_whatsapp', 'city', 'profession_role', 'company_or_business', 'status'
  ],
  AudioSessions: [
    'id', 'title', 'description', 'speaker', 'drive_file_id', 'drive_url', 'media_url',
    'duration', 'pin_code', 'status', 'created_at'
  ]
};

/** Kept read-only for sites that still have the older three-tab sheet. */
var LEGACY_SHEETS = {
  Announcements: ['id', 'title', 'body', 'date', 'is_pinned'],
  Events: ['id', 'title', 'date', 'time', 'location_or_link', 'description']
};

var ADMIN_PIN_PROPERTY = 'ADMIN_PIN';
var AUDIO_FOLDER_PROPERTY = 'AUDIO_DRIVE_FOLDER_ID';
var EVENT_TYPES = [
  'brochure_reaction', 'brochure_card_tap', 'reel_skipped', 'sunday_cta_click',
  'whatsapp_click', 'youtube_click', 'audio_play', 'video_play'
];
var INTERESTS = ['Sunday Meditation', 'Healing', 'Audio Library', 'Community'];

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'get_community';

    if (action === 'get_audios') {
      var audios = readRows_('AudioSessions').filter(function (row) {
        return row.status !== 'hidden';
      });
      return json_({ ok: true, audios: audios.map(publicAudio_), source: 'sheets' });
    }

    if (action === 'get_community') {
      var publicPosts = readRows_('Posts').filter(function (row) {
        return row.status !== 'hidden';
      });
      var publicComments = readRows_('Comments').filter(function (row) {
        return row.status !== 'hidden';
      });
      return json_({
        ok: true,
        posts: publicPosts.map(publicPost_),
        comments: publicComments.map(publicComment_),
        source: 'sheets'
      });
    }

    if (action === 'get_announcements_events') {
      var siteAnnouncements = readOptional_('Announcements');
      var siteEvents = readOptional_('Events');
      return json_({
        ok: true,
        announcements: sortAnnouncements_(siteAnnouncements),
        events: sortEvents_(siteEvents),
        source: (siteAnnouncements.length || siteEvents.length) ? 'sheets' : 'unconfigured'
      });
    }

    if (action === 'list_posts' || action === 'posts') {
      var posts = readRows_('Posts').filter(function (row) {
        return row.status !== 'hidden';
      });
      return json_({ posts: posts.map(publicPost_), source: 'sheets' });
    }

    if (action === 'list_comments' || action === 'comments') {
      var parentId = clean_((e && e.parameter && e.parameter.parent_post_id) || '', 200);
      var comments = readRows_('Comments').filter(function (row) {
        return row.status !== 'hidden' && (!parentId || row.parent_post_id === parentId);
      });
      return json_({ comments: comments.map(publicComment_), source: 'sheets' });
    }

    if (action === 'list_audio' || action === 'audio') {
      return json_({ sessions: readRows_('AudioSessions').map(publicAudio_), source: 'sheets' });
    }

    if (action === 'list_announcements' || action === 'announcements') {
      var announcements = readOptional_('Announcements');
      return json_({ announcements: sortAnnouncements_(announcements), source: announcements.length ? 'sheets' : 'unconfigured' });
    }

    if (action === 'list_events' || action === 'events') {
      var events = readOptional_('Events');
      return json_({ events: sortEvents_(events), source: events.length ? 'sheets' : 'unconfigured' });
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
    var adminActions = [
      'announcement_create', 'announcement_delete', 'event_create', 'event_delete',
      'audio_create', 'audio_delete', 'audio_sync_drive', 'upsert_audio', 'delete_row'
    ];
    if (adminActions.indexOf(action) >= 0 && !isAdmin_(payload)) return forbidden_();

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (action === 'visitor_event_create') return createVisitorEvent_(payload);
      if (action === 'checkin_create') return createCheckin_(payload);
      if (action === 'post_create' || action === 'create_post') return createPost_(payload);
      if (action === 'comment_create' || action === 'create_comment') return createComment_(payload);
      if (action === 'verify_audio_pin') return verifyAudioPin_(payload);
      if (action === 'audio_create' || action === 'upsert_audio') return upsertAudio_(payload);
      if (action === 'audio_delete') return deleteRow_('AudioSessions', payload.id, 'id');
      if (action === 'delete_row') {
        var allowedSheets = ['AudioSessions', 'Posts', 'Comments', 'SundayCheckins', 'Announcements', 'Events'];
        var requestedSheet = clean_(payload.sheetName, 60);
        if (allowedSheets.indexOf(requestedSheet) < 0) return json_({ error: 'Unknown sheet.' });
        var idHeader = requestedSheet === 'Comments' ? 'comment_id' : requestedSheet === 'VisitorEvents' ? 'event_id' : 'id';
        return deleteRow_(requestedSheet, payload.id, idHeader);
      }
      if (action === 'audio_sync_drive') return syncAudioDrive_(payload);
      if (action === 'announcement_create') return createAnnouncement_(payload);
      if (action === 'announcement_delete') return deleteRow_('Announcements', payload.id, 'id');
      if (action === 'event_create') return createEvent_(payload);
      if (action === 'event_delete') return deleteRow_('Events', payload.id, 'id');
      return json_({ error: 'Unknown action' });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return json_({ error: String(error) });
  }
}

/* ------------------------------------------------------------------ *
 * Public writes
 * ------------------------------------------------------------------ */

function createVisitorEvent_(payload) {
  var eventType = clean_(payload.event_type, 60);
  if (EVENT_TYPES.indexOf(eventType) < 0) return json_({ error: 'Unknown event type.' });

  var event = {
    event_id: Utilities.getUuid(),
    timestamp: nowIso_(),
    session_id: clean_(payload.session_id, 120) || 'anonymous',
    event_type: eventType,
    event_detail: clean_(payload.event_detail, 220),
    cards_viewed_count: number_(payload.cards_viewed_count, 0),
    time_on_brochure_sec: number_(payload.time_on_brochure_sec, 0),
    language: clean_(payload.language, 10) === 'hi' ? 'hi' : 'en',
    device_type: clean_(payload.device_type, 20) === 'desktop' ? 'desktop' : 'mobile',
    referrer: clean_(payload.referrer, 500)
  };
  append_(SHEETS.VisitorEvents, event);
  return json_({ success: true, event_id: event.event_id, source: 'sheets' });
}

function createCheckin_(payload) {
  var name = clean_(payload.name, 80);
  var phone = clean_(payload.phone_whatsapp, 60);
  var email = clean_(payload.email, 160);
  if (!name && !phone && !email) {
    return json_({ error: 'Please add your name or a contact detail so we can reply.' });
  }

  var interest = INTERESTS.indexOf(payload.interest_area) >= 0 ? payload.interest_area : 'Sunday Meditation';
  var checkin = {
    id: Utilities.getUuid(),
    timestamp: nowIso_(),
    name: name,
    phone_whatsapp: phone,
    email: email,
    city: clean_(payload.city, 100),
    age_group: clean_(payload.age_group, 60),
    profession_role: clean_(payload.profession_role, 120),
    company_or_business: clean_(payload.company_or_business, 160),
    website_or_linkedin: clean_(payload.website_or_linkedin, 300),
    interest_area: interest,
    referral_source: clean_(payload.referral_source, 160),
    open_to_connect: toBool_(payload.open_to_connect) ? 'TRUE' : 'FALSE',
    language: clean_(payload.language, 10) === 'hi' ? 'hi' : 'en',
    device_type: clean_(payload.device_type, 20) === 'desktop' ? 'desktop' : 'mobile'
  };
  append_(SHEETS.SundayCheckins, checkin);
  return json_({ success: true, source: 'sheets' });
}

function createPost_(payload) {
  var text = clean_(payload.post_text, 4000);
  if (!text) return json_({ error: 'Please write a few words before sharing.' });

  var post = {
    id: Utilities.getUuid(),
    timestamp: nowIso_(),
    name: clean_(payload.name, 80),
    post_text: text,
    email: clean_(payload.email, 160),
    phone_whatsapp: clean_(payload.phone_whatsapp, 60),
    city: clean_(payload.city, 100),
    age_group: clean_(payload.age_group, 60),
    profession_role: clean_(payload.profession_role, 120),
    company_or_business: clean_(payload.company_or_business, 160),
    website_or_linkedin: clean_(payload.website_or_linkedin, 300),
    interests: clean_(payload.interests, 160),
    referral_source: clean_(payload.referral_source, 160),
    open_to_connect: toBool_(payload.open_to_connect) ? 'TRUE' : 'FALSE',
    language_used: clean_(payload.language_used, 10) === 'hi' ? 'hi' : 'en',
    device_type: clean_(payload.device_type, 20) === 'desktop' ? 'desktop' : 'mobile',
    status: 'published'
  };
  append_(SHEETS.Posts, post);
  return json_({ post: publicPost_(post), success: true, source: 'sheets' });
}

function createComment_(payload) {
  var text = clean_(payload.comment_text || payload.message, 2000);
  if (!text) return json_({ error: 'Please write a reply before sharing.' });

  var parentId = clean_(payload.parent_post_id || payload.post_id, 200);
  if (parentId && !rowExists_('Posts', parentId, 'id')) {
    return json_({ error: 'That post is no longer available.' });
  }

  var comment = {
    comment_id: Utilities.getUuid(),
    parent_post_id: parentId,
    timestamp: nowIso_(),
    name: clean_(payload.name, 80),
    comment_text: text,
    email: clean_(payload.email, 160),
    phone_whatsapp: clean_(payload.phone_whatsapp, 60),
    city: clean_(payload.city, 100),
    profession_role: clean_(payload.profession_role, 120),
    company_or_business: clean_(payload.company_or_business, 160),
    status: 'published'
  };
  append_(SHEETS.Comments, comment);
  return json_({ comment: publicComment_(comment), success: true, source: 'sheets' });
}

/* ------------------------------------------------------------------ *
 * Audio + legacy admin writes
 * ------------------------------------------------------------------ */

function verifyAudioPin_(payload) {
  var id = clean_(payload.id, 200);
  var pin = clean_(payload.pin || payload.pin_code, 40);
  if (!id || !pin) return json_({ ok: false, error: 'Enter the PIN.' });

  var row = findRowByHeader_('AudioSessions', 'id', id);
  if (!row) return json_({ ok: false, error: 'This recording is not available.' });

  var expectedPin = clean_(row.pin_code, 40);
  if (!expectedPin || expectedPin !== pin) {
    return json_({ ok: false, error: 'That PIN did not match. Please try again.' });
  }

  var driveId = clean_(row.drive_file_id, 200);
  return json_({
    ok: true,
    title: unescapeCell_(String(row.title || '')),
    audio_preview_url: 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(driveId),
    source: 'sheets'
  });
}

function upsertAudio_(payload) {
  var id = clean_(payload.id, 200);
  var driveLink = clean_(payload.raw_drive_link || payload.drive_url || payload.driveUrl, 500);
  var parsedDrive = driveLink ? driveIdFromUrl_(driveLink) : null;
  var pin = clean_(payload.pin_code || payload.pin, 40);
  var status = clean_(payload.status, 40) || 'published';

  var existing = id ? findRowByHeader_('AudioSessions', 'id', id) : null;
  if (!existing && parsedDrive) existing = findRowByHeader_('AudioSessions', 'drive_file_id', parsedDrive.id);

  var title = clean_(payload.title, 160) || (existing ? unescapeCell_(String(existing.title || '')) : '');
  if (!title) return json_({ error: 'Title is required.' });
  if (!parsedDrive && !existing) return json_({ error: 'Add a Google Drive audio link.' });

  var audio = {
    id: existing ? unescapeCell_(String(existing.id)) : Utilities.getUuid(),
    title: title,
    description: clean_(payload.description, 4000) || (existing ? unescapeCell_(String(existing.description || '')) : ''),
    speaker: clean_(payload.speaker, 120) || (existing ? unescapeCell_(String(existing.speaker || '')) : ''),
    drive_file_id: parsedDrive ? parsedDrive.id : (existing ? clean_(existing.drive_file_id, 200) : ''),
    drive_url: parsedDrive ? parsedDrive.url : (existing ? clean_(existing.drive_url, 500) : ''),
    media_url: parsedDrive ? parsedDrive.downloadUrl : (existing ? clean_(existing.media_url, 500) : ''),
    duration: clean_(payload.duration, 40) || (existing ? clean_(existing.duration, 40) : ''),
    pin_code: pin || (existing ? clean_(existing.pin_code, 40) : ''),
    status: status,
    created_at: existing ? clean_(existing.created_at, 40) || nowIso_() : nowIso_()
  };

  if (existing) {
    var sheet = sheet_('AudioSessions');
    sheet.getRange(existing.__row, 1, 1, SHEETS.AudioSessions.length).setValues([[
      escapeCell_(audio.id), escapeCell_(audio.title), escapeCell_(audio.description),
      escapeCell_(audio.speaker), escapeCell_(audio.drive_file_id), escapeCell_(audio.drive_url),
      escapeCell_(audio.media_url), escapeCell_(audio.duration), escapeCell_(audio.pin_code),
      escapeCell_(audio.status), escapeCell_(audio.created_at)
    ]]);
  } else {
    append_(SHEETS.AudioSessions, audio);
  }

  return json_({ ok: true, audio: publicAudio_(audio), success: true, source: 'sheets' });
}

function driveIdFromUrl_(value) {
  var url = clean_(value, 500);
  var match = url.match(/\/d\/([A-Za-z0-9_-]{10,})/);
  if (!match) match = url.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
  if (!match) match = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{10,})/);
  var id = match ? match[1] : '';
  if (!id) return null;
  return {
    id: id,
    url: 'https://drive.google.com/file/d/' + id + '/view',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=' + id
  };
}

// Legacy action name retained for older deployments.
function createAudio_(payload) {
  return upsertAudio_(payload);
}

function syncAudioDrive_(payload) {
  var folderId = clean_(
    PropertiesService.getScriptProperties().getProperty(AUDIO_FOLDER_PROPERTY) || payload.folderId,
    200
  );
  if (!folderId) return json_({ error: 'Set the AUDIO_DRIVE_FOLDER_ID Script Property first.' });

  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  var count = 0;
  while (files.hasNext()) {
    var file = files.next();
    var mime = String(file.getMimeType() || '');
    if (mime.indexOf('audio/') !== 0 && !/\.(mp3|m4a|wav|ogg)$/i.test(file.getName())) continue;

    var driveId = file.getId();
    var existingRow = findRowByHeader_('AudioSessions', 'drive_file_id', driveId);
    var values = [[
      existingRow ? unescapeCell_(String(existingRow.id)) : Utilities.getUuid(),
      escapeCell_(file.getName()),
      existingRow ? escapeCell_(String(existingRow.description || '')) : '',
      existingRow ? escapeCell_(String(existingRow.speaker || '')) : '',
      driveId,
      file.getUrl(),
      'https://drive.google.com/uc?export=download&id=' + driveId,
      existingRow ? clean_(existingRow.duration, 40) : '',
      existingRow ? clean_(existingRow.pin_code, 40) : '',
      existingRow ? clean_(existingRow.status, 40) || 'published' : 'published',
      existingRow ? String(existingRow.created_at || nowIso_()) : nowIso_()
    ]];

    if (existingRow) {
      var sheet = sheet_('AudioSessions');
      sheet.getRange(existingRow.__row, 1, 1, SHEETS.AudioSessions.length).setValues(values);
    } else {
      sheet_('AudioSessions').appendRow(values);
    }
    count += 1;
  }
  return json_({ success: true, synced: count, source: 'sheets' });
}

function createAnnouncement_(payload) {
  ensureOptional_('Announcements');
  var title = clean_(payload.title, 160);
  var body = clean_(payload.body, 4000);
  if (!title || !body) return json_({ error: 'Title and body are required.' });

  var announcement = {
    id: Utilities.getUuid(),
    title: title,
    body: body,
    date: clean_(payload.date, 40) || nowIso_(),
    is_pinned: toBool_(payload.is_pinned)
  };
  append_(LEGACY_SHEETS.Announcements, announcement, announcement.is_pinned ? 'TRUE' : 'FALSE');
  return json_({ announcement: announcement, success: true, source: 'sheets' });
}

function createEvent_(payload) {
  ensureOptional_('Events');
  var title = clean_(payload.title, 160);
  if (!title) return json_({ error: 'Title is required.' });

  var event = {
    id: Utilities.getUuid(),
    title: title,
    date: clean_(payload.date, 80) || nowIso_(),
    time: clean_(payload.time, 40) || '2 Hrs',
    location_or_link: clean_(payload.location_or_link, 300),
    description: clean_(payload.description, 4000)
  };
  append_(LEGACY_SHEETS.Events, event);
  return json_({ event: event, success: true, source: 'sheets' });
}

function deleteRow_(name, id, idHeader) {
  var sheet = sheet_(name, true);
  var row = findRowByHeader_(name, idHeader || 'id', clean_(id, 200));
  if (!row) return json_({ error: 'Row not found.' });
  sheet.deleteRow(row.__row);
  return json_({ success: true, source: 'sheets' });
}

/* ------------------------------------------------------------------ *
 * Public response allowlists
 * ------------------------------------------------------------------ */

function publicPost_(row) {
  return {
    id: String(row.id || ''),
    timestamp: String(row.timestamp || ''),
    name: unescapeCell_(String(row.name || '')),
    post_text: unescapeCell_(String(row.post_text || '')),
    city: unescapeCell_(String(row.city || '')),
    profession_role: unescapeCell_(String(row.profession_role || '')),
    interests: unescapeCell_(String(row.interests || '')),
    status: String(row.status || 'published')
  };
}

function publicComment_(row) {
  var comment = {
    comment_id: String(row.comment_id || row.id || ''),
    parent_post_id: String(row.parent_post_id || ''),
    timestamp: String(row.timestamp || ''),
    name: unescapeCell_(String(row.name || '')),
    comment_text: unescapeCell_(String(row.comment_text || '')),
    city: unescapeCell_(String(row.city || '')),
    profession_role: unescapeCell_(String(row.profession_role || '')),
    status: String(row.status || 'published')
  };
  // Backwards-compatible aliases for the older single-comment feed.
  comment.id = comment.comment_id;
  comment.message = comment.comment_text;
  comment.created_at = comment.timestamp;
  return comment;
}

function publicAudio_(row) {
  var hasPin = Boolean(clean_(row.pin_code, 40));
  return {
    id: String(row.id || ''),
    title: unescapeCell_(String(row.title || '')),
    description: unescapeCell_(String(row.description || '')),
    speaker: unescapeCell_(String(row.speaker || '')),
    created_at: String(row.created_at || ''),
    media_url: hasPin ? '' : String(row.media_url || ''),
    duration: String(row.duration || ''),
    is_locked: hasPin,
    status: String(row.status || 'published')
  };
}

/* ------------------------------------------------------------------ *
 * Sheet helpers
 * ------------------------------------------------------------------ */

function append_(headers, record, overrideIsPinned) {
  var values = headers.map(function (header) {
    if (header === 'is_pinned') return overrideIsPinned === undefined ? (record[header] ? 'TRUE' : 'FALSE') : overrideIsPinned;
    var value = record[header];
    if (typeof value === 'number') return value;
    return escapeCell_(value == null ? '' : value);
  });
  sheet_(nameForHeaders_(headers)).appendRow(values);
}

function nameForHeaders_(headers) {
  for (var name in SHEETS) {
    if (SHEETS[name] === headers || sameHeaders_(SHEETS[name], headers)) return name;
  }
  for (var legacy in LEGACY_SHEETS) {
    if (LEGACY_SHEETS[legacy] === headers || sameHeaders_(LEGACY_SHEETS[legacy], headers)) return legacy;
  }
  return '';
}

function sameHeaders_(a, b) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function sheet_(name, optional) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var headers = SHEETS[name] || LEGACY_SHEETS[name];
  if (!headers) throw new Error('Unknown sheet: ' + name);

  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    if (optional) return null;
    sheet = spreadsheet.insertSheet(name);
  }

  var width = Math.max(sheet.getLastColumn(), headers.length);
  var current = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  headers.forEach(function (header, index) {
    if (current[index] !== header) sheet.getRange(1, index + 1).setValue(header);
  });
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function ensureOptional_(name) {
  if (!sheet_(name, true)) sheet_(name, false);
}

function readRows_(name) {
  var sheet = sheet_(name, false);
  if (!sheet) return [];
  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  var headers = values[0];
  return values.slice(1).map(function (row) {
    var record = {};
    headers.forEach(function (header, index) {
      if (header) record[header] = unescapeCell_(row[index] || '');
    });
    if (record.is_pinned !== undefined) record.is_pinned = toBool_(record.is_pinned);
    record.__row = 0;
    return record;
  }).filter(function (row) {
    return Object.keys(row).some(function (key) {
      return key !== '__row' && Boolean(row[key]);
    });
  });
}

function readOptional_(name) {
  var sheet = sheet_(name, true);
  if (!sheet) return [];
  return readRows_(name);
}

function findRowByHeader_(name, header, target) {
  var rows = readRows_(name);
  var sheet = sheet_(name, true);
  var values = sheet.getDataRange().getDisplayValues();
  var headers = values[0];
  var column = headers.indexOf(header);
  if (column < 0 || !target) return null;

  for (var i = 0; i < rows.length; i += 1) {
    if (unescapeCell_(String(values[i + 1][column] || '')) === target) {
      rows[i].__row = i + 2;
      return rows[i];
    }
  }
  return null;
}

function rowExists_(name, id, idHeader) {
  return Boolean(findRowByHeader_(name, idHeader || 'id', id));
}

function newestFirst_(rows, key) {
  return rows.slice().sort(function (a, b) {
    return String(b[key] || '').localeCompare(String(a[key] || ''));
  });
}

function sortAnnouncements_(rows) {
  return rows.slice().sort(function (a, b) {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return String(b.date || '').localeCompare(String(a.date || ''));
  });
}

function sortEvents_(rows) {
  return rows.slice().sort(function (a, b) {
    return String(a.date || '').localeCompare(String(b.date || ''));
  });
}

function nowIso_() {
  return new Date().toISOString();
}

function number_(value, fallback) {
  var parsed = Number(value);
  return isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
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
  return clean_(payload && (payload.adminKey || payload.adminPin), 200) === expected;
}

function forbidden_() {
  return json_({ error: 'Admin PIN not accepted.' });
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}

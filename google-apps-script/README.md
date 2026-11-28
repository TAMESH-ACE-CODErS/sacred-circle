# Sacred Circle community sheet — free Google Sheet backend

One Google Sheet, one Apps Script web app, five tabs, zero paid services. The browser never calls Apps Script directly: it calls `/api/site`, and the Vercel/dev bridge owns the sheet URL and the admin PIN. Organizers can open the Sheet directly to read, moderate or edit every entry.

## 1. Create the Sheet

1. Create a Google Sheet. Remove the default `Sheet1` tab if it is not needed.
2. Open **Extensions → Apps Script**, replace `Code.gs` with the file in this folder, and save.
3. On first run the script creates or repairs these exact tabs and headers:

| Tab | Exact headers |
| --- | --- |
| `VisitorEvents` | `event_id` · `timestamp` · `session_id` · `event_type` · `event_detail` · `cards_viewed_count` · `time_on_brochure_sec` · `language` · `device_type` · `referrer` |
| `SundayCheckins` | `id` · `timestamp` · `name` · `phone_whatsapp` · `email` · `city` · `age_group` · `profession_role` · `company_or_business` · `website_or_linkedin` · `interest_area` · `referral_source` · `open_to_connect` · `language` · `device_type` |
| `Posts` | `id` · `timestamp` · `name` · `post_text` · `email` · `phone_whatsapp` · `city` · `age_group` · `profession_role` · `company_or_business` · `website_or_linkedin` · `interests` · `referral_source` · `open_to_connect` · `language_used` · `device_type` · `status` |
| `Comments` | `comment_id` · `parent_post_id` · `timestamp` · `name` · `comment_text` · `email` · `phone_whatsapp` · `city` · `profession_role` · `company_or_business` · `status` |
| `AudioSessions` | `id` · `title` · `description` · `speaker` · `drive_file_id` · `drive_url` · `media_url` · `duration` · `pin_code` · `status` · `created_at` |

Legacy `Announcements` and `Events` tabs are read and written when present, so older deployments keep working. They are optional.

## 2. Set the admin PIN

The site uses `VITE_ADMIN_PIN` (or its alias `VITE_ADMIN_KEY`) for the `/admin` tab. Admin requests send the value as `adminKey`; the older `adminPin` field is still accepted. For a second layer of protection, set the same value as an Apps Script Script Property:

- Property: `ADMIN_PIN`
- Value: the same key used in `VITE_ADMIN_PIN`

The browser never stores the PIN. It is checked again by `/api/site` before any add/delete action reaches the Sheet.

Optional audio sync: set Script Property `AUDIO_DRIVE_FOLDER_ID` to a Drive folder containing `.mp3`, `.m4a`, `.wav` or `.ogg` files. `audio_sync_drive` adds new files and refreshes matching rows without duplicating them.

## 3. Deploy the web app

1. **Deploy → New deployment → Web app**
2. Execute as: **Me**
3. Who has access: **Anyone**
4. Copy the `/exec` URL.

## 4. Connect the site

Set these in `.env.local` and in Vercel **Project Settings → Environment Variables**:

```
VITE_SHEET_API_URL=https://script.google.com/macros/s/YOUR_ID/exec
VITE_ADMIN_PIN=your-short-admin-passcode
# VITE_ADMIN_KEY=your-short-admin-passcode
```

Restart `npm run dev` after changing `.env.local`. `VITE_SACRED_SHEET_URL` is still accepted as a fallback for older deployments, but `VITE_SHEET_API_URL` is the primary name.

## Proxied endpoints (`/api/site`)

| Call | Purpose |
| --- | --- |
| `GET ?action=get_audios` | Public audio sessions with title, date, speaker and duration |
| `GET ?action=get_community` | Public wall posts and all replies |
| `GET ?action=get_announcements_events` | Announcements and events in one call |
| `GET ?action=list_posts` / `list_comments` / `list_audio` | Legacy aliases for older deployments |
| `POST { action: "visitor_event_create", ... }` | Fire-and-forget visitor event |
| `POST { action: "checkin_create", ... }` | Sunday check-in; private fields stay in the Sheet |
| `POST { action: "create_post", ... }` | Community wall post; every profile field is optional |
| `POST { action: "create_comment", ... }` | Reply to a wall post |
| `POST { action: "verify_audio_pin", id, pin }` | Returns a Drive preview URL only for the correct PIN |
| `POST { action: "upsert_audio", adminKey, ... }` | Admin add / replace Drive link / change PIN |
| `POST { action: "delete_row", adminKey, sheetName, id }` | Admin delete from an allowed tab |
| `POST { action: "audio_sync_drive", adminKey }` | Sync audio files from Drive |
| `POST { action: "announcement_create", adminKey, ... }` | Legacy admin add |
| `POST { action: "event_create", adminKey, ... }` | Legacy admin add |

The serverless bridge sends every POST to Apps Script with `Content-Type: text/plain;charset=utf-8`, which avoids the Apps Script CORS preflight. If `VITE_SHEET_API_URL` is missing, public sections show a friendly setup note instead of a broken feed.

Visitor logging is deliberately fire-and-forget: a slow or offline Sheet never blocks a click, reaction, card tap or page transition.

## Privacy

Public GET responses are built from explicit allowlists. `email`, `phone_whatsapp`, `company_or_business`, `website_or_linkedin`, `drive_file_id`, `drive_url` and `pin_code` are **never** returned to the browser. PIN-protected audio also hides `media_url` until the correct PIN is submitted. Visible posts and replies expose only `id`, `timestamp`, `name`, `post_text` / `comment_text`, `city`, `profession_role`, `interests` and `status`.

Admin actions require both the site PIN and, when configured, the Apps Script `ADMIN_PIN` property.

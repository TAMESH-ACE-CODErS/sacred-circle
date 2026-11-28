# Sacred Circle community sheet — free Google Sheet backend

One Google Sheet, one Apps Script web app, three tabs. No paid API, no database, no visitor login. Organizers can open the Sheet directly to read, moderate or edit every entry.

## 1. Create the Sheet

1. Make a Google Sheet with three tabs: `Comments`, `Announcements`, `Events`.
2. Open **Extensions → Apps Script**, replace `Code.gs` with the file in this folder, and save.
3. The script creates or repairs these exact headers on first run:

| Tab | Headers |
| --- | --- |
| `Comments` | `name` · `message` · `created_at` |
| `Announcements` | `id` · `title` · `body` · `date` · `is_pinned` |
| `Events` | `id` · `title` · `date` · `time` · `location_or_link` · `description` |

`time` defaults to `2 Hrs`. `is_pinned` is written as `TRUE`/`FALSE`.

## 2. Set the admin PIN

The site uses `VITE_ADMIN_PIN` for the `/admin` tab. For a second layer of protection, set the same value as an Apps Script Script Property:

- Property: `ADMIN_PIN`
- Value: the same PIN used in `VITE_ADMIN_PIN`

The browser never stores the PIN. It is checked again by `/api/site` before any add/delete action reaches the Sheet.

## 3. Deploy the web app

1. **Deploy → New deployment → Web app**
2. Execute as: **Me**
3. Who has access: **Anyone**
4. Copy the `/exec` URL.

## 4. Connect the site

Set these in `.env.local` and in Vercel **Project Settings → Environment Variables**:

```
VITE_SACRED_SHEET_URL=https://script.google.com/macros/s/YOUR_ID/exec
VITE_ADMIN_PIN=your-short-admin-passcode
```

Restart `npm run dev` after changing `.env.local`.

## Proxied endpoints (`/api/site`)

| Call | Action |
| --- | --- |
| `GET ?action=list_comments` | Public comments, newest first |
| `GET ?action=list_announcements` | Announcements, pinned first, then newest |
| `GET ?action=list_events` | Events, earliest date first |
| `POST { action: "comment_create", name, message }` | Public comment |
| `POST { action: "announcement_create", adminPin, title, body, date, is_pinned }` | Admin add |
| `POST { action: "announcement_delete", adminPin, id }` | Admin delete |
| `POST { action: "event_create", adminPin, title, date, time, location_or_link, description }` | Admin add |
| `POST { action: "event_delete", adminPin, id }` | Admin delete |

The serverless bridge sends every POST to Apps Script with `Content-Type: text/plain;charset=utf-8`, which avoids the Apps Script CORS preflight. If `VITE_SACRED_SHEET_URL` is missing, public sections show a friendly setup note instead of a broken feed.

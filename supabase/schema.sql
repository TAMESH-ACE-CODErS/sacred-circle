-- Sacred Circle — Supabase PostgreSQL schema
-- Run once in the Supabase SQL editor (or `supabase db push`).
-- Design goal: visitors never sign in. Only whitelisted Gmail admins can write.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  message_en  text not null,
  message_hi  text,
  link_url    text,
  is_active   boolean not null default false,
  event_date  timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.materials (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text not null default '',
  media_type    text not null check (media_type in ('video', 'audio')),
  media_url     text not null,
  thumbnail_url text not null default '',
  pin_code      text,                       -- null = public, set = locked
  category      text not null default 'Meditation',
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  review_text   text not null,
  avatar_key    text not null default 'reviewerF'
                check (avatar_key in ('reviewerM','reviewerF','reviewerMF')),
  is_visible    boolean not null default true,
  sort_order    int not null default 0
);

create table if not exists public.admin_allowlist (
  email text primary key
);

-- ---------------------------------------------------------------------------
-- 2. updated_at trigger for site_settings
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
before update on public.site_settings
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Admin check — SECURITY DEFINER so anon never needs SELECT on allowlist
--    Equivalent to: auth.jwt() ->> 'email' IN (SELECT email FROM admin_allowlist)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_allowlist a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.site_settings   enable row level security;
alter table public.announcements   enable row level security;
alter table public.materials       enable row level security;
alter table public.reviews         enable row level security;
alter table public.admin_allowlist enable row level security;

-- Public read: only live, visible content.
drop policy if exists "public reads site settings" on public.site_settings;
create policy "public reads site settings"
  on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "public reads active announcements" on public.announcements;
create policy "public reads active announcements"
  on public.announcements for select to anon, authenticated using (is_active);

drop policy if exists "public reads visible reviews" on public.reviews;
create policy "public reads visible reviews"
  on public.reviews for select to anon, authenticated using (is_visible);

-- No public policy on materials: the sanitized view below is the only read path.
drop policy if exists "public reads published materials" on public.materials;

-- Admin write access (INSERT / UPDATE / DELETE) on every content table.
drop policy if exists "admin writes site settings" on public.site_settings;
create policy "admin writes site settings"
  on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin writes announcements" on public.announcements;
create policy "admin writes announcements"
  on public.announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin writes materials" on public.materials;
create policy "admin writes materials"
  on public.materials for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin writes reviews" on public.reviews;
create policy "admin writes reviews"
  on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin reads allowlist" on public.admin_allowlist;
create policy "admin reads allowlist"
  on public.admin_allowlist for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. Sanitized public view — PIN and locked media URLs never reach the browser
-- ---------------------------------------------------------------------------

create or replace view public.public_materials as
select
  m.id,
  m.title,
  m.description,
  m.media_type,
  case when m.pin_code is null then m.media_url else null end as media_url,
  m.thumbnail_url,
  m.category,
  m.is_published,
  m.created_at,
  (m.pin_code is not null) as is_locked
from public.materials m
where m.is_published;

grant select on public.public_materials to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.announcements to anon, authenticated;
grant select on public.reviews to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. Server-side PIN verification RPC
--    Returns the real media_url only when the PIN matches. Wrong PIN reveals
--    nothing and returns an empty set, so no PIN data is sent to the client.
-- ---------------------------------------------------------------------------

create or replace function public.verify_material_pin(material_id uuid, input_pin text)
returns table (media_url text, media_type text, title text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select m.media_url, m.media_type, m.title
  from public.materials m
  where m.id = material_id
    and m.is_published
    and m.pin_code is not null
    and m.pin_code = input_pin
  limit 1;
end;
$$;

revoke all on function public.verify_material_pin(uuid, text) from public;
grant execute on function public.verify_material_pin(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. Seed data
-- ---------------------------------------------------------------------------

insert into public.admin_allowlist (email) values
  ('sacredcircle45@gmail.com'),
  ('developer.gmail@gmail.com')          -- replace with your DEV_ADMIN_EMAIL
on conflict (email) do nothing;

insert into public.site_settings (key, value) values
  ('nav_headers', to_jsonb(array[
    jsonb_build_object('label','Home','href','/'),
    jsonb_build_object('label','About','href','/about'),
    jsonb_build_object('label','Sunday Meditation','href','/sunday-meditation'),
    jsonb_build_object('label','Materials','href','/materials'),
    jsonb_build_object('label','Reviews','href','/reviews'),
    jsonb_build_object('label','Community','href','/community')
  ])),
  ('sunday_session_time', '"Every Sunday, 4:00 PM IST"'::jsonb),
  ('contact_links', jsonb_build_object(
    'youtube','https://www.youtube.com/@sacredcircle8336',
    'whatsapp','https://chat.whatsapp.com/ItD67ZNn9J0GJtw5Fw7baI?s=cl&p=a&iam=2',
    'email','sacredcircle45@gmail.com'
  ))
on conflict (key) do nothing;

-- Sample locked item so the PIN flow is testable immediately.
-- Replace or delete this row from the admin board before going live.
insert into public.materials (title, description, media_type, media_url, thumbnail_url, pin_code, category, is_published) values
  ('Sunday Meditation Recording — Private', 'Sample locked item for the PIN flow.', 'video',
   'https://www.youtube.com/embed/fbtixdu4RUY',
   'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200',
   '2468', 'Sunday Recordings', true)
on conflict do nothing;

insert into public.announcements (message_en, message_hi, link_url, is_active) values
  ('Free Sunday meditation — every Sunday at 4:00 PM IST. Everyone is welcome.',
   'हर रविवार शाम 4:00 बजे (IST) निःशुल्क ध्यान — सभी का स्वागत है।',
   'https://chat.whatsapp.com/ItD67ZNn9J0GJtw5Fw7baI?s=cl&p=a&iam=2',
   true);

-- Reviewer avatars use the local media manifest keys:
-- reviewerMF -> reviewerMF-1.jpg, reviewerF -> reviewerF-1..4.jpg
insert into public.reviews (reviewer_name, review_text, avatar_key, is_visible, sort_order) values
  ('Chai, USA', 'I have had profound changes after joining Sacred Circle. I had problem of skin breakouts since the age of 4 years... After joining Sacred Circle, I used healing techniques given by sir and mam. And believe it or not, my skin issue vanished completely!', 'reviewerMF', true, 1),
  ('Bhagyashree Kulkarni, Thane', 'I joined Sacred Circle in Dec 23. I always felt a sense of peacefulness after meditation. By the end of the DNA activation meditation, I felt 50% relief... all my stiffness and pain just vanished. Thank you Sir and Leena madam.', 'reviewerF', true, 2),
  ('Sangita Bahenwar, Nagpur', 'जब से इस ग्रुप की स्थापना हुई है उस के पहले से मैं लीना माँ से जुड़ी हूं| आप से जुड़ने के बाद मेरी आध्यात्मिक यात्रा में निश्चित ही बहुत ग्रोथ हुई है|', 'reviewerF', true, 3),
  ('आशिमा भारद्वाज, मेरठ', 'मैंने सेक्रेड सर्कल नवंबर 2023 से ज्वाइन किया... सर द्वारा बताए हुए गाइडेड मेडिटेशन करके मेरे लाइफ में बहुत सकारात्मक बदलाव देखने को मिल रहे हैं।', 'reviewerF', true, 4),
  ('दीपा काळे', 'सर्व प्रथम मैं आप दोनों का बहुत बहुत आभार व्यक्त करना चाहती हूं क्योकी आपने हमें मेडिटेशन के बारे में बहुत अच्छी जानकारी दी|', 'reviewerF', true, 5),
  ('वैशाली बोरकर, नागपुर', 'सन 2017 से हम मँडम और सर से जुड़े हैं। पहले मुझमे बहोत निगेटिव सोच थी... जब से मँडम और सर से जुड़े हैं सारी निगेटिव सोच चली गई और पँजिटीव सोच आ गई।', 'reviewerF', true, 6)
on conflict do nothing;

-- Note: full, unabridged original review text is kept in src/config/reviews.ts
-- so the site still works before Supabase is connected. The seeds above are
-- short previews; edit them in the admin board to publish the full text.

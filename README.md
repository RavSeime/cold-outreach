# Cold Outreach Dashboard

A simple dashboard for tracking cold outreach calls and emails across your team. Team members check if a contact has been reached before, and log new ones.

## Setup

### 1. Supabase Database

Create a new Supabase project at [supabase.com](https://supabase.com).

In your Supabase SQL editor, run:

```sql
create table outreaches (
  id uuid primary key default gen_random_uuid(),
  phone text,
  email text,
  created_at timestamptz not null default now(),
  constraint at_least_one_contact check (
    phone is not null or email is not null
  )
);

create index on outreaches (phone);
create index on outreaches (email);
```

### 2. Environment Variables

Copy your Supabase URL and anon key from the project settings.

Edit `.env` and add:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Usage

1. **Enter Contact Info** — Type phone number and/or email
2. **Check** — App queries the database for matches
3. **If Found** — Shows when it was contacted before
4. **If Not Found** — Option to add it to the database
5. **View History** — See all logged outreaches (collapsed by default)

## Notes

- At least one of phone or email is required per entry
- No authentication needed (internal tool)
- All team members share the same database
- Data is timestamped automatically

## Tech Stack

- React + Vite
- Supabase (PostgreSQL)
- Plain CSS

-- Companies table
create table companies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  website_url text not null,
  linkedin_url text,
  industry text,
  logo_url text,
  status text default 'idle' check (status in ('idle', 'researching', 'ready', 'error')),
  latest_signal text,
  last_researched_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Reports table
create table reports (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  overview text,
  recent_news jsonb,
  website_signals text,
  hiring_signals text,
  key_intelligence jsonb,
  strategic_summary text,
  raw_data jsonb,
  created_at timestamp with time zone default now()
);

-- Row level security
alter table companies enable row level security;
alter table reports enable row level security;

-- RLS policies - users can only see their own data
create policy "Users can manage their own companies"
  on companies for all
  using (auth.uid() = user_id);

create policy "Users can manage their own reports"
  on reports for all
  using (auth.uid() = user_id);

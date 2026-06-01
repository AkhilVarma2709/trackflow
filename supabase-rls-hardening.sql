-- Optional hardening: replace broad policies with explicit per-action policies.
-- Run this after the companies and reports tables exist.

drop policy if exists "Users can manage their own companies" on companies;
drop policy if exists "Users can manage their own reports" on reports;

drop policy if exists "Users can select their own companies" on companies;
drop policy if exists "Users can insert their own companies" on companies;
drop policy if exists "Users can update their own companies" on companies;
drop policy if exists "Users can delete their own companies" on companies;

drop policy if exists "Users can select their own reports" on reports;
drop policy if exists "Users can insert their own reports" on reports;
drop policy if exists "Users can update their own reports" on reports;
drop policy if exists "Users can delete their own reports" on reports;

create policy "Users can select their own companies"
  on companies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own companies"
  on companies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own companies"
  on companies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own companies"
  on companies for delete
  using (auth.uid() = user_id);

create policy "Users can select their own reports"
  on reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports"
  on reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reports"
  on reports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on reports for delete
  using (auth.uid() = user_id);

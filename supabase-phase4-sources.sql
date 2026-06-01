alter table reports
add column if not exists linkedin_signals text,
add column if not exists twitter_signals text;

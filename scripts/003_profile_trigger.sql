-- AgriLink Profile Auto-Creation Trigger
-- Automatically creates a profile when a user signs up

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    role
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'phone', null),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'consumer')
  )
  on conflict (id) do nothing;

  -- If the user registered as a producer, create a producer_profiles record
  IF coalesce((new.raw_user_meta_data ->> 'role')::text, 'consumer') = 'producer' THEN
    INSERT INTO public.producer_profiles (user_id, business_name, description, created_at)
    VALUES (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'business_name', new.raw_user_meta_data ->> 'full_name'),
      coalesce(new.raw_user_meta_data ->> 'description', null),
      now()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  return new;
end;
$$;

-- Drop existing trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

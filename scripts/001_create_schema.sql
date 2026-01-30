-- AgriLink Database Schema
-- Complete schema for agricultural marketplace connecting producers and consumers in Senegal

-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
create type user_role as enum ('consumer', 'producer', 'admin');
create type order_status as enum ('pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled');
create type payment_status as enum ('pending', 'processing', 'completed', 'failed', 'refunded');
create type payment_method as enum ('orange_money', 'wave', 'free_money', 'cash');
create type product_category as enum ('cereales', 'legumes', 'fruits', 'viande', 'poisson', 'produits_laitiers', 'epices', 'autres');
create type product_unit as enum ('kg', 'g', 'piece', 'litre', 'botte', 'sac', 'panier');

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role user_role default 'consumer',
  address text,
  city text default 'Dakar',
  region text default 'Dakar',
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  is_verified boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- PRODUCER PROFILES (additional info for producers)
-- ============================================
create table if not exists public.producer_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  description text,
  cover_image_url text,
  is_certified_bio boolean default false,
  certification_document_url text,
  total_sales integer default 0,
  total_revenue decimal(12, 2) default 0,
  rating decimal(3, 2) default 0,
  review_count integer default 0,
  ussd_code text unique, -- For USSD access without smartphone
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  producer_id uuid not null references public.producer_profiles(id) on delete cascade,
  name text not null,
  description text,
  category product_category not null,
  price decimal(10, 2) not null,
  unit product_unit not null default 'kg',
  stock_quantity decimal(10, 2) default 0,
  min_order_quantity decimal(10, 2) default 1,
  image_url text,
  images text[] default array[]::text[],
  is_bio boolean default false,
  is_available boolean default true,
  harvest_date date,
  expiry_date date,
  view_count integer default 0,
  order_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  consumer_id uuid not null references public.profiles(id) on delete cascade,
  producer_id uuid not null references public.producer_profiles(id) on delete cascade,
  status order_status default 'pending',
  subtotal decimal(10, 2) not null,
  delivery_fee decimal(10, 2) default 0,
  total decimal(10, 2) not null,
  delivery_address text,
  delivery_city text,
  delivery_latitude decimal(10, 8),
  delivery_longitude decimal(11, 8),
  delivery_notes text,
  estimated_delivery timestamp with time zone,
  actual_delivery timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete set null,
  product_name text not null, -- Snapshot of product name at time of order
  product_price decimal(10, 2) not null, -- Snapshot of price at time of order
  quantity decimal(10, 2) not null,
  unit product_unit not null,
  total decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount decimal(10, 2) not null,
  payment_method payment_method not null,
  status payment_status default 'pending',
  transaction_id text, -- From payment provider
  phone_number text, -- Mobile money phone number
  provider_response jsonb,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete set null,
  consumer_id uuid not null references public.profiles(id) on delete cascade,
  producer_id uuid not null references public.producer_profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  is_verified_purchase boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- MESSAGES TABLE (for producer-consumer chat)
-- ============================================
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  consumer_id uuid not null references public.profiles(id) on delete cascade,
  producer_id uuid not null references public.producer_profiles(id) on delete cascade,
  last_message_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(consumer_id, producer_id)
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- ============================================
-- FAVORITES TABLE
-- ============================================
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  producer_id uuid references public.producer_profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  check (product_id is not null or producer_id is not null),
  unique(user_id, product_id),
  unique(user_id, producer_id)
);

-- ============================================
-- CART TABLE (persisted cart)
-- ============================================
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity decimal(10, 2) not null default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info', -- info, order, message, promo
  data jsonb,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_products_producer on public.products(producer_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_available on public.products(is_available);
create index if not exists idx_orders_consumer on public.orders(consumer_id);
create index if not exists idx_orders_producer on public.orders(producer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_cart_user on public.cart_items(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate order number
create or replace function generate_order_number()
returns trigger as $$
begin
  new.order_number := 'AL-' || to_char(now(), 'YYYYMMDD') || '-' || 
    lpad(floor(random() * 10000)::text, 4, '0');
  return new;
end;
$$ language plpgsql;

-- Trigger for order number
drop trigger if exists set_order_number on public.orders;
create trigger set_order_number
  before insert on public.orders
  for each row
  execute function generate_order_number();

-- Function to update producer stats after order
create or replace function update_producer_stats()
returns trigger as $$
begin
  if new.status = 'delivered' and old.status != 'delivered' then
    update public.producer_profiles
    set 
      total_sales = total_sales + 1,
      total_revenue = total_revenue + new.total
    where id = new.producer_id;
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger for producer stats
drop trigger if exists update_producer_on_delivery on public.orders;
create trigger update_producer_on_delivery
  after update on public.orders
  for each row
  execute function update_producer_stats();

-- Function to update producer rating
create or replace function update_producer_rating()
returns trigger as $$
begin
  update public.producer_profiles
  set 
    rating = (
      select coalesce(avg(rating), 0)
      from public.reviews
      where producer_id = new.producer_id
    ),
    review_count = (
      select count(*)
      from public.reviews
      where producer_id = new.producer_id
    )
  where id = new.producer_id;
  return new;
end;
$$ language plpgsql;

-- Trigger for rating update
drop trigger if exists update_rating_on_review on public.reviews;
create trigger update_rating_on_review
  after insert or update on public.reviews
  for each row
  execute function update_producer_rating();

-- Function to update timestamps
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at();

drop trigger if exists update_producer_profiles_updated_at on public.producer_profiles;
create trigger update_producer_profiles_updated_at before update on public.producer_profiles
  for each row execute function update_updated_at();

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at before update on public.products
  for each row execute function update_updated_at();

drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at before update on public.orders
  for each row execute function update_updated_at();

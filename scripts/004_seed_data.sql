-- AgriLink Seed Data
-- Sample data for development and testing

-- Note: Run this AFTER creating test users through the app
-- This script uses placeholder UUIDs that need to be replaced with real user IDs

-- ============================================
-- SAMPLE PRODUCER PROFILES
-- ============================================
-- These will be linked to real users after signup

-- Function to create demo data (run after at least one user exists)
create or replace function seed_demo_data(demo_user_id uuid)
returns void as $$
declare
  producer_1_id uuid;
  producer_2_id uuid;
  producer_3_id uuid;
begin
  -- Update the demo user to be a producer
  update public.profiles 
  set role = 'producer', 
      full_name = 'Mamadou Diallo',
      phone = '+221771234567',
      city = 'Thies',
      region = 'Thies'
  where id = demo_user_id;

  -- Create producer profile
  insert into public.producer_profiles (user_id, business_name, description, is_certified_bio, rating, review_count)
  values (demo_user_id, 'Ferme Diallo', 'Producteur de cereales et legumes bio depuis 15 ans a Thies', true, 4.8, 127)
  on conflict (user_id) do update set business_name = 'Ferme Diallo'
  returning id into producer_1_id;

  -- Add products for producer
  insert into public.products (producer_id, name, description, category, price, unit, stock_quantity, is_bio, is_available, image_url)
  values 
    (producer_1_id, 'Mil local', 'Mil cultive naturellement sans pesticides', 'cereales', 800, 'kg', 500, true, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
    (producer_1_id, 'Mais frais', 'Mais recolte cette semaine', 'cereales', 600, 'kg', 300, false, true, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400'),
    (producer_1_id, 'Arachides', 'Arachides de qualite superieure', 'cereales', 1200, 'kg', 200, true, true, 'https://images.unsplash.com/photo-1567892320421-1c657571ea4a?w=400'),
    (producer_1_id, 'Tomates fraiches', 'Tomates bio cultivees localement', 'legumes', 1500, 'kg', 100, true, true, 'https://images.unsplash.com/photo-1546470427-e26264be0b0a?w=400'),
    (producer_1_id, 'Oignons', 'Oignons du Senegal', 'legumes', 700, 'kg', 250, false, true, 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400'),
    (producer_1_id, 'Mangues Kent', 'Mangues sucrees de saison', 'fruits', 2000, 'kg', 150, true, true, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400')
  on conflict do nothing;

end;
$$ language plpgsql security definer;

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for products with producer info
create or replace view public.products_with_producer as
select 
  p.*,
  pp.business_name as producer_name,
  pp.is_certified_bio as producer_is_bio,
  pp.rating as producer_rating,
  pp.review_count as producer_review_count,
  pr.full_name as producer_full_name,
  pr.phone as producer_phone,
  pr.city as producer_city,
  pr.avatar_url as producer_avatar
from public.products p
join public.producer_profiles pp on p.producer_id = pp.id
join public.profiles pr on pp.user_id = pr.id;

-- View for orders with details
create or replace view public.orders_with_details as
select 
  o.*,
  c.full_name as consumer_name,
  c.phone as consumer_phone,
  pp.business_name as producer_name,
  (
    select json_agg(json_build_object(
      'id', oi.id,
      'product_name', oi.product_name,
      'quantity', oi.quantity,
      'unit', oi.unit,
      'price', oi.product_price,
      'total', oi.total
    ))
    from public.order_items oi
    where oi.order_id = o.id
  ) as items
from public.orders o
join public.profiles c on o.consumer_id = c.id
join public.producer_profiles pp on o.producer_id = pp.id;

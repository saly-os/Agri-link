-- AgriLink Row Level Security Policies
-- Secure access to all tables based on user authentication

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
alter table public.profiles enable row level security;
alter table public.producer_profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.favorites enable row level security;
alter table public.cart_items enable row level security;
alter table public.notifications enable row level security;

-- ============================================
-- PROFILES POLICIES
-- ============================================
-- Anyone can view public profile info
create policy "profiles_select_public" on public.profiles
  for select using (true);

-- Users can update their own profile
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Users can insert their own profile
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ============================================
-- PRODUCER PROFILES POLICIES
-- ============================================
-- Anyone can view producer profiles (public marketplace)
create policy "producer_profiles_select_public" on public.producer_profiles
  for select using (true);

-- Only the owner can update their producer profile
create policy "producer_profiles_update_own" on public.producer_profiles
  for update using (auth.uid() = user_id);

-- Only authenticated users can create a producer profile
create policy "producer_profiles_insert_own" on public.producer_profiles
  for insert with check (auth.uid() = user_id);

-- ============================================
-- PRODUCTS POLICIES
-- ============================================
-- Anyone can view available products
create policy "products_select_public" on public.products
  for select using (is_available = true or 
    exists (select 1 from public.producer_profiles where id = products.producer_id and user_id = auth.uid()));

-- Producers can insert their own products
create policy "products_insert_own" on public.products
  for insert with check (
    exists (select 1 from public.producer_profiles where id = producer_id and user_id = auth.uid())
  );

-- Producers can update their own products
create policy "products_update_own" on public.products
  for update using (
    exists (select 1 from public.producer_profiles where id = producer_id and user_id = auth.uid())
  );

-- Producers can delete their own products
create policy "products_delete_own" on public.products
  for delete using (
    exists (select 1 from public.producer_profiles where id = producer_id and user_id = auth.uid())
  );

-- ============================================
-- ORDERS POLICIES
-- ============================================
-- Consumers can view their own orders
create policy "orders_select_consumer" on public.orders
  for select using (auth.uid() = consumer_id);

-- Producers can view orders for their products
create policy "orders_select_producer" on public.orders
  for select using (
    exists (select 1 from public.producer_profiles where id = producer_id and user_id = auth.uid())
  );

-- Consumers can create orders
create policy "orders_insert_consumer" on public.orders
  for insert with check (auth.uid() = consumer_id);

-- Producers can update order status
create policy "orders_update_producer" on public.orders
  for update using (
    exists (select 1 from public.producer_profiles where id = producer_id and user_id = auth.uid())
  );

-- Consumers can cancel their pending orders
create policy "orders_update_consumer" on public.orders
  for update using (auth.uid() = consumer_id and status = 'pending');

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================
-- View order items if user owns the order (consumer or producer)
create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o 
      where o.id = order_id 
      and (o.consumer_id = auth.uid() or 
           exists (select 1 from public.producer_profiles pp where pp.id = o.producer_id and pp.user_id = auth.uid()))
    )
  );

-- Insert order items when creating an order
create policy "order_items_insert" on public.order_items
  for insert with check (
    exists (select 1 from public.orders where id = order_id and consumer_id = auth.uid())
  );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
-- Users can view their own payments
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

-- Users can create their own payments
create policy "payments_insert_own" on public.payments
  for insert with check (auth.uid() = user_id);

-- ============================================
-- REVIEWS POLICIES
-- ============================================
-- Anyone can view reviews
create policy "reviews_select_public" on public.reviews
  for select using (true);

-- Users can create reviews for their orders
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = consumer_id);

-- Users can update their own reviews
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = consumer_id);

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================
-- Users can view their conversations
create policy "conversations_select_own" on public.conversations
  for select using (
    auth.uid() = consumer_id or 
    exists (select 1 from public.producer_profiles where id = producer_id and user_id = auth.uid())
  );

-- Users can create conversations
create policy "conversations_insert" on public.conversations
  for insert with check (auth.uid() = consumer_id);

-- ============================================
-- MESSAGES POLICIES
-- ============================================
-- Users can view messages in their conversations
create policy "messages_select_own" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c 
      where c.id = conversation_id 
      and (c.consumer_id = auth.uid() or 
           exists (select 1 from public.producer_profiles pp where pp.id = c.producer_id and pp.user_id = auth.uid()))
    )
  );

-- Users can send messages in their conversations
create policy "messages_insert_own" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations c 
      where c.id = conversation_id 
      and (c.consumer_id = auth.uid() or 
           exists (select 1 from public.producer_profiles pp where pp.id = c.producer_id and pp.user_id = auth.uid()))
    )
  );

-- Users can mark messages as read
create policy "messages_update_read" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c 
      where c.id = conversation_id 
      and (c.consumer_id = auth.uid() or 
           exists (select 1 from public.producer_profiles pp where pp.id = c.producer_id and pp.user_id = auth.uid()))
    )
  );

-- ============================================
-- FAVORITES POLICIES
-- ============================================
-- Users can view their own favorites
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

-- Users can add favorites
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

-- Users can remove favorites
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- ============================================
-- CART ITEMS POLICIES
-- ============================================
-- Users can view their own cart
create policy "cart_items_select_own" on public.cart_items
  for select using (auth.uid() = user_id);

-- Users can add to cart
create policy "cart_items_insert_own" on public.cart_items
  for insert with check (auth.uid() = user_id);

-- Users can update their cart
create policy "cart_items_update_own" on public.cart_items
  for update using (auth.uid() = user_id);

-- Users can remove from cart
create policy "cart_items_delete_own" on public.cart_items
  for delete using (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
-- Users can view their own notifications
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

-- Users can update their notifications (mark as read)
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

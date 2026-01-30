-- Create categories table and seed default categories

-- Use existing enum product_category for the id to keep it consistent with products.category
create table if not exists public.categories (
  id product_category primary key,
  name text not null,
  name_wolof text,
  icon text,
  description text,
  sort_order integer default 0
);

-- Seed default categories
insert into public.categories (id, name, name_wolof, icon, description, sort_order) values
  ('cereales', 'Céréales', NULL, '🌾', 'Céréales et céréales sèches', 1),
  ('legumes', 'Légumes', NULL, '🥬', 'Légumes frais', 2),
  ('fruits', 'Fruits', NULL, '🍎', 'Fruits de saison', 3),
  ('viande', 'Viande', NULL, '🥩', 'Viandes et volailles', 4),
  ('poisson', 'Poisson', NULL, '🐟', 'Poissons et fruits de mer', 5),
  ('produits_laitiers', 'Produits laitiers', NULL, '🥛', 'Produits laitiers', 6),
  ('epices', 'Épices', NULL, '🫚', 'Épices et condiments', 7),
  ('autres', 'Autres', NULL, '📦', 'Autres produits', 8)
on conflict (id) do update set
  name = excluded.name,
  name_wolof = excluded.name_wolof,
  icon = excluded.icon,
  description = excluded.description,
  sort_order = excluded.sort_order;

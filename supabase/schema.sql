-- 1. TABLES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'buyer' check (role in ('buyer','seller')),
  created_at timestamptz default now()
);

create table categories (
  id serial primary key,
  name text not null unique
);

create table products (
  id serial primary key,
  category_id int not null references categories(id),
  name text not null,
  unit text not null default 'piece',
  description text
);

create table sellers (
  id serial primary key,
  profile_id uuid references profiles(id),  -- null for demo sellers
  shop_name text not null,
  phone text,
  address text
);

create table seller_inventory (
  id serial primary key,
  seller_id int not null references sellers(id) on delete cascade,
  product_id int not null references products(id) on delete cascade,
  price numeric(10,2) not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  unique (seller_id, product_id)
);

create table external_sellers (
  id serial primary key,
  category_id int not null references categories(id),
  shop_name text not null,
  phone text not null,
  address text
);

create table orders (
  id serial primary key,
  buyer_id uuid not null references profiles(id),
  seller_id int not null references sellers(id),
  status text not null default 'placed'
    check (status in ('placed','accepted','delivered','cancelled')),
  total numeric(10,2) not null,
  delivery_address text,
  created_at timestamptz default now()
);

create table order_items (
  id serial primary key,
  order_id int not null references orders(id) on delete cascade,
  product_id int not null references products(id),
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null
);

-- Speeds up product search and the availability check
create index on products (name);
create index on seller_inventory (product_id, price);

-- 2. AUTO-CREATE A PROFILE WHEN A USER SIGNS UP
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'buyer')
  );
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- 3. ROW LEVEL SECURITY
alter table profiles          enable row level security;
alter table categories        enable row level security;
alter table products          enable row level security;
alter table sellers           enable row level security;
alter table seller_inventory  enable row level security;
alter table external_sellers  enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;

-- Catalog: anyone can read
create policy "read categories" on categories for select using (true);
create policy "read products" on products for select using (true);
create policy "read sellers" on sellers for select using (true);
create policy "read inventory" on seller_inventory for select using (true);
create policy "read external sellers" on external_sellers for select using (true);

-- Profiles: only your own
create policy "own profile read" on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- Orders: buyer sees theirs, seller sees orders sent to their shop
create policy "buyer reads own orders" on orders for select
  using (buyer_id = auth.uid());
create policy "seller reads shop orders" on orders for select
  using (seller_id in (select id from sellers where profile_id = auth.uid()));

create policy "read items of visible orders" on order_items for select
  using (order_id in (select id from orders));

-- 4. SAMPLE DATA
insert into categories (name) values
  ('Masonry'),('Hardware'),('Painting'),
  ('Tiles & Marble'),('Flooring'),('Plumbing');

insert into products (category_id, name, unit) values
  ((select id from categories where name='Masonry'), 'OPC Cement 50kg', 'bag'),
  ((select id from categories where name='Masonry'), 'River Sand', 'tonne'),
  ((select id from categories where name='Hardware'), 'Steel Nails 2 inch', 'kg'),
  ((select id from categories where name='Painting'), 'White Wall Paint 20L', 'bucket'),
  ((select id from categories where name='Tiles & Marble'), 'Vitrified Tile 2x2 ft', 'box'),
  ((select id from categories where name='Flooring'), 'Wooden Laminate Plank', 'sq ft'),
  ((select id from categories where name='Plumbing'), 'CPVC Pipe 1 inch', 'piece'),
  ((select id from categories where name='Plumbing'), 'Brass Tap', 'piece');

insert into sellers (shop_name, phone, address) values
  ('Sharma Building Supplies', '9000000001', 'Kanpur'),
  ('Gupta Hardware & Paints', '9000000002', 'Kanpur');

insert into seller_inventory (seller_id, product_id, price, stock)
select s.id, p.id, v.price, v.stock
from (values
  ('Sharma Building Supplies','OPC Cement 50kg',410,100),
  ('Gupta Hardware & Paints','OPC Cement 50kg',395,20),
  ('Sharma Building Supplies','CPVC Pipe 1 inch',180,50),
  ('Gupta Hardware & Paints','White Wall Paint 20L',2400,15),
  ('Gupta Hardware & Paints','Steel Nails 2 inch',85,200),
  ('Sharma Building Supplies','Vitrified Tile 2x2 ft',950,40)
) as v(shop, prod, price, stock)
join sellers s on s.shop_name = v.shop
join products p on p.name = v.prod;

insert into external_sellers (category_id, shop_name, phone, address) values
  ((select id from categories where name='Tiles & Marble'), 'Royal Marble House', '9100000001', 'Kanpur'),
  ((select id from categories where name='Flooring'), 'City Floors', '9100000002', 'Kanpur'),
  ((select id from categories where name='Masonry'), 'Verma Sand & Bricks', '9100000003', 'Kanpur'),
  ((select id from categories where name='Plumbing'), 'Ravi Sanitary Store', '9100000004', 'Kanpur');
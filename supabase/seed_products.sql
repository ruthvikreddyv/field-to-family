-- Field to Family: seed the products table from the original hardcoded catalog.
-- Run this ONCE, after migration_admin_inventory.sql, in Supabase -> SQL Editor.
-- Safe to re-run: ON CONFLICT (slug) DO NOTHING means it won't duplicate or
-- overwrite anything you've already edited from the admin dashboard.
-- Photos aren't set here - add a real photo per product from /admin/products
-- once migration_roles_images.sql has been run.

insert into public.products
  (slug, category, category_label, name, name_hi, name_te, price, unit, stock, low_stock_threshold, tags, sort_order)
values
  -- Leafy greens
  ('spinach',     'leafy', 'Leafy greens', 'Spinach',          'पालक',      'పాలకూర',       30,  'bunch', 50, 5, '{organic}', 1),
  ('fenugreek',   'leafy', 'Leafy greens', 'Fenugreek leaves', 'मेथी',      'మెంతికూర',      25,  'bunch', 50, 5, '{}',        2),
  ('amaranth',    'leafy', 'Leafy greens', 'Amaranth greens',  'चौलाई',     'తోటకూర',       25,  'bunch', 50, 5, '{}',        3),
  ('coriander',   'leafy', 'Leafy greens', 'Coriander',        'धनिया',     'కొత్తిమీర',      15,  'bunch', 50, 5, '{season}',  4),
  ('mint',        'leafy', 'Leafy greens', 'Mint',             'पुदीना',    'పుదీనా',        15,  'bunch', 50, 5, '{}',        5),
  ('mustard',     'leafy', 'Leafy greens', 'Mustard greens',   'सरसों',     'ఆవిసె కూర',      30,  'bunch', 50, 5, '{}',        6),

  -- Roots & tubers
  ('potato',      'roots', 'Roots & tubers', 'Potato',       'आलू',      'బంగాళాదుంప',   35,  'kg',   50, 5, '{}',        1),
  ('onion',       'roots', 'Roots & tubers', 'Onion',        'प्याज़',    'ఉల్లిపాయ',     40,  'kg',   50, 5, '{}',        2),
  ('carrot',      'roots', 'Roots & tubers', 'Carrot',       'गाजर',     'క్యారెట్',      45,  'kg',   50, 5, '{season}',  3),
  ('beetroot',    'roots', 'Roots & tubers', 'Beetroot',     'चुकंदर',   'బీట్‌రూట్',     40,  'kg',   50, 5, '{}',        4),
  ('radish',      'roots', 'Roots & tubers', 'Radish',       'मूली',     'ముల్లంగి',      30,  'kg',   50, 5, '{}',        5),
  ('sweetpotato', 'roots', 'Roots & tubers', 'Sweet potato', 'शकरकंद',   'చిలగడదుంప',    50,  'kg',   50, 5, '{season}',  6),
  ('ginger',      'roots', 'Roots & tubers', 'Ginger',       'अदरक',     'అల్లం',        90,  '250g', 50, 5, '{}',        7),
  ('garlic',      'roots', 'Roots & tubers', 'Garlic',       'लहसुन',    'వెల్లుల్లి',     140, '250g', 50, 5, '{}',        8),

  -- Gourds & squashes
  ('bottlegourd', 'gourds', 'Gourds & squashes', 'Bottle gourd', 'लौकी',    'సొరకాయ',   35, 'piece', 50, 5, '{}',        1),
  ('ridgegourd',  'gourds', 'Gourds & squashes', 'Ridge gourd',  'तोरई',    'బీరకాయ',   40, 'kg',    50, 5, '{}',        2),
  ('bittergourd', 'gourds', 'Gourds & squashes', 'Bitter gourd', 'करेला',   'కాకరకాయ',  45, 'kg',    50, 5, '{}',        3),
  ('pumpkin',     'gourds', 'Gourds & squashes', 'Pumpkin',      'कद्दू',   'గుమ్మడికాయ', 35, 'kg',    50, 5, '{}',        4),
  ('cucumber',    'gourds', 'Gourds & squashes', 'Cucumber',     'खीरा',    'దోసకాయ',   30, 'kg',    50, 5, '{organic}', 5),
  ('snakegourd',  'gourds', 'Gourds & squashes', 'Snake gourd',  'चिचिंडा', 'పొట్లకాయ',  40, 'kg',    50, 5, '{}',        6),

  -- Everyday vegetables
  ('tomato',      'everyday', 'Everyday vegetables', 'Tomato',       'टमाटर',      'టమాటా',        40, 'kg',    50, 5, '{organic}', 1),
  ('brinjal',     'everyday', 'Everyday vegetables', 'Brinjal',      'बैंगन',      'వంకాయ',        35, 'kg',    50, 5, '{}',        2),
  ('cauliflower', 'everyday', 'Everyday vegetables', 'Cauliflower',  'फूल गोभी',   'కాలీఫ్లవర్',     40, 'piece', 50, 5, '{season}',  3),
  ('cabbage',     'everyday', 'Everyday vegetables', 'Cabbage',      'पत्ता गोभी', 'క్యాబేజీ',      30, 'piece', 50, 5, '{}',        4),
  ('beans',       'everyday', 'Everyday vegetables', 'Green beans',  'फंसी',       'చిక్కుడుకాయ',   50, 'kg',    50, 5, '{}',        5),
  ('capsicum',    'everyday', 'Everyday vegetables', 'Capsicum',     'शिमला मिर्च', 'క్యాప్సికం',    60, 'kg',    50, 5, '{}',        6),
  ('peas',        'everyday', 'Everyday vegetables', 'Green peas',   'मटर',        'బటానీ',        70, 'kg',    50, 5, '{season}',  7),
  ('okra',        'everyday', 'Everyday vegetables', 'Okra',         'भिंडी',      'బెండకాయ',      45, 'kg',    50, 5, '{}',        8),
  ('chilli',      'everyday', 'Everyday vegetables', 'Green chilli', 'हरी मिर्च',  'పచ్చిమిర్చి',    40, '250g',  50, 5, '{}',        9),
  ('drumstick',   'everyday', 'Everyday vegetables', 'Drumstick',    'सहजन',       'మునగకాయ',      50, 'bunch', 50, 5, '{}',        10)
on conflict (slug) do nothing;

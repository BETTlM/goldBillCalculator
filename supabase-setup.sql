-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- It creates the table and seeds it with 30 jewellery items (5 per type)

CREATE TABLE IF NOT EXISTS jewellery_items (
  id             SERIAL PRIMARY KEY,
  name           TEXT    NOT NULL,
  type           TEXT    NOT NULL,
  weight         DOUBLE PRECISION NOT NULL,
  wastage_percent DOUBLE PRECISION NOT NULL,
  making_percent  DOUBLE PRECISION NOT NULL,
  tax_percent     DOUBLE PRECISION NOT NULL
);

TRUNCATE jewellery_items RESTART IDENTITY;

INSERT INTO jewellery_items (name, type, weight, wastage_percent, making_percent, tax_percent) VALUES
  -- Rings
  ('Classic Solitaire Ring',    'ring', 3.5,  8,  12, 3),
  ('Twisted Band Ring',         'ring', 4.2,  10, 14, 3),
  ('Floral Motif Ring',         'ring', 5.0,  12, 15, 3),
  ('Signet Gold Ring',          'ring', 6.8,  7,  10, 3),
  ('Minimalist Thin Ring',      'ring', 2.1,  6,  8,  3),

  -- Chains
  ('Rope Chain 22in',           'chain', 12.0, 5,  8,  3),
  ('Box Link Chain 20in',       'chain', 15.5, 6,  9,  3),
  ('Figaro Chain 24in',         'chain', 18.0, 4,  7,  3),
  ('Curb Chain 20in',           'chain', 20.0, 5,  8,  3),
  ('Singapore Chain 18in',      'chain', 8.5,  7,  10, 3),

  -- Bracelets
  ('Cuban Link Bracelet',       'bracelet', 22.0, 6,  10, 3),
  ('Charm Bangle Bracelet',     'bracelet', 14.0, 8,  12, 3),
  ('Tennis Gold Bracelet',      'bracelet', 10.5, 10, 14, 3),
  ('Cuff Bracelet Wide',        'bracelet', 28.0, 5,  9,  3),
  ('Herringbone Bracelet',      'bracelet', 9.0,  7,  11, 3),

  -- Earrings
  ('Temple Jhumka Earring',     'earring', 8.0,  12, 18, 3),
  ('Stud Earring Pair',         'earring', 3.0,  8,  10, 3),
  ('Hoop Gold Earring',         'earring', 5.5,  9,  12, 3),
  ('Drop Dangle Earring',       'earring', 6.2,  11, 15, 3),
  ('Chandbali Earring',         'earring', 10.0, 14, 20, 3),

  -- Necklaces
  ('Choker Gold Necklace',      'necklace', 25.0, 8,  12, 3),
  ('Pendant Set Necklace',      'necklace', 10.0, 10, 14, 3),
  ('Layered Strand Necklace',   'necklace', 18.0, 9,  13, 3),
  ('Temple Design Necklace',    'necklace', 35.0, 7,  11, 3),
  ('Collar Statement Necklace', 'necklace', 30.0, 6,  10, 3),

  -- Bangles
  ('Plain Round Bangle',        'bangle', 12.0, 4,  6,  3),
  ('Filigree Work Bangle',      'bangle', 16.0, 12, 16, 3),
  ('Kada Thick Bangle',         'bangle', 24.0, 5,  8,  3),
  ('Antique Finish Bangle',     'bangle', 18.0, 10, 14, 3),
  ('Studded Designer Bangle',   'bangle', 20.0, 14, 18, 3);

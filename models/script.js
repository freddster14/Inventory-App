require('dotenv').config();
const { Client } = require('pg');

const SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(15) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cat_id INTEGER NOT NULL DEFAULT 1,
  name VARCHAR(30) UNIQUE NOT NULL,
  info VARCHAR(100),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  quantity INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT match_id FOREIGN KEY (cat_id)
    REFERENCES categories(id)
    ON DELETE SET DEFAULT,
  CONSTRAINT no_dupe UNIQUE (cat_id, name)
);

INSERT INTO categories (name)
  VALUES
  ('No Category'),
  ('Technology'),
  ('Clothes'),
  ('Shoes');

INSERT INTO items (cat_id, name, info, price, quantity)
  VALUES
  ((SELECT id FROM categories WHERE name = 'No Category'), 'RTX 3070', 'a rtx graphics card', 300.00, 2),
  ((SELECT id FROM categories WHERE name = 'Technology'), 'Samsung S24 Plus', 'last generation samsung galaxy', 500.00, 7),
  ((SELECT id FROM categories WHERE name = 'Clothes'), 'Hanes White Tee', 'common t-shirt', 12.99, 22),
  ((SELECT id FROM categories WHERE name = 'Shoes'), 'Black Sperry', 'Out going style', 80.99, 2);
`;

const main = async () => {
  console.log('seeding...');
  const client = new Client({
    connectionString: process.env.DB_URL,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log('done');
};

main();

require('dotenv').config();
const { Client } = require('pg');

const SQL = `
INSERT INTO items (cat_id, name, info, price, quantity)
  VALUES
  (1, 'RTX 2070', 'a rtx graphics card', 300.00, 2),
  (1, 'Samsung S25 Plus', 'last generation samsung galaxy', 500.00, 7),
  (1, 'Hanes Black Tee', 'common t-shirt', 12.99, 22),
  (1, 'Brown Sperry', 'Out going style', 80.99, 2),
  (1, 'RTX 4070', 'a rtx graphics card', 300.00, 2),
  (1, 'Samsung S27 Plus', 'last generation samsung galaxy', 500.00, 7),
  (1, 'Uniqlo Black Tee', 'common t-shirt', 12.99, 22),
  (1, 'Brown Nike', 'Out going style', 80.99, 2),
  (1, 'RTX 1070', 'a rtx graphics card', 300.00, 2),
  (1, 'Samsung S7 Plus', 'last generation samsung galaxy', 500.00, 7),
  (1, 'Uniqlo White Tee', 'common t-shirt', 12.99, 22),
  (1, 'Black Nike', 'Out going style', 80.99, 2);
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

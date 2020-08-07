CREATE TABLE IF NOT EXISTS userbooks (
  id SERIAL PRIMARY KEY,
  ImagUrl VARCHAR(600),
  title VARCHAR (500),
  author VARCHAR (500),
  descriptions VARCHAR (4000),
  isbn VARCHAR(500),
  bookShelf VARCHAR (200)
);
DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  description TEXT,
  bookshelf VARCHAR(255)
);
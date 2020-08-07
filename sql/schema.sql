CREATE TABLE IF NOT EXISTS userbooks (
  id SERIAL PRIMARY KEY,
  ImagUrl VARCHAR(600),
  title VARCHAR (500),
  author VARCHAR (500),
  descriptions VARCHAR (4000),
  isbn VARCHAR(500),
  bookShelf VARCHAR (200)
);
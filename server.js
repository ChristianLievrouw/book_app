'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const { response } = require('express');
const pg = require('pg');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();


// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
console.log(process.env.DATABASE_URL)

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');



// API Routes

// Renders the home page
app.get('/', renderHomePage);

// app.post('/searches', addBooks);

// app.get('/books/:id', getBook);

// Renders the search form
app.get('/searches/new', showForm);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);

// Creates a view details after selecting a book
app.get('/books/:id', viewDetails);
app.post('/addBook', saveBook);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  })
  .catch(err => {
    throw err
  });

// HELPER FUNCTIONS
// Only show part of this to get students started
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.image_url = info.imageLinks ? info.imageLinks.thumbnail : placeholderImage;
  this.title = info.title ? info.title : 'No title available';
  this.authors = info.authors ? info.authors.join(', ') : 'No authors available';
  this.description = info.description ? info.description : 'No description availble';
  this.isbn = info.industryIdentifiers ? info.industryIdentifiers.map(i => i.identifier).join(', ').toString() : 'No ISBN availble';
  this.bookShelf = info.categories ? info.categories :'Bookshelf not found';
}

function View(viewDetails) {
  const placeholderImage = 'https://www.googleapis.com/books/v1/volumes?q=';
  this.id = viewDetails.id;
  this.imagurl = viewDetails.ImagUrl;
  this.title = viewDetails.title;
  this.author = viewDetails.authors;
  this.description = viewDetails.description;
  this.isbn = viewDetails.isbn;
  this.bookshelf = viewDetails.bookshelf;
}
// Note that .ejs file extension is not required

function renderHomePage(request, response) {
  // console.log(request.body.search)
  const SQL = `
  SELECT *
  FROM userbooks;
  `;
  client.query(SQL)
    .then(result => {
      let viewModel = {
        userBooks: result.rows,
      };
      response.render('pages/index', viewModel);
    })
    .catch(err => {
      errorHandler(err, response)
    });
}

function showForm(request, response) {
  response.render('pages/new');
}

// function viewDetails(request, response) {
//   response.render('pages/details');
// }

// function addBooks(request, response) {
//   console.log(request);
//   let { ImagUrl, title, author, descriptions, isbn, bookShelf } = request.body.search;
//   const SQL = `
//   INSERT INTO userbooks (ImagUrl, title, author, descriptions, isbn, bookShelf)
//   VALUES ($1, $2, $3, $4, $5, $6)
//   `;
//   const values = [ImagUrl, title, author, descriptions, isbn, bookShelf];
//   client.query(SQL, values)
//     .then(results => {
//       response.redirect('/')
//     })
//     .catch(err => {
//       errorHandler(err, response)
//     });
// }

// No API key required
// Console.log request.body and request.body.search
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  // console.log(request.body);
  console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/show', { searchResults: results }))
    .catch(err => {
      errorHandler(err, response)
    });
}
// View Details Route
function viewDetails(request, response) {
  const SQL = `
    SELECT *
    FROM userBooks 
    WHERE id = $1;
    `;
  let values = [request.params.id];
  client.query(SQL, values)
    .then(result => {
      console.log(result);
      let viewModel = {
        book: result.rows[0],
      };
      response.render('pages/details', viewModel);
    })
    .catch(error => errorHandler(error, response));
}


function saveBook (request, response) {
 let {image_url, title, author, description, isbn} = request.body
 const SQL= `
 INSERT INTO userbooks (ImagUrl, title, author, descriptions, isbn) 
 VALUES ($1, $2, $3, $4, $5);`;
 const values=[image_url, title, author, description, isbn];
 client.query(SQL,values)
 .then(result =>{
   response.redirect('/')
 })
 .catch(error => errorHandler(error, response));
}
function errorHandler(error, response) {
  let viewModel = {
    error: error
  }
  response.status(500).render('pages/error', viewModel);
}

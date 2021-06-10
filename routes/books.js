// For the routes
let express = require('express');
let router = express.Router();
// For the Data Model
let BookSchema = require('../models/books');


function HandleError(response, reason, message, code){
  console.log('ERROR: ' + reason);
  response.status(code || 500).json({"error:": message});
}



router.post('/', (request, response, next) => {
  let newBook = request.body;
  //console.log(request.body);
  if (!newBook.name || !newBook.author || !newBook.isbn ||!newBook.price ){
    HandleError(response, 'Missing Info', 'Form data missing', 500);
  }
  const ISBN = require( 'isbn-validate' );
  if(!ISBN.Validate(newBook.isbn)){
    HandleError(response, 'NO ISBN VALIDATION ', 'invalid isbn', 500);
  }
  else{
    let book = new BookSchema({
      name: newBook.name,
      author: newBook.author,
      isbn: newBook.isbn,
      price: newBook.price,
    });
    book.save((error) => {
      if (error){
        response.send({"error": error});
      }else{
        response.send({"id": book.id});
      }
    });
  }
});


router.get('/', (request, response, next) => {
  let name = request.query['author'];
  if (name){
    BookSchema
        .find({"author": name})
        .exec( (error, books) => {
          if (error){
            response.send({"error": error});
          }else{
            response.send(books);
          }
        });
  }else{
    BookSchema
        .find()
        .exec( (error, books) => {
          if (error){
            response.send({"error": error});
          }else{
            response.send(books);
          }
        });
  }

} );
router.get('/', (request, response, next) => {
  let isbn = request.query['isbn'];
  if (isbn) {
    BookSchema
        .find({"isbn": isbn})
        .exec((error, books) => {
          if (error) {
            response.send({"error": error});
          } else {
            response.send(books);
          }
        });
  } else {
    BookSchema
        .find()
        .exec((error, books) => {
          if (error) {
            response.send({"error": error});
          } else {
            response.send(books);
          }
        });
  }
});


router.get('/:isbn', (request, response, next) =>{
  BookSchema
      .findOne({"isbn": request.params.isbn}, (error, result) =>{
        if (error) {
          response.status(500).send(error);
        }
        if (result){
          response.send(result);
        }else{
          response.status(404).send({"isbn": request.params.isbn, "error":  "Not Found"});
        }

      });
});

router.patch('/:isbn', (request, response, next) =>{
  BookSchema
      .findOne({"isbn": request.params.isbn}, (error, result) =>{
        if (error) {
          response.status(500).send(error);
        }else if (result){
          if (request.body.isbn){
            delete request.body.isbn;
          }
          for (let field in request.body){
            result[field] = request.body[field];
          }
          result.save((error, book)=>{
            if (error){
              response.status(500).send(error);
            }
            response.send(book);
          });
        }else{
          response.status(404).send({"isbn": request.params.isbn, "error":  "Not Found"});
        }

      });
});

router.delete('/:isbn', (request, response, next) =>{
  BookSchema
      .findOne({"isbn": request.params.isbn}, (error, result) =>{
        if (error) {
          response.status(500).send(error);
        }else if (result){
          result.remove((error)=>{
            if (error){
              response.status(500).send(error);
            }
            response.send({"deletedISBN": request.params.isbn});
          });
        }else{
          response.status(404).send({"isbn": request.params.isbn, "error":  "Not Found"});
        }
      });
});


module.exports = router;
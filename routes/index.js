let express = require('express');
let router = express.Router();
let BookSchema = require('../models/books');




function HandleError(response, reason, message, code){
  console.log('ERROR: ' + reason);
  response.status(code || 500).json({"error:": message});
}


router.get('/', (request, response, next) => {
  let authorName = request.query['authorName'];
  if(authorName){
    BookSchema
        .find({"authorName": authorName}, (error, result) => {
          if (error) {
            response.status(500).send(error);
          }
          else if (result) {
            response.send(result);
          }else{
            response.status(404).send({"authorName" : request.params.authorName, "error": "Not Found"});
          }
        });

  }else {
    BookSchema
        .find({} , (error, result) => {
          if (error){
            response.send({"error": error});
          }else{
            response.send(result);
          }
        });
  }
});

//GET /api/books/:isbn
//Retrieves the book with the given ISBN, if found, if not returns a 404 with a description of "not found"
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



router.post('/', (request, response, next) => {
  let bookJson = request.body;
  //console.log(request.body);
  if (!bookJson.bookName || !bookJson.authorName || !bookJson.bookPrice || !bookJson.isbn){
    HandleError(response, 'Missing Info', 'Form Data Missing', 500);
  }
  if (!isbnValid(bookJson.isbn)){
    HandleError(response, 'ISBN is not valid', 'ISBN is not valid', 500);
  }
  else{
    let book = new BookSchema({
      bookName: bookJson.bookName,
      authorName: bookJson.authorName,
      isbn: bookJson.isbn,
      bookPrice: bookJson.bookPrice,
    });
    book.save((error) => {
      if (error){
        response.send({"error": error});
      }else{
        response.send(book);
      }
    });
  }
});

// PATCH /api/books/:isbn
// Updates the book with the given ISBN, if not found returns a 404 with the description of "not found".
router.patch('/:isbn', (request, response, next) =>{
  BookSchema
      .findOneAndUpdate({"isbn": request.params.isbn}, request.body , {new: true}, (error, result)=>{
        if (error) {
          response.status(500).send(error);
        }else if (result){
          response.send(result);
        }else{
          response.status(404).send({"isbn": request.params.isbn, "error":  "Not Found"});
        }
      });
});

// DELETE /api/books/:isbn
// Deletes the book with the given ISBN, if not found returns a 404 with the description of "not found".
router.delete('/:isbn', (request, response, next) =>{
  BookSchema
      .findOneAndDelete({"isbn": request.params.isbn}, function(error){
        if (error) response.status(500).send(error);
        response.status(200).send("Book " + request.params.isbn + " succesfully deleted");
      });
});


function isbnValid(isbn){
  if(isbn.length == 10){
    var sum = 0;
    var weight = 10;
    for (var i = 0; i < 10; i++){
      sum = sum + isbn[i]* weight;
      weight--;
    }
    if (sum % 11 == 0)
      return true;
    else
      return false;
  }
  else if (isbn.length == 13){
    var sum = 0;
    for (var i = 0; i < 13; i++){
      sum = sum + isbn[i] * 1;
      i++;
      sum = sum + isbn[i] * 3;
    }
    if (sum % 10 == 0)
      return true;
    else
      return false;

  }
  return false;
}


module.exports = router;

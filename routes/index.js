// Routes
// ======
const express = require('express');
const router = express.Router();

// Our scraping tools
const request = require("request");
const cheerio = require("cheerio");

// Requiring our Note and Article models
let Note = require("../models/Note.js");
let Article = require("../models/Article.js");



//GET ROUTES
// ========================================================================
// GET Home page
router.get("/", function(req, res) {

  res.render('index');

});


// A GET request to scrape the echojs website
router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.nytimes.com/section/business?action=click&contentCollection=Business&module=SectionsNav&pgtype=sectionfront&region=TopBar&version=BrowseTree", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    let $ = cheerio.load(html);
    
    let scrapedData = [];
    
    // Now, we grab every h2 within an article tag, and do the following:
    $(".story-meta").each(function(i, element) {
      //console.log($(this));
      // Save an empty result object
      let result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children(".headline").text();
      result.summary = $(this).children(".summary").text();
      result.author = $(this).children(".byline").text();

      scrapedData.push(result);
    });
    
    res.render('index',{
      scrapedArticles:scrapedData
    });
  });
  
});

// This will grab an article by it's ObjectId
router.get("/articles", function(req, res) {

  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.find()
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      console.log(doc);
      res.render('savedArticle', {
        savedArticles: doc
      });
    }
  });


});


// POST ROUTES
//===========================================================================
// POST articles we scraped to the mongoDB
router.post("/save-article/", function(req, res) {

  // Using our Article model, create a new entry
  // This effectively passes the result object to the entry (and the title and link)
  console.log(req.body)
  let entry = new Article(req.body);

  // Now, save that entry to the db
  entry.save(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
      res.render('index');
    }
    // Or log the doc
    else {
      res.redirect('/articles')
    }
  });

});


// POST a new note or replace an existing note
router.post("/save-note", function(req, res) {


  // Create a new note and pass the req.body to the entry
  let newNote = new Note(req.body);
  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ _id: req.body.articleId }, { $push: { "note": doc._id } })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
          res.redirect("/articles");
        }
        else {
          // Or send the document to the browser
          res.redirect("/articles");
        }
      });
    }
  });

});



// DELETE ROUTES
//==========================================================================

// DELETE will remove an article by it's ObjectId
router.post("/articles/delete", function(req, res) {

  Article.remove({_id:req.body.id}, function(err, doc) {
    if (err) {
      console.log(err);
      res.redirect("/");
    }
    else {
      res.redirect("/articles");
    }
  });


});

// DELETE will remove an note by it's ObjectId
router.post("/delete-note", function(req, res) {

  Note.remove({_id:req.body.noteId}, function(err, doc) {
    if (err) {
      console.log(err);
      res.redirect("/");
    }
    else {
      res.redirect("/articles");
    }
  });


});



module.exports = router;
// Dependencies
let express = require("express");
let bodyParser = require("body-parser");
let logger = require("morgan");
let path = require('path');
let mongoose = require("mongoose");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Route File
let index = require('./routes/index');


// Initialize Express
let app = express();

// Use morgan and body parser the app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
//app.use(express.static("public"));

// Initialize Handlebars
let exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "layout" }));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "handlebars");

// Routing
app.use('/', index);

// Database configuration with mongoose
mongoose.connect(process.env.MONGODB_URI);
let db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Listen on port 3000
app.listen(process.env.PORT, function() {
  console.log("App running on port 3000!");
});

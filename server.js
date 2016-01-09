var express = require('express');
var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

//Connecting to mongoose
var dbpath = process.env.MONGOLAB_URI || 'mongodb://localhost/magicMatrix';
mongoose.connect(dbpath);

//Serving static files in public directory
var app = express();
app.use(express.static('public'));
var port = process.env.PORT || 3000; //port on Heroku
app.set('port',port);

//Setting Configurations
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({limit: '5mb'}));
app.use(expressSession({
    secret: 'mujtaba rox2' ,
    saveUninitialized: true,
    resave: true
}));

//Sets up the routes that the server accepts
require('./routes.js')(app);


//Populate Data into Mongo
require('./data/data_input2.js')();

//Creating and querying the postgres database
app.listen(app.get('port'), function() {
    console.log("Starting Magic-Matrix Server at port " + app.get('port') + "!");
});


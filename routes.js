var express = require('express');
var flash = require('connect-flash');
//var middleware = require('./controller/middleware');
//var controller = require('./controller/controller');

module.exports = function(app, passport, string) {

	app.get('/', function(req, res) {
		res.send(string);
	});

}
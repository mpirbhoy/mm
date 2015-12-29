var express = require('express');
var Course = require('../model/course');
var Section = require('../model/section');
var Catalog = require('../model/catalog');

		
module.exports = function(app) {

	app.get('/', function(req, res) {
		res.render('./pages/main');
	});

	app.get('/allCourses', function(req, res) {
		Course.find({courseCode: new RegExp(req.query.term, "i")}).populate('sections').lean().exec(function (err, myCourse) {
            if (myCourse) {

                // Populating catalog
                Section.populate(myCourse['sections'], {path: 'catalogs'}, function (err, data) {
                    res.send(data);
                });

            }
       }); 	

	});

	app.get('/course/@courseCode', function(req, res) {
		var courseCode = req.params.courseCode;
		Course.where({courseCode: courseCode}).findOne(function (findCourseErr, myCourse) {
			if (findCourseErr) {
                        res.json({
                            status: 409,
                            msg: "Errors when trying to find the course for enrollment"
                        })
            } else if (myCourse) {
            	res.send(myCourse);
           	}
		});
	});
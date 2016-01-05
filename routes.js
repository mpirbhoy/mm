var express = require('express');
var Course = require('./model/course');
var Section = require('./model/section');
var Catalog = require('./model/catalog');

		
module.exports = function(app) {

	app.get('/', function(req, res) {
		res.render('./pages/main');
	});

	app.get('/allCourses', function(req, res) {
        var allCourses = [];
        var i = 1;

        Course.find({courseCode: new RegExp(req.query.term, "i")}, function (err, courses) {
            if (courses) {
                courses.forEach(function (course) {
                    var tempCourse = {};
                    tempCourse.id = i;
                    tempCourse.courseCode = course.courseCode;
                    tempCourse.facultyCode = course.facultyCode;
                    tempCourse.courseName = course.title;
                    tempCourse.credits = course.credits;
                    tempCourse.prereqs = course.prereqs;
                    tempCourse.exclusions = course.exclusions;
                    tempCourse.note = course.note;
                    allCourses.push(tempCourse);
                });
                res.send(JSON.parse(JSON.stringify(allCourses)));
            }
        });
    });

	app.get('/course/:courseCode', function(req, res) {
		var courseCode = req.params.courseCode;
		Course.where({courseCode: courseCode}).findOne().populate('sections').lean().exec(function (err, myCourse) {
            if (err) {
                        res.json({
                            status: 409,
                            msg: "Errors when trying to find the course for enrollment"
                        })
            } else if (myCourse) {
            	// Populating catalog
                Section.populate(myCourse['sections'], {path: 'catalogs'}, function (err, data) {
                    res.send(myCourse);
                });
           	}
		});
	});
}
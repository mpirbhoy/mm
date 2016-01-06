var express = require('express');
var Course = require('./model/course');
var Section = require('./model/section');
var Catalog = require('./model/catalog');

		
module.exports = function(app) {

	app.get('/', function(req, res) {
		res.render('./pages/main');
	});

	app.get('/allCourses', function(req, res) {
        if (req.query.term == null || req.query.term.length < 3) {
            res.status(404).send('Try longer query');
            return;
        }
        var allCourses = [];
        var i = 1;
        Course.find({courseCode: new RegExp(req.query.term.replace(/\s+/g, ''), "i")}, function (err, courses) {
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

	app.get('/course/:courseCode/:title', function(req, res) {
		var courseCode = req.params.courseCode;
        var title = req.params.title;
		Course.where({courseCode: courseCode, title: title}).findOne().populate('sections').lean().exec(function (err, myCourse) {
            if (err) {
                        res.json({
                            status: 404,
                            msg: "Errors when trying to find the course for enrollment"
                        })
            } else if (myCourse) {
            	// Populating catalog
                Section.populate(myCourse['sections'], {path: 'catalogs'}, function (err, data) {

                    res.send(JSON.parse(JSON.stringify(myCourse)));
                });
           	}
		});
	});
}
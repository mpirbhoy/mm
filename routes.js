var express = require('express');
var Course = require('./model/course');
var Section = require('./model/section');
var Catalog = require('./model/catalog');

function getFixedVaryingMeetings(aCourse) {
    var i, j;
    // <--For a section -->
    for (i = 0; i < aCourse.sections.length; i++) {
        var curSec = aCourse.sections[i];
        curSec.fixedMeetings = null;
        curSec.varyingMeetings = null;
        // if number of section meeting = 0 and this section only has 1 catalog obj ->  its catalog are fixed meetings
        if (curSec.sectionMeetings.length == 0 && curSec.catalogs.length == 1) {
            curSec.fixedMeetings = [];
            curSec.varyingMeetings = [];
            curSec.fixedMeetings.push(curSec.catalogs[0].meeting);
        }
        // if number of section meeting = 0 and this section has > 1 catalog obj -> all its catalogs are varying meetings
        else if (curSec.sectionMeetings.length == 0 && curSec.catalogs.length > 0) {
            curSec.fixedMeetings = [];
            curSec.varyingMeetings = [];
            for (j = 0; j < curSec.catalogs.length; j++) {
                curSec.varyingMeetings.push(curSec.catalogs[j].meeting);
            }
        }
        // if number of section meeting > 0 -> all of them are fixed meetings and all catalog meeting are varying meetings
        else if (curSec.sectionMeetings.length > 0) {
            curSec.fixedMeetings = [];
            curSec.varyingMeetings = [];
            curSec.fixedMeetings = curSec.sectionMeetings;
            for (j = 0; j < curSec.catalogs.length; j++) {
                curSec.varyingMeetings.push(curSec.catalogs[j].meeting);
            }
        }
    }
}
module.exports = function (app) {

    app.get('/', function (req, res) {
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

    app.get('/course/:courseCode/:title', function (req, res) {
        var courseCode = req.params.courseCode;
        var title = req.params.title;
        Course.where({
            courseCode: courseCode,
            title: title
        }).findOne().populate('sections').lean().exec(function (err, myCourse) {
            if (err) {
                res.json({
                    status: 404,
                    msg: "Errors when trying to find the course for enrollment"
                })
            } else if (myCourse) {
                // Populating catalog
                Section.populate(myCourse['sections'], {path: 'catalogs'}, function (err, data) {
                    getFixedVaryingMeetings(myCourse);
                    res.send(JSON.parse(JSON.stringify(myCourse)));
                });
            }
        });
    });
}
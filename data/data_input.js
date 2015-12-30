var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var Catalog = require('../model/catalog');
var Course = require('../model/course');
var Section = require('../model/section');
var User = require('../model/user');
var allData = require("./york_data0.json");

/*
function readFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                return rawFile.responseText;
            }
        }
    };
    rawFile.send(null);
}*/

function getTerm(rawStr) {
    var rawSplit = rawStr.split(' ');
    return rawSplit[1];
}

function getSectionCode(rawStr) {
    var rawSplit = rawStr.split(' ');
    return rawSplit[3];
}

function getSectionDirector(rawStr) {
    var rawSplit = rawStr.split(':');
    var returnVal = rawSplit[1];
    return returnVal.substring(1);
}


function getDayStarttimeDuration(timingInput) {
    if (timingInput == null) {
        return null;
    }


    //"M--12:00--120--YH  045      (Glendon campus)--||T--12:00--120--YH  B211     (Glendon campus)--||"
    var meeting, res, temp, meetingInfo;
    var daysEnum = {
        M: "Monday",
        T: "Tuesday",
        W: "Wednesday",
        R: "Thursday",
        F: "Friday"
    }
    var meetings = timingInput.split("||");
    // ["M--12:00--120--YH  045      (Glendon campus)--", "T--12:00--120--YH  B211     (Glendon campus)--", ""]
    res = [];
    for (var i = 0; i < meetings.length; i++) {

        if (meetings[i]) {

            temp = {};

            meetingInfo = meetings[i].split("--");
            //["M", "12:00", "120", "YH  045      (Glendon campus)", ""]

            temp = {
                day: daysEnum[meetingInfo[0]],
                startTime: meetingInfo[1],
                duration: meetingInfo[2],
                location: meetingInfo[3]
            };

            res.push(temp);
        }
    }
    return res[0];
}

function getCourseTitleInfo(inputString){
        console.log(inputString);

    if (inputString == null) {
        return null;
    }

    //Swapping for standard whitespaces 
    inputString = inputString.replace(" ", " ");

    var FacCode  = inputString.split("/")[0];
    var courseCodeAndTitle = inputString.split("/")[1]; // RYER 4000   3.00 Ryerson York Exchange Course

    var arrayOfcourseCodeAndTitle = courseCodeAndTitle.split("  "); //[RYER 4000, 3.00 Ryerson York Exchange Course]

    var resCourseCode = arrayOfcourseCodeAndTitle[0].replace(' ', '');
    var resCredit = arrayOfcourseCodeAndTitle[1].trim().split(' ')[0];
    var resCourseTitle = arrayOfcourseCodeAndTitle[1].trim().replace(resCredit, '');

    return {courseCode: resCourseCode.trim(), credit: resCredit.trim(), courseName: resCourseTitle.trim()};

}
module.exports = function () {
    var row, field;
    var dataFields = {
        FACCODE: 0,
        COURSE_TITLE: 1,
        COURSE_DESC: 2,
        TERM_AND_SECTION: 3,
        SECTION_DIRECTOR: 4,
        CAT_NUM: 5,
        REQ_MEETING_INSTRUCTOR: 6,
        REQ_MEETING_TYPE: 7,
        REQ_MEETING_DAY_START_TIME_DURATION: 8,
        VARY_MEETING_INSTRUCTOR: 9,
        VARY_MEETING_TYPE: 10,
        VARY_MEETING_DAY_START_TIME_DURATION: 11
    };
    
    
    
    for (var i = 0; i < allData.rows.length; i++){
        
        //Checking if row has null on keys
        if (!allData.rows[i][dataFields.COURSE_TITLE] || !allData.rows[i][dataFields.TERM_AND_SECTION] || !(allData.rows[i][dataFields.REQ_MEETING_DAY_START_TIME_DURATION] || allData.rows[i][dataFields.VARY_MEETING_DAY_START_TIME_DURATION])) {
            continue;
        }


        // Conversions
        var arrayCourseTitleInfo = getCourseTitleInfo(allData.rows[i][dataFields.COURSE_TITLE]);
        var varyingMeetingsInfo = getDayStarttimeDuration(allData.rows[i][dataFields.VARY_MEETING_DAY_START_TIME_DURATION]);


        //Courses
        console.log(i);
        var courseCode = arrayCourseTitleInfo.courseCode; //String
        var facultyCode =  allData.rows[i][dataFields.FACCODE].replace(" -", ""); //String
        var courseName = arrayCourseTitleInfo.courseName;  //String

        var indexOfFirstPrereq = allData.rows[i][dataFields.COURSE_DESC].indexOf("Prereq");
        var indexofFirstCourseExclusion = allData.rows[i][dataFields.COURSE_DESC].indexOf("Course credit exclusion");

        var prereqs = allData.rows[i][dataFields.COURSE_DESC].substring(indexOfFirstPrereq, indexofFirstCourseExclusion); //[String]
        var exclusions = allData.rows[i][dataFields.COURSE_DESC].substring(indexofFirstCourseExclusion); //[String]
        var courseNote = allData.rows[i][dataFields.COURSE_DESC].substring(0, indexOfFirstPrereq); //String

        //Sections
        var sectionCode = getSectionCode(allData.rows[i][dataFields.TERM_AND_SECTION]);
        var term = getTerm(allData.rows[i][dataFields.TERM_AND_SECTION]);
        var sectionDirector = getSectionDirector(allData.rows[i][dataFields.SECTION_DIRECTOR]);
        var sectionInstructors = allData.rows[i][dataFields.REQ_MEETING_INSTRUCTOR];
        var sectionMeeting = getDayStarttimeDuration(allData.rows[i][dataFields.REQ_MEETING_DAY_START_TIME_DURATION]);

        //Catalogs
        var catalogCode = allData.rows[i][dataFields.CAT_NUM];
        var catalogInstructors = allData.rows[i][dataFields.VARY_MEETING_INSTRUCTOR];
        var catalogMeeting = getDayStarttimeDuration(allData.rows[i][dataFields.VARY_MEETING_DAY_START_TIME_DURATION]);

        //If current row is not a catalog
        if (!allData.rows[i][dataFields.CAT_NUM]) {
            //Search for course
            Course.where({courseCode: courseCode}).findOne().populate('sections').lean().exec(function (err, myCourse) {
                //If course found
                if (myCourse) {
                    var sectionExists = false;
                    var sectionIndex = null;

                    // Populating catalog
                    Section.populate(myCourse['sections'], {path: 'catalogs'}, function (err, data) {

                        for (var ii = 0; ii < data.sections.length; ii++) {
                            if (data.sections[i].sectionCode == sectionCode) {
                                sectionExists = true;
                                sectionIndex = ii;
                            }
                        }

                        if (!sectionExists) {
                            //CREATE SECTION 
                            var newSection = new Section({
                                sectionCode: sectionCode,
                                term: term,
                                sectionDirector: sectionDirector,
                                instructors: sectionInstructors,
                                catalogs: [],
                                sectionMeetings: [sectionMeeting]
                            });
                            newSection.save();

                            //ADD SECTION TO COURSE
                            data.sections.push(newSection);
                            //SAVE
                            data.save();

                        } else {
                            //UPDATE SECTIONS
                            data.sections[sectionIndex].sectionMeetings.push(sectionMeeting);
                            //SAVE
                            data.save();
                        }


                    });

                    //If course is not found
                } else {
                    //CREATE SECTION
                    var newSection = new Section({
                        sectionCode: sectionCode,
                        term: term,
                        sectionDirector: sectionDirector,
                        instructors: sectionInstructors,
                        catalogs: [],
                        sectionMeetings: [sectionMeeting]
                    });
                    newSection.save();

                    //CREATE COURSE AND ADD SECTION TO COURSE
                    var newCourse = new Course({
                        courseCode: courseCode,
                        facultyCode: facultyCode,
                        prereqs: prereqs,
                        exclusions: exclusions,
                        sections: [newSection],
                        note: courseNote
                    });
                    newCourse.save();

                }
            });



            //If current row is a Catalog
        } else {
            //Search for course
            Course.where({courseCode: courseCode}).findOne().populate('sections').lean().exec(function (err, myCourse) {
                //If course found
                if (myCourse) {
                    var sectionExists = false;
                    var sectionIndex = null;

                    // Populating catalog
                    Section.populate(myCourse['sections'], {path: 'catalogs'}, function (err, data) {

                        for (var i = 0; i < data.sections.length; i++) {
                            if (data.sections[i].sectionCode == sectionCode) {
                                sectionExists = true;
                                sectionIndex = i;
                            }
                        }

                        if (!sectionExists) {
                            //CREATE CATALOG
                            var newCatalog = new Catalog({
                                catalogCode: catalogCode,
                                instructors: catalogInstructors,
                                meeting: [catalogMeeting]
                            });
                            newCatalog.save();

                            //CREATE SECTION AND ADD CATALOG TO SECTION
                            var newSection = new Section({
                                sectionCode: sectionCode,
                                term: term,
                                sectionDirector: sectionDirector,
                                instructors: sectionInstructors,
                                sectionMeetings: [],
                                catalogs: [newCatalog]
                            });
                            newSection.save();

                            //ADD SECTION TO COURSE
                            data.sections.push(newSection);
                            //SAVE
                            data.save();

                        } else {
                            //CREATE CATALOG
                            var newCatalog = new Catalog({
                                catalogCode: catalogCode,
                                instructors: catalogInstructors,
                                meeting: [catalogMeeting]
                            });
                            newCatalog.save();

                            //ADD CATALOG TO SECTION
                            data.sections[sectionIndex].push(newCatalog);
                            //SAVE
                            data.save();
                        }


                    });

                    //If course is not found
                } else {
                    //CREATE CATALOG
                    var newCatalog = new Catalog({
                        catalogCode: catalogCode,
                        instructors: catalogInstructors,
                        meeting: [catalogMeeting]
                    });
                    newCatalog.save();

                    //CREATE SECTION AND ADD CATALOG TO SECTION
                    var newSection = new Section({
                        sectionCode: sectionCode,
                        term: term,
                        sectionDirector: sectionDirector,
                        instructors: sectionInstructors,
                        catalogs: [newCatalog]
                    });
                    newSection.save();

                    //CREATE COURSE AND ADD SECTION TO COURSE
                    var newCourse = new Course({
                        courseCode: courseCode,
                        facultyCode: facultyCode,
                        prereqs: prereqs,
                        exclusions: exclusions,
                        sections: [newSection],
                        note: courseNote
                    });
                    newCourse.save();

                }
            });
        }
    }

};
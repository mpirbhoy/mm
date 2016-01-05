var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var Catalog = require('../model/catalog');
var Course = require('../model/course');
var Section = require('../model/section');
var User = require('../model/user');
var allData = require("./york_data0.json");
var async = require("async");
var i = -1;
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
    var rawSplit = rawStr.replace('  ', ' ').split(' ');
    return rawSplit[3];
}

function getSectionDirector(rawStr) {
    var rawSplit = rawStr.split(':');
    var returnVal = rawSplit[1];
    return returnVal.substring(1);
}


function getDayStarttimeDuration(timingInput, myType) {
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
    };
    var meetings = timingInput.split("||");
    // console.log("meetings.length =" + meetings.length);
    if (meetings.length < 2){
        meetings = timingInput.split("|");
    }
    //var meetings = timingInput.split("|");
    // ["M--12:00--120--YH  045      (Glendon campus)--", "T--12:00--120--YH  B211     (Glendon campus)--", ""]
    res = [];
    for (var ii = 0; ii < meetings.length; ii++) {

        if (meetings[ii]) {

            temp = {};

            meetingInfo = meetings[ii].split("--");
            //["M", "12:00", "120", "YH  045      (Glendon campus)", ""]

            function timeToMins(time) {
                var b = time.split(':');
                return b[0]*60 + +b[1];
            }

            function timeFromMins(mins) {
                function z(n){return (n<10? '0':'') + n;}
                var h = (mins/60 |0) % 24;
                var m = mins % 60;
                return z(h) + ':' + z(m);
            }

            function addTimes(dur, start) {
                return timeFromMins(parseInt(dur) + timeToMins(start));
            }

            temp = {
                day: daysEnum[meetingInfo[0]] || null,
                startTime: meetingInfo[1],
                duration: meetingInfo[2],
                endTime: (addTimes(meetingInfo[2], meetingInfo[1])),
                location: meetingInfo[3] || null
            };

            res.push(temp);
        }
    }
    return {
        type: myType,
        timings: res
    };
}


function getCourseTitleInfo(inputString) {

    if (inputString == null) {
        return null;
    }

    //Swapping for standard whitespaces 
    inputString = inputString.replace("   ", " ").replace("  ", " ");

    var FacCode = inputString.split("/")[0];
    var courseCodeAndTitle = inputString.split("/")[1]; // RYER 4000   3.00 Ryerson York Exchange Course

    var arrayOfcourseCodeAndTitle = courseCodeAndTitle.split(" ");
    //console.log("arrayOfcourseCodeAndTitle = " + arrayOfcourseCodeAndTitle);
    //[RYER 4000, 3.00 Ryerson York Exchange Course]

    arrayOfcourseCodeAndTitle[0].replace("  ", " ");
    var resCourseCode = arrayOfcourseCodeAndTitle[0] + arrayOfcourseCodeAndTitle[1];
    var resCredit = arrayOfcourseCodeAndTitle[2];

    var resCourseTitle = "";
    for (var ii = 3; ii < arrayOfcourseCodeAndTitle.length; ii++) {
        resCourseTitle += arrayOfcourseCodeAndTitle[ii] + " ";
    }
    return {
        courseCode: resCourseCode.trim(),
        credit: resCredit.trim(),
        courseName: resCourseTitle.trim(),
        facCode: FacCode.trim()
    };

}
function doStupidShit(callback) {
//    allData.rows.forEach(function(value, i) {

    //for (var i = 0; i < allData.rows.length; i++){

    //Checking if row has null on keys
    if (!allData.rows[i][dataFields.COURSE_TITLE] || !allData.rows[i][dataFields.TERM_AND_SECTION] || !(allData.rows[i][dataFields.REQ_MEETING_DAY_START_TIME_DURATION] || allData.rows[i][dataFields.VARY_MEETING_DAY_START_TIME_DURATION])) {
        callback();
        return;
    }


    // Conversions
    var arrayCourseTitleInfo = getCourseTitleInfo(allData.rows[i][dataFields.COURSE_TITLE]);
    var varyingMeetingsInfo = getDayStarttimeDuration(allData.rows[i][dataFields.VARY_MEETING_DAY_START_TIME_DURATION], allData.rows[i][dataFields.VARY_MEETING_TYPE]);


    //Courses
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!111!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log(i);
    var courseCode = arrayCourseTitleInfo.courseCode; //String
    console.log(courseCode);
    var facultyCode = arrayCourseTitleInfo.facCode; //String
    console.log(facultyCode);
    var courseName = arrayCourseTitleInfo.courseName;  //String
    console.log(courseName);

    var indexOfFirstPrereq = allData.rows[i][dataFields.COURSE_DESC].indexOf("Prereq");
    var indexofFirstCourseExclusion = allData.rows[i][dataFields.COURSE_DESC].indexOf("Course credit exclusion");

    var prereqs = allData.rows[i][dataFields.COURSE_DESC].substring(indexOfFirstPrereq, indexofFirstCourseExclusion); //[String]
    console.log(prereqs);
    var exclusions = allData.rows[i][dataFields.COURSE_DESC].substring(indexofFirstCourseExclusion); //[String]
    console.log('------------------------------------');
    console.log(exclusions);
    var courseNote = allData.rows[i][dataFields.COURSE_DESC].substring(0, indexOfFirstPrereq); //String
    console.log('------------------------------------');
    console.log(courseNote);

    //Sections
    var sectionCode = getSectionCode(allData.rows[i][dataFields.TERM_AND_SECTION]);
    console.log(sectionCode);
    var term = getTerm(allData.rows[i][dataFields.TERM_AND_SECTION]);
    console.log(term);
    var sectionDirector = getSectionDirector(allData.rows[i][dataFields.SECTION_DIRECTOR]);
    console.log(sectionDirector);
    var sectionInstructors = allData.rows[i][dataFields.REQ_MEETING_INSTRUCTOR];
    console.log(sectionInstructors);
    var sectionMeeting = getDayStarttimeDuration(allData.rows[i][dataFields.REQ_MEETING_DAY_START_TIME_DURATION], allData.rows[i][dataFields.REQ_MEETING_TYPE]);
    console.log(sectionMeeting);

    //Catalogs
    var catalogCode = allData.rows[i][dataFields.CAT_NUM];
    console.log(catalogCode);
    var catalogInstructors = allData.rows[i][dataFields.VARY_MEETING_INSTRUCTOR];
    console.log(catalogInstructors);
    var catalogMeeting = getDayStarttimeDuration(allData.rows[i][dataFields.VARY_MEETING_DAY_START_TIME_DURATION], allData.rows[i][dataFields.VARY_MEETING_TYPE]);
    console.log(catalogMeeting);

    //If current row is not a catalog
    if (!allData.rows[i][dataFields.CAT_NUM]) {
        //Search for course
        Course.where({courseCode: courseCode}).findOne().populate('sections').exec(function (err, myCourse) {

            //If course found
            if (myCourse) {
                var sectionExists = false;
                var sectionIndex = null;

                // Populating catalog
                Section.populate(myCourse['sections'], {path: 'catalogs'}, function (err, data) {

                    for (var ii = 0; ii < data.length; ii++) {
                        if (data[ii].sectionCode == sectionCode) {
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
                            sectionMeetings: [sectionMeeting],
                            debug_course: courseCode

                        });
                        newSection.save();

                        //ADD SECTION TO COURSE
                        myCourse.sections.push(newSection);
                        //SAVE
                        myCourse.save();
                        callback();
                    } else {
                        //UPDATE SECTIONS

                        myCourse.sections[sectionIndex].sectionMeetings.push(sectionMeeting);
                        //SAVE
                        myCourse.sections[sectionIndex].markModified('sectionMeetings');
                        myCourse.sections[sectionIndex].save();
                        callback();
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
                    sectionMeetings: [sectionMeeting],
                    debug_course: courseCode

                });
                newSection.save();

                //CREATE COURSE AND ADD SECTION TO COURSE
                var newCourse = new Course({
                    courseCode: courseCode,
                    facultyCode: facultyCode + " " + i,
                    prereqs: prereqs,
                    exclusions: exclusions,
                    sections: [newSection],
                    title: courseName,
                    note: courseNote
                });
                newCourse.save();
                callback();

            }
        });


        //If current row is a Catalog
    } else {
        //Search for course
        Course.where({courseCode: courseCode}).findOne().populate('sections').exec(function (err, myCourse) {
            //If course found
            if (myCourse) {
                var sectionExists = false;
                var sectionIndex = null;

                // Populating catalog
                Section.populate(myCourse['sections'], {path: 'catalogs'}, function (err, data) {
                    if (data) {
                        for (var ii = 0; ii < data.length; ii++) {
                            if (data[ii].sectionCode == sectionCode) {
                                sectionExists = true;
                                sectionIndex = ii;
                            }
                        }
                    }

                    if (!sectionExists) {
                        //CREATE CATALOG
                        var newCatalog = new Catalog({
                            catalogCode: catalogCode,
                            instructors: catalogInstructors,
                            meeting: catalogMeeting,
                            debug_course: courseCode,
                            debug_section: sectionCode
                        });
                        newCatalog.save();

                        //CREATE SECTION AND ADD CATALOG TO SECTION
                        var newSection = new Section({
                            sectionCode: sectionCode,
                            term: term,
                            sectionDirector: sectionDirector,
                            instructors: sectionInstructors,
                            sectionMeetings: [],
                            catalogs: [newCatalog],
                            debug_course: courseCode
                        });
                        newSection.save();

                        //ADD SECTION TO COURSE
                        //myCourse.sections = newSection;
                        myCourse.sections.push(newSection); //TODO: Bug?
                        //SAVE
                        myCourse.save();
                        callback();

                    } else {
                        //CREATE CATALOG
                        var newCatalog = new Catalog({
                            catalogCode: catalogCode,
                            instructors: catalogInstructors,
                            meeting: catalogMeeting,
                            debug_course: courseCode,
                            debug_section: sectionCode
                        });
                        newCatalog.save();


                        /*//ADD CATALOG TO SECTION
                         data[sectionIndex].catalogs.push(newCatalog);
                         //SAVE
                         myCourse.sections[sectionIndex] = data;
                         myCourse.save();*/
                        //ADD CATALOG 0TO SECTION
                    /*myCourse.sections[sectionIndex].catalogs.push(newCatalog);
                        //SAVE
                    myCourse.save();*/
                        data[sectionIndex].catalogs.push(newCatalog);
                        data[sectionIndex].save();
                        callback();
                    }


                });

                //If course is not found
            } else {
                //CREATE CATALOG
                var newCatalog = new Catalog({
                    catalogCode: catalogCode,
                    instructors: catalogInstructors,
                    meeting: catalogMeeting,
                    debug_course: courseCode,
                    debug_section: sectionCode
                });
                newCatalog.save();

                //CREATE SECTION AND ADD CATALOG TO SECTION
                    var newSection = new Section({
                    sectionCode: sectionCode,
                    term: term,
                    sectionMeetings: [],
                    sectionDirector: sectionDirector,
                    instructors: sectionInstructors,
                    catalogs: [newCatalog],
                        debug_course: courseCode

                    });
                newSection.save();

                //CREATE COURSE AND ADD SECTION TO COURSE
                var newCourse = new Course({
                    courseCode: courseCode,
                    facultyCode: facultyCode + " " + i,
                    prereqs: prereqs,
                    exclusions: exclusions,
                    sections: [newSection],
                    title: courseName,
                    note: courseNote
                });
                newCourse.save();
                callback();

            }
        });
    }
}
module.exports = function () {

    async.whilst(
        function () {
            console.log("this is the i : " + i);
            console.log(allData.rows.length);
            console.log("comparison of length with i " + (i < allData.rows.length));
            return i < allData.rows.length - 1;
        }, function (callback) {
            i++;
            doStupidShit(callback);
        }, function (err) {
            console.log("Happy");
        }
    );
};
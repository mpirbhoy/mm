var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var Catalog = require('../model/catalog');
var Course = require('../model/course');
var Section = require('../model/section');
var User = require('../model/user');

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
}

function getDayStarttimeDuration(timingInput) {
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
    return res;
}

function getCourseTitleInfo(inputString){
    // input:             "SC/RYER 4000   3.00 Ryerson York Exchange Course",
    // Need var courseCode; //String
    //      var courseName; //String
    //      var FACCODE
    var FacCode  = inputString.split("/");
    
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
    var dataLoc = 'file:///Users/franklai/code/mm/data/york_data0.json';
    var allData = readFile(dataLoc);
    
    //
    for (var i = 0; i < allData.rows.length; i++){
        
        // Conversions
        var arrayCourseTitleInfo = getCourseTitleInfo(allData[i][dataFields.COURSE_TITLE]);
        var varyingMeetingsInfo = getDayStarttimeDuration(allData[i][dataFields.VARY_MEETING_DAY_START_TIME_DURATION]);
        
        
        //Courses
        var courseCode = allData[i][dataFields.FACCODE].replace(" -"); //String
        var facultyCode; //String
        var courseName; //String
        var prereqs; //[String]
        var exclusions; //[String]
        var courseNote; //String

        //Sections
        var sectionCode; //String
        var sectionDirector; //String
        var sectionInstructors; //String
        var sectionMeeting; //JSON Object (refer to Schema)
        
        //Catalogs
        var catalogCode; //String
        var catalogInstructors; //String
        var catalogMeeting; //JSON Object (refer to Schema)
        

        
        //If current row is not a catalog
        if (!allData[i][dataFields.CAT_NUM]) {
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
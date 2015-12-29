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

function getDayStarttimeDurationt(){

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

    for (var i = 0; i < allData.rows.length; i++){
        if (allData[i][dataFields.CAT_NUM]) {
            //TODO: Find if Cat exists
            getDayStarttimeDuration(alldata[i][dataFields.VARY_MEETING_DAY_START_TIME_DURATION]);
            new Catalog({
                catalogCode: alldata[i][dataFields.CAT_NUM],
                instructors: allData[i][dataFields.VARY_MEETING_INSTRUCTOR],
                meeting: {type: allData[i][dataFields.VARY_MEETING_TYPE],
                    timings: [allData[i][dataFields.VAR]] }
            })

        }
    }

};

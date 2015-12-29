var mongoose = require('mongoose');

//Model for University Courses 
module.exports = mongoose.model('Course',{
    deptCode: {type:String, required: true}, //deptCode
    courseNum:{type: String, required: true}, //courseNum for course
    courseName: String,	//title of the course
    prereqs: String,  //prerequisites for the course
    exclusions: String, //exclusions for the course
    sections:[{type: mongoose.Schema.Types.ObjectId, ref: 'Section' }], //Sections of Course
    note: String
});


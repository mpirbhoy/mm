var mongoose = require('mongoose');

//Model for University Courses 
module.exports = mongoose.model('Course',{
    courseCode: {type:String, required: true}, //courseCode
    facultyCode: String,
    courseName: String,	//title of the course
    credits: String, //credits for course
    prereqs: [String],  //prerequisites for the course
    exclusions: [String], //exclusions for the course
    sections:[{type: mongoose.Schema.Types.ObjectId, ref: 'Section' }], //Sections of Course
    note: String
});


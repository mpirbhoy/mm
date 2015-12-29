var mongoose = require('mongoose');

//Model for University Courses 
module.exports = mongoose.model('Course',{
    sectionCode: {type: String, required:true},//sectioncode for Section
    term: {type:String, required:true},//term for Section
    sectionDirector: {type: String, required: true},//Director for Section
    instructors: String, //instructors for the Section
    catalogs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Catalog' }], //Catalogs belonging to Section
    sectionMeetings: [{
    	type: String,
    		timings: {	day: String, 
    					startTime: String, 
    					duration: String,
    					location: String
    				}

    }]
});


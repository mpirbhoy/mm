var mongoose = require('mongoose');

//Model for University Courses 
module.exports = mongoose.model('Course',{
    sectionCode: {type: String, required:true},//sectioncode for Section
    sectionDirector: {type: String, required: true},//Director for Section
    instructors: String, //instructors for the Section
    catalogs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Catalog' }], //Catalogs belonging to Section
    fixedMeetings: {
    	{type: String, 
    		timings: {	day: String, 
    					startTime: String, 
    					duration: String,
    					location: String
    				}
    	}
    }
});


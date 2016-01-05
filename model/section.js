var mongoose = require('mongoose');

//Model for Sections of Course
module.exports = mongoose.model('Section',{
    sectionCode: {type: String, required:true},//sectioncode for Section
    term: {type:String, required:true},//term for Section
    sectionDirector: {type: String, required: true},//Director for Section
    instructors: String, //instructors for the Section
    catalogs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Catalog' }], //Catalogs belonging to Section
    debug_course: String,
    sectionMeetings: [{
    	type: {type: String},
    		timings: [{	day: String,
    					startTime: String, 
    					duration: String,
                        endTime: String,
    					location: String
    				}]

    }]
});


var mongoose = require('mongoose');

//Model for Catalog within Section
module.exports = mongoose.model('Catalog',{
    catalogCode: {type: String, required:true},//sectioncode for Catalog
    instructors: String, //instructors for the Catalog
	debug_course: String,
	debug_section: String,
    meeting: {
    	type: {type: String},
    		timings: [{	day: String,
    					startTime: String,
    					duration: String,
						endTime: String,
    					location: String
    				}]
    }
});



var mongoose = require('mongoose');

//Model for Catalog within Section
module.exports = mongoose.model('Catalog',{
    catalogCode: {type: String, required:true},//sectioncode for Catalog
    instructors: String, //instructors for the Catalog
    meeting: {
    	type: String,
    		timings: [{	day: String,
    					startTime: String,
    					duration: String,
    					location: String
    				}]
    }
});



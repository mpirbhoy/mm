var mongoose = require('mongoose'); 
var Course = require('./course');

//Model for Users 
module.exports = mongoose.model('User',{
	facebookId : String, //Facebook ID of User
    email: {type:String, unique: true},  //Email of user
    facebookToken: String, //Facebook Token of User
    facebookGivenName: {type: String, defualt: ''}, //Facebook Name of User
    facebookFamilyName: {type: String, defualt: ''}, //Facebook Name of User
    facebookProfilePicture: String, //Facebook Profile Picture Path of User
	auth : { type: String, default: 'user' }, //Authorization (Admin/User)
	selections: {
		courses: {type: mongoose.Schema.Types.ObjectId, ref: 'Course'},
		sections: {type: mongoose.Schema.Types.ObjectId, ref: 'Section'},
		sections: {type: mongoose.Schema.Types.ObjectId, ref: 'Catalog'}
	}
});

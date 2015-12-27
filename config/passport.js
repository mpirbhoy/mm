//Facebook Configuration
var FACEBOOK_APP_ID = "104977756536702";
var FACEBOOK_APP_SECRET = "af3e54581686fcf0a7885252bf23339d";
var request = require('request');
module.exports = function (passport) {

    //Strategies for PassportJS
    var User = require('../model/user');
    var FacebookStrategy = require('passport-facebook').Strategy;
    
    //Serialzing User
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    //Deserializing USer
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    //Allows user to log in using Facebook 
    passport.use(new FacebookStrategy({
            clientID: FACEBOOK_APP_ID,
            clientSecret: FACEBOOK_APP_SECRET,
            callbackURL: "http://localhost:3000/auth/facebook/callback",
            profileFields: ['id', 'name', 'displayName', 'email']
        },
        function (token, refreshToken, profile, done) {
            process.nextTick(function () {

                // find the user in the database based on their facebook id
                User.findOne({email: profile.emails[0].value}, function (err, user) {

                    // if there is an error, return error 
                    if (err)
                        return done(err);

                    // if the user is found, then log him in
                    if (user) {
                        return done(null, user); 
                    } else {

                        // Get Facebook Profile picture
                        var facebookAPIEndPoint = "https://graph.facebook.com/";
                        var facebookAPIGetPicturePath = "/picture";

                        request(facebookAPIEndPoint + profile.id + facebookAPIGetPicturePath + "/?type=large&redirect=false", function (error, response, body) {

                            User.findOne({}, function (error2, adminUser) {

                                //if there are any errors, return the error
                                if (error2)
                                    return done(error2);

                                // if there is no user found with that facebook id, create them
                                var newUser = new User();

                                // Set all of the facebook information in our Database
                                newUser.facebookId = profile.id; // Set the users facebook id
                                newUser.email = profile.emails[0].value;
                                newUser.facebookToken = token; // We will save the token that facebook provides to the user
                                newUser.facebookGivenName = profile.name.givenName; 
                                newUser.facebookFamilyName = profile.name.familyName; 

                                //If no user exists in database, then this User should be Admin
                                if (adminUser == null) {
                                    newUser.auth = 'admin';
                                }

                                if (!error) {
                                    body = JSON.parse(body);
                                    newUser.facebookProfilePicture = body.data.url;
                                }
                                // save our user to the database
                                newUser.save(function (err) {
                                    if (err)
                                        throw err;

                                    // if successful, return the new user
                                    return done(null, newUser);
                                });
                            });

                        });
                    }

                });
            });
        }
    ));
}
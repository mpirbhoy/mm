module.exports = function() {

	var pg = require('pg');

	var stringA = '';

	pg.connect(process.env.DATABASE_URL, function(err, client) {
	  if (err) throw err;
	  console.log('Connected to postgres! Getting schemas...');

	  client
	    .query('SELECT * FROM table1;')
	    .on('row', function(row) {
	      stringA = stringA.concat(' ');
	      stringA = stringA.concat(JSON.stringify(row));
	      stringA = stringA.concat('               ');
	    });
	    
	});

	return stringA;
}
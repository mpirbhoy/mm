module.exports = function() {

	var pg = require('pg');
	var createString = 'CREATE TABLE table1(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)';
	var insertString = 'INSERT INTO table1(text, complete)';

	pg.connect(process.env.DATABASE_URL, function(err, client) {
	  if (err) throw err;
	  console.log('Connected to postgres! Getting schemas...');
	  var createQuery = client.query(createString);
	  createQuery.on('end', function() {
	  	var insertQuery = client.query(text: insertString,
	  								   values: ['testing123', true]);
	  	insertQuery.on('end', function() { client.end(); });	
	  })

	});
}
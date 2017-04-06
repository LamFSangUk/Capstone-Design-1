var express = require('express')
var app = express()
var fs = require('fs')

// Connect to mysql
var mysql = require('mysql')
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'sensor',
	password : 'ieat1522',
	database : 'data'
});

connection.connect();	

app.get('/', function(req,res){
	res.send('Hello World!')
	console.log(req.query)
	
	fs.appendFile('LOG.txt',req.query.temp+'\n', function(err){
		if(err){
			return console.log(err)
		}
	})
	r={};
	r.seq=1;
	r.type='T';
	r.device='102';
	r.unit='0';
	r.ip='163.239.78.71'
	r.value=req.query.temp;

	connection.query('INSERT INTO sensors SET ?',r,function(err,rows,cols){
		if(err){
			console.log(err);
		}

		console.log('done');	
	});
})

app.get('/dump',function(req,res){
	connection.query('SELECT * from sensors LIMIT 1440',function(err,rows,cols){
		if(err) throw err;

		console.log(rows);
		res.send(rows);
	});
})

app.listen(3000, function(){
	console.log('Example app listening on port 3000!')
})

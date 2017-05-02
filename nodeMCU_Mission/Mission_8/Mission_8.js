var express = require('express')
var app = express()
var fs = require('fs')

// Connect to mysql
var mysql = require('mysql')
var db_config = {
	host : 'localhost',
	user : 'sensor',
	password : 'sgcapstone5',
	database : 'data'
};

var connection;

function handleDisconnect(){
	connection = mysql.createConnection(db_config);

	connection.connect(function(err){
		if(err){	
			console.log('Error when connectiong to DB:',err);
			setTimeout(handleDisconnect,2000);
		}
	});

	connection.on('error',function(err){
		console.log('db error',err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST'){
			handleDisconnect();
		} else {
			throw err;
		}
	});
}

handleDisconnect();

//To Write the current time.
var dateTime = require('node-datetime');

//To Get IP addr.
var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

count=0; // the number of input temperature data after start server.

//Work with http call command
//Write the temperature record in local txt file and DB.
app.get('/', function(req,res){
	
	//Send the current time and temperature to Client.
	if(req.query.temp && typeof req.query.temp!='undefined'){

		var dt = dateTime.create();
		var formatted = dt.format('Y-m-d H:M:S');
		res.send(formatted+' Temp:'+req.query.temp);
		console.log(formatted+' Temp:'+req.query.temp);
	
		//Write to local TXT file.
		fs.appendFile('LOG.txt',req.query.temp+'\n', function(err){
			if(err) throw err;
		});
			
		data={};
		data.seq=count++;
		data.type='T';		//Means 'Temperature'
		data.device='102';	
		data.unit='0';
		data.ip=addresses;
		data.value=req.query.temp;
	
		//Insert data to DB by query 
		connection.query('INSERT INTO sensors SET ?',data,function(err,rows,cols){
			if(err) throw err;
		
			console.log('Done Insert Query');	
		});
	}
	else{
		res.send('Unauthorized Access');
	}
})

//Work with dump command
//Show recent 1440(one day) temperature records.
app.get('/dump',function(req,res){
	console.log('Got app.get(dump)');
	//Get Recent data from DB by query
	connection.query('SELECT * from sensors ORDER BY id DESC LIMIT 1440',function(err,rows,cols){
		if(err) throw err;
		
		res.write('<html><head><title>AS 1016 Temperature</title></head><body>');		
		res.write('<p><h1>Measure Temperature @ AS 1016, Sogang Univ.</h1></p>');
		res.write('<p>Developed By SangUk Park</p>');	
		
		var dt = dateTime.create();
		var formatted = dt.format('Y-m-d H:M:S');
		res.write('<p>Dump '+rows.length+' data at '+formatted+'</p>');
		
		//Parse data to send Client

		//Send text-plain data
		/*var dumpdata = '';	
		for(var i=0; i<rows.length;i++){
			var row = rows[i];
			dumpdata=dumpdata+i+'\t: Time:'+row.time+'\t Temp:'+row.value+'\n';
		}
		res.set('Content-Type','text/plain');
		res.send(dumpdata);
		*/
		
		//Send HTML table
		res.write('<table border="1">');
		res.write('<tr><th>Seq.</th><th>Time</th><th>Temp</th></tr>');
		for(var i=0;i<rows.length;i++){
			var row=rows[i];
			res.write('<tr>');
			res.write('<td>'+i+'</td><td>'+row.time+'</td><td>'+row.value+'</td>');
			res.write('</tr>');
		}	
		res.end('</table></body></html>');
		console.log('Dump Complete');
	});
})

//Mission_8: Using GoogleChart
app.get('/graph',function(req,res){
	console.log('Got app.get(graph)');
	var html = fs.readFile('./graph1.html',function(err,html){
		html=" "+html;
		console.log('read file');

		var qstr = 'SELECT * from sensors ORDER BY time';
		connection.query(qstr, function(err, rows, cols){
			if(err) throw err;
			
			var data="";
			var comma = "";
			for (var i=0; i<rows.length;i++){
				r = rows[i];
				var date=new Date(r.time).toLocaleString().split(' ');
				//console.log(date);
				var ymd=date[0].split('-');
				var hms=date[1].split(':');
				data+=comma+"[new Date("+ymd[0]+","+ymd[1]+","+ymd[2]+","+hms[0]+","+hms[1]+","+hms[2]+"),"+r.value + "]";
				comma=",";
			}
			var header = "data.addColumn('date','Date/Time');";
			header+="data.addColumn('number','Temp');";
			html=html.replace("<%COLUMN%>",header);
			html=html.replace("<%DATA%>",data);

			res.writeHeader(200,{"Content-Type": "text/html"});
			res.write(html);
			res.end();			
		});
	});
})

app.listen(3000, function(){
	console.log('Temperature Measuring Program listening on port 3000!')
})

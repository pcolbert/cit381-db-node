"use strict";

var mysql = require('mysql');
var dbInfo = require('./dbInfo.js');
var express = require('express');
var bodyParser = require("body-parser");

var app = express();

// Add static route for non-Node.js pages
app.use(express.static('public'));

// Configure body parser for handling post operations
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Since were depending on db connection, the connection could have been terminated, need to check and handle

// Create database connection
console.log('Creating connection...\n');
var connection = mysql.createConnection({
	host: dbInfo.dbHost,
	port: dbInfo.dbPort,
	user: dbInfo.dbUser,
	password: dbInfo.dbPassword,
	database: dbInfo.dbDatabase
});
// Connect to database
connection.connect(function(err) {
	console.log('Connecting to database...\n');

	// Handle any errors
	if (err) console.log(err);
	console.log('Connected to database...\n');
});

// Get regions
app.get('/region/:REGION_ID?', function (req, res) {
	console.log("Route /region GET", req.params);
	var data = [];
	var sql = "SELECT * FROM P5_REGION";
	if (req.params.REGION_ID != undefined) {
		sql += " WHERE REGION_ID = ?";
		data = [req.params.REGION_ID];
		console.log(data);
	} else {
		sql += " ORDER BY REGION_NAME";
	}
	console.log("SQL", sql);
	connection.query(sql, data,
		function (errQuery, rows) {
			if (errQuery) {
				console.log(errQuery);
				res.json({rows: [], err: errQuery});
			} else if (rows) {
				console.log("Rows returned", rows.length);
				res.json({rows: rows, err: ""});
			} else {
				console.log("No color rows...\n");
				res.json({rows: [], err: ""});
			}
		}
	);
});

// Add region
app.post('/region/add', function (req, res) {
	console.log("Route /region POST");
	if (req.body.region != undefined) {
		var data = {REGION_NAME: req.body.region};
		connection.query("INSERT INTO P5_REGION SET ?", 
			data, 
			function (errQuery, result) {
				if (errQuery) {
					console.log(errQuery);
					res.json({status: "Error", err: errQuery});
				} else {
					console.log("Insert ID: ", result.insertId);
					res.json({status: result.insertId, err: ""});
				}
			}
		);
	} else {
		var s = "Missiong region property";
		console.log(s);
		res.json({status: "Error", err: s});
	}
});

// Delete region
app.delete('/region/delete/:REGION_ID?', function (req, res) {
	console.log("Route /region DELETE");
	var sql = "DELETE FROM P5_REGION WHERE REGION_ID = ?";
	//  obj way: var sql = "DELETE FROM P5_REGION WHERE ?";
	if (req.params.REGION_ID != undefined) {
		var data = [req.params.REGION_ID];
		// obj way: var data = {REGION_ID: req.params.REGION_ID};
		connection.query(sql, 
			data, 
			function (errQuery, result) {
				if (errQuery) {
					console.log(errQuery);
					res.json({status: "Error", err: errQuery});
				} else {
					console.log("Deleted");
					res.json({status: "Deleted", err: ""});
				}
			}
		);
	} else {
		var s = "Invalid or missing REGION_ID";
		console.log(s);
		res.json({status: "Error", err: s});
	}
});

// Update region
app.put('/region/:REGION_ID?', function (req, res) {
	console.log("Route /region PUT");
	var sql = "UPDATE P5_REGION SET ? WHERE ?";
	if (req.params.REGION_ID != undefined || req.body.region != undefined) {
		var data = [{REGION_NAME: req.body.region}, {REGION_ID: req.params.REGION_ID}];
		connection.query(sql, 
			data, 
			function (errQuery, result) {
				if (errQuery) {
					console.log(errQuery);
					res.json({status: "Error", err: errQuery});
				} else {
					console.log("Updated");
					res.json({status: "Updated", err: ""});
				}
			}
		);
	} else {
		var s = "Invalid or missing REGION_ID, or missing region property";
		console.log(s);
		res.json({status: "Error", err: s});
	}
});


// Handle missing pages requested using GET HTTP verb
app.get('*', function(req, res) {
  res.status(404).send('Sorry that page does not exist');
});

// Add error handling in case the connection is closed?
app.listen(8080, function () {
  console.log('Server app listening on port 8080!');
});

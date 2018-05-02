"use strict";

let mysql = require('mysql');
let dbInfo = require('./dbInfo.js');
let express = require('express');
let bodyParser = require("body-parser");

let app = express();

// Add static route for non-Node.js pages
app.use(express.static('public'));

// Configure body parser for handling post operations
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Since were depending on db connection, the connection could have been terminated, need to check and handle

// Create database connection
console.log('Creating connection...\n');
let connection = mysql.createConnection({
	host: dbInfo.dbHost,
	port: dbInfo.dbPort,
	user: dbInfo.dbUser,
	password: dbInfo.dbPassword,
	database: dbInfo.dbDatabase
});
// Connect to database
connection.connect(err => {
	console.log('Connecting to database...\n');

	// Handle any errors
	if (err) {
		console.log(err);
	} else {
		console.log('Connected to database...\n');
		app.listen(8080, () =>{
		  console.log('Server app listening on port 8080!');
		});

	}
});

// Get regions
app.get('/region/:REGION_ID?', (req, res) => {
	console.log("Route /region GET", req.params);
	let data = [];
	let sql = "SELECT * FROM P5_REGION";
	if (req.params.REGION_ID != undefined) {
		sql += " WHERE REGION_ID = ?";
		data = [req.params.REGION_ID];
		console.log(data);
	} else {
		sql += " ORDER BY REGION_NAME";
	}
	console.log("SQL", sql);
	connection.query(sql, data,
		(errQuery, rows) => {
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
app.post('/region/add', (req, res) => {
	console.log("Route /region POST");
	if (req.body.region != undefined) {
		let data = {REGION_NAME: req.body.region};
		connection.query("INSERT INTO P5_REGION SET ?", 
			data, 
			(errQuery, result) => {
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
		let s = "Missiong region property";
		console.log(s);
		res.json({status: "Error", err: s});
	}
});

// Delete region
app.delete('/region/delete/:REGION_ID?', (req, res) => {
	console.log("Route /region DELETE");
	let sql = "DELETE FROM P5_REGION WHERE REGION_ID = ?";
	//  obj way: let sql = "DELETE FROM P5_REGION WHERE ?";
	if (req.params.REGION_ID != undefined) {
		let data = [req.params.REGION_ID];
		// obj way: let data = {REGION_ID: req.params.REGION_ID};
		connection.query(sql, 
			data, 
			(errQuery, result) => {
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
		let s = "Invalid or missing REGION_ID";
		console.log(s);
		res.json({status: "Error", err: s});
	}
});

// Update region
app.put('/region/:REGION_ID?', (req, res) => {
	console.log("Route /region PUT");
	let sql = "UPDATE P5_REGION SET ? WHERE ?";
	if (req.params.REGION_ID != undefined || req.body.region != undefined) {
		let data = [{REGION_NAME: req.body.region}, {REGION_ID: req.params.REGION_ID}];
		connection.query(sql, 
			data, 
			(errQuery, result) => {
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
		let s = "Invalid or missing REGION_ID, or missing region property";
		console.log(s);
		res.json({status: "Error", err: s});
	}
});

// Handle missing pages requested using GET HTTP verb
app.get('*', (req, res) => {
  res.status(404).send('Sorry that page does not exist');
});

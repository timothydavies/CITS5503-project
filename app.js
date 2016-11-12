var express = require("express");
var bodyParser = require("body-parser");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
var config = require("config.json");

var app = express();
app.use(express.static(__dirname + "/public"));
var jsonParser = app.use(bodyParser.json());
var urlencodedParser = app.use(bodyParser.urlencoded({
	extended: false})
);

MongoClient.connect(config.mongodbURL, function(err,db) {
	if (err) return console.dir(err);

	var users = db.createCollection("users", {w:1}, function(err, collection) {});
	var posts = db.createCollection("posts", {w:1}, function(err, collection) {});
	var users = db.collection("users", {w:1}, function(err, collection) {});
	var posts = db.collection("posts", {w:1}, function(err, collection) {});

	app.get("/", function(req, res) {
		res.sendFile("home.html", { root: __dirname + "/public"});
	});

	var getUserList = function(res){
		// Return a list of all users, streamed to reduce memory usage
		var cursor = users.find({});
		var userList = [];
		cursor.on("data", function(doc) {
			userList.push(doc);
		});
		cursor.once("end", function() {
			console.log("Sending user list");
			return res.status(200).json(userList);
		});
	}

	var getUserPosts = function(res, id){
		// Return a list of all users, streamed to reduce memory usage
		var cursor = posts.find({"author_id": id});
		// var cursor = posts.find({});
		var postList = [];
		cursor.on("data", function(doc) {
			postList.push(doc);
		});
		cursor.once("end", function() {
			console.log("Sending user's post list");
			console.dir(postList);
			return res.status(200).json(postList);
		});
	}

	// Handle user requests

	app.get("/get_users", function(req, res) {
		getUserList(res);
	});

	app.post("/add_user", function(req, res) {
		var name = req.body.name;
		// Add the user to the mongo collection
		var user = {"username": name};
		users.insert(user, {w:1}, function(err, collection) {});
		console.dir("Added user: " + JSON.stringify(user));
		// Update the client with the current user list
		getUserList(res);
	});

	app.post("/edit_user", function(req, res) {
		var id = req.body.id;
		var name = req.body.name;
		// Edit the user in the mongo collection
		users.update({_id: ObjectId(id)}, {$set:{username:name}}, {w:1}, function(err, result) {});
		console.dir("Edited user: " + JSON.stringify(req.body));
		// Update the client with the current user list
		getUserList(res);
	});

	app.post("/remove_user", function(req, res) {
		var id = req.body.id;
		// Remove the user from the mongo collection
		console.dir("Removing user: " + JSON.stringify(req.body));
		users.remove({_id: ObjectId(id)}, {w:1}, function(err, result) {
			if (err == null && result == 0) return;
			console.dir("err: " + err + ", result: " + result);
		});
		// Delete associated posts
		posts.remove({author_id: id}, {w:1}, function(err, result) {
			if (err == null && result == 0) return;
			console.dir("err: " + err + ", result: " + result);
		});
		
		// Update the client with the current user list
		getUserList(res);
	});

	// Handle "post" requests

	app.post("/get_posts", function(req, res) {
		var userid = req.body.userid;
		getUserPosts(res, userid);
	});

	app.post("/add_post", function(req, res) {
		var title = req.body.title;
		var content = req.body.content;
		var userid = req.body.userid;
		var date = Date.now();
		// Add the post to the mongo collection
		var post = {"title": title, "content": content, "author_id": userid, "date": date};
		posts.insert(post, {w:1}, function(err, collection) {});
		console.dir("Added post: " + JSON.stringify(post));
		// Update the client with the user's posts
		getUserPosts(res, userid);
	});

	app.post("/edit_post", function(req, res) {
		var id = req.body.id;
		var title = req.body.title;
		var content = req.body.content;
		var userid = req.body.userid;
		// Edit the post in the mongo collection
		posts.update({_id: ObjectId(id)}, {$set:{title:title, content:content, author_id:userid}}, {w:1}, function(err, result) {});
		console.dir("Edited user: " + JSON.stringify(req.body));
		// Update the client with the user's posts
		getUserPosts(res, userid);
	});

	app.post("/remove_post", function(req, res) {
		var id = req.body.id;
		var userid = req.body.userid;
		// Remove the post from the mongo collection
		console.dir("Removing post: " + JSON.stringify(req.body));
		posts.remove({_id: ObjectId(id)}, {w:1}, function(err, result) {
			if (err == null && result == 0) return;
			console.dir("err: " + err + ", result: " + result)
		});
		// Update the client with the user's posts
		getUserPosts(res, userid);
	});

	app.listen(config.serverPort, function() {
		console.log("CITS5503 project listening on port " + config.serverPort);
	});
});

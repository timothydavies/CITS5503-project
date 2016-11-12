var rootUrl = "http://localhost:3000/"
var userListg = [];
var postListg = [];

var populateUsers = function(userList) {
	userListg = userList;
	$(".select-user")
		.find("option")
		.remove()
		.end();
	for (i = 0; i < userList.length; i++) {
		$(".select-user")
			.append($("<option></option>")
			.attr("value", userList[i]._id)
			.text(userList[i].username));
	}
}

var showPostInEditor = function(post) {
	$("#post-title-input").val(post.title);
	$("#post-content-input").val(post.content);
	// adapted from http://stackoverflow.com/questions/1531093/how-to-get-current-date-in-javascript
	if (post.date == null) {
		$(".post-date").text("");
	} else {
		var d = new Date(post.date);
		var dd = d.getDate();
		var mm = d.getMonth()+1;
		var yyyy = d.getFullYear();

		if(dd<10) {
		    dd='0'+dd
		} 

		if(mm<10) {
		    mm='0'+mm
		}
		$(".post-date").text(dd+'/'+mm+'/'+yyyy);
	}
}

var populatePosts = function(postList) {
	postListg = postList;
	$("#select-post-modify")
		.find("option")
		.remove()
		.end();
	for (i = 0; i < postList.length; i++) {
		$("#select-post-modify")
			.append($("<option></option>")
			.attr("value", i)
			.text(postList[i].title));
		if (i == 0) {
			showPostInEditor(postList[0]);
		}
	}
	if (postList.length == 0) {
		$("#select-post-modify")
			.append($("<option></option>")
			.attr("value", -1)
			.text("no posts!"));
		showPostInEditor({title: "", content: "", date: null});
	}
}

var getPosts = function(userid) {
	$.post({
		url: rootUrl + "get_posts",
		data: {userid: userid},
		success: function (data) {
			console.log("Retrieved user posts");
			populatePosts(data);
		},
		dataType: "json"
	});
}

// User modification

$(".modal-footer .user-add").click(function(){
	var name = $("#user-input-add").val();
	$.post({
		url: rootUrl + "add_user",
		data: {name: name},
		success: function (data) {
			console.log("Added user: " + name);
			populateUsers(data);
		},
		dataType: "json"
	});
});

$(".modal-footer .user-edit").click(function(){
	var name = $("#user-input-add").val();
	var id = $("#select-user-modify").val();
	$.post({
		url: rootUrl + "edit_user",
		data: {id: id, name: name},
		success: function (data) {
			console.log("Edited user");
			populateUsers(data);
		},
		dataType: "json"
	});
});

$(".modal-footer .user-remove").click(function(){
	var id = $("#select-user-modify").val();
	$.post({
		url: rootUrl + "remove_user",
		data: {id: id},
		success: function (data) {
			console.log("Removed user: " + id);
			populateUsers(data);
		},
		dataType: "json"
	});
});

$(".refresh-users").click(function(){
	$.get({
		url: rootUrl + "get_users",
		success: function (data) {
			console.log("Retrieved users");
			populateUsers(data);
		},
		dataType: "json"
	});
});

$("#select-user-signin").change(function(){
	var userid = $("#select-user-signin").val();
	getPosts(userid);
});

// Post modifications

$("#select-post-modify").change(function() {
	var i = $("#select-post-modify").val();
	var post = postListg[i];
	showPostInEditor(post);
});

$(".modal-footer .post-add").click(function(){
	var title = $("#post-title-input").val();
	var content = $("#post-content-input").val();
	var userid = $("#select-user-signin").val();
	$.post({
		url: rootUrl + "add_post",
		data: {title: title, content: content, userid: userid},
		success: function (data) {
			console.log("Added post: " + title);
			populatePosts(data);
		},
		dataType: "json"
	});
});

$(".modal-footer .post-edit").click(function(){
	var i = $("#select-post-modify").val();
	var id = postListg[i]._id;
	var title = $("#post-title-input").val();
	var content = $("#post-content-input").val();
	var userid = $("#select-user-signin").val();
	$.post({
		url: rootUrl + "edit_post",
		data: {id: id, title: title, content: content, userid: userid},
		success: function (data) {
			console.log("Edited post");
			populatePosts(data);
		},
		dataType: "json"
	});
});

$(".modal-footer .post-remove").click(function(){
	var i = $("#select-post-modify").val();
	var id = postListg[i]._id;
	var userid = postListg[i].author_id;
	$.post({
		url: rootUrl + "remove_post",
		data: {id: id, userid: userid},
		success: function (data) {
			console.log("Removed post: " + id);
			populatePosts(data);
		},
		dataType: "json"
	});
});

$(document).ready(function(){
	$.get({
		url: rootUrl + "get_users",
		success: function (data) {
			console.log("Retrieved users");
			populateUsers(data);
		},
		dataType: "json"
	});
	window.setTimeout(function(){
		var userid = $("#select-user-signin").val();
		getPosts(userid);
	}, 200);
});
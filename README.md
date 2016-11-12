# CITS5503-project

## Purpose of the project

This project is a follow-up to Client 3, the Social Media Platform of the nosql essay. A mockup of a media platform has been produced which includes users and posts. The set of functional and non-functional requirements is reduced compared to the essay and are described below. Unlike in the essay, a graph database is not used to analyse the posts and instead the project focuses on using mongodb to store and retrieve data. This app can be extended to a cloud platform, such as AWS, and the mongodb database could then be horizontally scaled using sharding. However, sharding is to be set up manually rather than programatically. As far as the app is concerned it makes no difference whether sharding is enabled or not. I did test sharding on a single machine and have described the process in this readme.

## Functional requirements  

Users are stored as a single id and name. They are able to sign in, edit their name, be removed, and modify their posts. When a user is removed, posts are queried for a matching author id and removed.  
Posts store an id, their author's id, their title, content, and date they were created.  
When a user is selected the posts are queried for a matching author id.  
Posts may be added, edited, and removed.

## Non-functional requirements  

Performance, scalability, and availability are largely enhanced if mongodb sharding is used. However, there is room for improvement in the code itself. When querying data mongodb's synchronous calls are largely avoided to ensure up to date information is provided. This could be replaced with sychronous calls when up to date information is not required, such as when a user requests a list of user names or posts. Additionally, for debugging purposes and to test mongodb, the client does not remember much data and so regularly queries the server for the full list of users and posts.

Security was not considered here as the site itself is just a mock up. Encryption of passwords or other data could be added with such third party software as "bcrypt" https://www.npmjs.com/package/bcrypt-nodejs.  
Users are considered to be trusted for the purposes of this project.

Reliability: The app itself performs checks for errors in most functions. The reliability of the database depends on the setup by the admin.

## Installation 
### Prerequisites

On an ubuntu instance, run the following commands to install dependencies
`sudo apt-get update`  
`sudo apt-get install git`  
`sudo apt-get install nodejs`  
`sudo apt-get install npm`  
`sudo apt-get install mongodb`

### Cloning the repository

You may clone the repository with the command:  
`git clone https://github.com/timothydavies/CITS5503-project`  
Enter the repository directory and run the command  
`npm install` to install all dependencies

### Config

The variables in the config file include:  
`mongodbURL` The mongodb url, of the form "mongodb://[url]:[port]/[database]".  
`serverPort` The port the app runs on.

## Running the server

Run mongodb using the command  
`sudo mongodb`  
Run the server using the command  
`node app.js`

## Using the client

Connect to the server using its url and port. Initially, the database should be empty. You can add users by filling in the text box and clicking 'add'. You can then edit or remove users by selecting them in the dropdown and clicking 'Edit' or 'Remove'. Posts for each user can similarly be modified.

## Sharding

Given a url to the mongo database the app will create or retrieve two collections: `users` and `posts`. However, it is bad practice for sharding to be enabled programatically and so a tutorial is provided here as a substitute.

The tutorial provided here is adapted from here: https://www.digitalocean.com/community/tutorials/how-to-create-a-sharded-cluster-in-mongodb-using-an-ubuntu-12-04-vps

Clustering requires config, router, and shard servers. In production, these servers would each be hosted on separate machines. However, they are capable of running on the same one using different ports. The config router handles the metadata storing how data is distributed between shards. Query routers are what are accessed by the app and other users, and the shards store the data itself.

A config server may be run with the command  
`mongod --configsvr --dbpath [metadata directory] --port [port]`

A query router may be launched with
`mongos --configdb [config server url]:[config server port] --port [port]`
Note that each config server must be listed here and the list of config servers must be identical for each query router.

To launch a shard, first the command 
`mongod` must be run to launch the server.
Then connect to a query server with the mongo shell and add the shard server.
`mongo --host [query server url] --port [query server port]`
`sh.addShard( [shard server url] : [shard server port])`

At least two shard servers should be launched.

The database itself must then be configured to use sharding.  
While still connected to the query server in the mongo shell, run    
`sh.enableSharding([database])`

The collections used by this app should then be set for sharding using the following commands
`use [database]`  
`db.users.ensureIndex({_id : "hashed"})`  
`db.posts.ensureIndex({author_id: "hashed"})`  
`sh.shardCollection("[database].users", {"_id": "hashed"})`  
`sh.shardCollection("[database].posts", {"author_id, "hashed"})`  
These collections are sharded such that users should be split evenly between shards, while posts by the same user should all be stored on the same shard, but posts by different users will be split evenly between shards. This model is chosen because posts are often queried by author_id.

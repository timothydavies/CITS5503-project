# CITS5503-project

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
`mongodbURL` The mongodb url.
`serverPort` The port the app runs on.

## Running the server

Run mongodb using the command
`sudo mongodb`
Run the server using the command
`node app.js`

## Sharding



Using Mongodb and Neo4j to store and analyse a simple social network

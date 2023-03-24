Instructions:

Make sure you don't have an MySql service.
It may interfere with the ports of the docker MySql. 

Install Docker on the machine
Run docker compose up
This will create the db and expose the MySql ports

Move to the omniverse-server folder
Run npm run start:dev
Move to the omniverse-client folder
Run npm run start

Then you can go to localhost:3000 for the ui
and localhost:8000/api for the swagger
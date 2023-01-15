## How to set up:

### Requirements:
- Latest LTS version of [Node](https://nodejs.org) and NPM (comes bundled with Node)
- Some knowledge of programming and Discord

### Preparation:
- Clone the repo
- Open a terminal and `cd` to the cloned folder
- Run these commands in this order: `npm i`, `npm run build`
- Create a `.env` file alongside `package.json`
- Copy and paste this inside the `.env` file you created:
```
TOKEN=
CLIENT_ID=
GUILD_ID=
```
- Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create an application
- In the application page, go to the "Bot" tab on the left side and click on the "Add Bot" button
- Copy and paste the token in the `.env` file next to `TOKEN=`
- Go back to the "General Information" tab on the left side and copy paste the client id in the `.env` file next to `CLIENT_ID`
- Go to your discord server and right click your server's icon, then copy paste the id in the `.env` file next to `GUILD_ID`
- Now use this link to invite your bot to your server
```
https://discord.com/api/oauth2/authorize?client_id=PUT_YOUR_CLIENT_ID_HERE&permissions=281600&scope=bot%20applications.commands
```
Make sure to replace `PUT_YOUR_CLIENT_ID_HERE` with your actual client id.

Note: 
Make sure there are no spaces between the `=` and the text you pasted in, as well as after the text you pasted in!

### Running:
If you did everything above right, you should be able to run `npm start` in the terminal and the bot should start.

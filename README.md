## Disclaimer

This bot was created for the [Valorant Romania](https://discord.gg/valorantromania) Discord server and as such it is configured and tailored for this server only. It is however pretty easy to edit and configure for your own needs/Discord server if you have TypeScript and NodeJS knowledge.

_Also I know I don't follow most code conventions or whatever, but I made this in 2 days so cut me some slack, ok? XD_

## How to set up:

### Requirements:

- Latest LTS version of [NodeJS](https://nodejs.org) and NPM (comes bundled with Node)
- Some knowledge of programming/Sys Admin (Terminal usage) and Discord (TypeScript/JavaScript too if you want to edit the code)

### Preparation:

_Since I am lazy, I will just explain what needs to be done, if you get stuck on a step you can easily google and figure it out, or even reach out to me on Discord, my tag is `Sans#0001`_

- Clone the repo
- Open a terminal and `cd` to the cloned folder
- Run these commands in order: 
  - `npm i`
  - `npm run build`
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
- Scroll down a bit and toggle on the `Message Content Intent`
- Go back to the "General Information" tab on the left side and copy paste the client id in the `.env` file next to `CLIENT_ID=`
- Go to your discord server and right click your server's icon, then copy paste the id in the `.env` file next to `GUILD_ID=`

Make sure there are no spaces between the `=` and the text you pasted in, as well as after the text you pasted in.

- Now use this link to invite your bot to your server

```
https://discord.com/api/oauth2/authorize?client_id=PUT_YOUR_CLIENT_ID_HERE&permissions=281600&scope=bot%20applications.commands
```

Make sure to replace `PUT_YOUR_CLIENT_ID_HERE` with your actual client id.

### Running:

If you did everything above right, you should be able to run `npm start` in the terminal and the bot should start.

## Issues/FAQ

- Weird output instead of ranks and around the voice channel? Go into the `config` folder and change the emotes in the `config.json5`
- The `Message Content Intent` is optionial only if you decide to remove the `tickets` command by deleting `src/commands/tickets.ts` and running the build script again.
- Feel free create an issue [here](https://github.com/Sans3108/valro-lfg/issues) or contact me on discord @ Sans#0001 if you have problems, concerns or questions.

## Screenshots

![](https://media.discordapp.net/attachments/1062400951622828145/1064237481337290952/image.png)
![](https://media.discordapp.net/attachments/1062400951622828145/1064237467915526144/image.png)
![](https://media.discordapp.net/attachments/1062400951622828145/1064237821784768592/image.png)

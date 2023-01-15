//#region Startup
console.log('Starting...');

console.log('Configuring ENV vars...');
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

if (!process.env.TOKEN || !process.env.CLIENT_ID) {
  throw new Error('Invalid ENV vars!');
}

console.log('Registering commands...');
import { REST, Routes, SlashCommandBuilder, RESTPostAPIChatInputApplicationCommandsJSONBody as CommandData } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));

const commandFiles = readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

export interface command {
  data: SlashCommandBuilder;
  config: {
    group: string;
    cooldown: number;
  };
  execute(...args: any): Promise<any>;
}

const commandsData: CommandData[] = [];

for (const file of commandFiles) {
  const command: command = (await import(`./commands/${file}`)).default;
  commandsData.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

let commandIDs: { name: string; id: string }[] = [];

await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string), { body: commandsData }).then((res: any) => {
  commandIDs = res.filter((c: any) => c.type == 1).map((c: any) => ({ name: c.name, id: c.id }));
});

console.log('Importing packages...');
import { Client, Collection, GatewayIntentBits as Intents } from 'discord.js';
import { readFileSync } from 'fs';
import j5 from 'json5';

export interface CustomClient extends Client {
  config: {
    embedColor: number;
  };
  commands: Collection<string, commandWithId>;
  cooldowns: Collection<string, Collection<string, number>>;
}

console.log('Setting up client...');
const client = new Client({
  intents: [Intents.DirectMessages, Intents.Guilds, Intents.GuildMessages]
}) as CustomClient;

client.config = j5.parse(readFileSync(path.join(__dirname, '../config', 'config.json5'), 'utf8'));
client.commands = new Collection();
client.cooldowns = new Collection();

console.log('Loading events...');

export interface event {
  type: string;
  execute(...args: any): Promise<any>;
}

const eventFiles = readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event: event = (await import(`./events/${file}`)).default;
  console.log(`Loaded event: ${event.type}`);

  client.on(event.type, (...args) => event.execute(...args).catch(console.error));
}

console.log('Loading commands...');

interface commandWithId extends command {
  id: string;
}

for (const file of commandFiles) {
  const command: commandWithId = (await import(`./commands/${file}`)).default;

  command.id = commandIDs.find(c => c.name === command.data.name)!.id;
  client.commands.set(command.data.name, command);

  console.log(`Loaded command: ${command.data.name}`);
}

console.log('Logging in...');
client.login(process.env.TOKEN);

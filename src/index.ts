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
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const rate = await import('./commands/rate.js').catch(e => console.log(e));

console.log(rate);

for (const file of commandFiles) {
  
  console.log(file);
  const c = await import(`./commands/${file}`);

  //console.log(c);
  console.log(c.default.data.name);

  const command: command = c.default;

  commandsData.push(command.data.toJSON());
}

console.log('doesnt reach this');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

let commandIDs: { name: string; id: string }[] = [];

await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string), { body: commandsData }).then((res: any) => {
  commandIDs = res.filter((c: any) => c.type == 1).map((c: any) => ({ name: c.name, id: c.id }));
});

console.log('Importing packages...');
import { Client, Collection, GatewayIntentBits as Intents } from 'discord.js';
import { readFileSync } from 'fs';
import j5 from 'json5';
import { QuickDB } from 'quick.db';

export interface ClientConfig {
  embedColor: number;
  ranks: {
    unranked: string;
    iron: string;
    bronze: string;
    silver: string;
    gold: string;
    platinum: string;
    diamond: string;
    ascendant: string;
    immortal: string;
    radiant: string;
  };
  arrows: {
    left: string;
    right: string;
  };
  stars: {
    empty: string;
    full: string;
  };
  badWords: string[];
  staffRoles: string[];
}

export interface CustomClient extends Client {
  config: ClientConfig;
  commands: Collection<string, commandWithId>;
  cooldowns: Collection<string, Collection<string, number>>;
  db: QuickDB;
}

console.log('Setting up client...');
const client = new Client({
  intents: [Intents.DirectMessages, Intents.Guilds, Intents.GuildMessages, Intents.GuildVoiceStates]
}) as CustomClient;

client.config = j5.parse(readFileSync(path.join(__dirname, '../config', 'config.json5'), 'utf8'));
client.commands = new Collection();
client.cooldowns = new Collection();
client.db = new QuickDB();

console.log('Loading DB...');

export interface DB_User {
  id: string;
  rating: number;
  rates: number;
}

export interface DB_UserTable {
  [key: string]: DB_User | undefined;
}

if (await client.db.get('users')) {
  await client.db.set<DB_User>('users', {});
}

export async function checkUser(id: string) {
  const users = (await client.db.get<DB_UserTable>('users'))!;
  let changes = false;

  if (!users[id]) {
    users[id] = {
      id: id,
      rating: 3,
      rates: 0
    };

    changes = true;
  }

  if (changes) {
    await client.db.set<DB_UserTable>('users', users);
  }

  return;
}

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

  console.log(`Loaded command: ${command.data.name} (ID: ${command.id})`);
}

console.log('Logging in...');
client.login(process.env.TOKEN);

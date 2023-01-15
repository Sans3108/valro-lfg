import { ActivityType as activity, Events } from 'discord.js';
import { CustomClient, event } from '..';

const evt: event = {
  type: Events.ClientReady,
  execute: async (client: CustomClient) => {
    console.log(`${client.user!.username} is online!`);

    const setActivity = () => {
      let text = `Valorant`;
      client.user!.setActivity(text, { type: activity.Playing });
    };

    setActivity();
  }
};

export default evt;

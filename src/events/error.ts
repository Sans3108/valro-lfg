import { Events } from 'discord.js';
import { event } from '..';

const evt: event = {
  type: Events.Error,
  execute: async (error: unknown) => {
    console.error(error);
  }
};

export default evt;

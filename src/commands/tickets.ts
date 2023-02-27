// count by claimant, otherwise closer

import { SlashCommandBuilder, EmbedBuilder as Embed, ChatInputCommandInteraction } from 'discord.js';
import { command, CustomClient } from '..';

const cmd: command = {
  data: new SlashCommandBuilder()
    .setName('tickets')
    .setDescription('Ticket activity for staff members')
    .addUserOption(option => {
      option.setName('user').setDescription('The staff member you want to check ticket activity for.').setRequired(true);
      return option;
    })
    .setDMPermission(false),
  config: {
    group: 'other',
    cooldown: 60
  },
  async execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
    const message = await interaction.deferReply({ fetchReply: true });

    // uptime
    let totalSeconds = (client.uptime ?? 0) / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    const emb = new Embed()
      .setColor(0xdc3d4b)
      .setTitle(`${client.user?.username} - Stats`)
      .setDescription(
        `WebSocket Ping: **${Math.round(client.ws.ping)}ms**\nResponse Time: **${
          message.createdTimestamp - interaction.createdTimestamp
        }ms**\nUptime: **${days}d** / **${hours}h** / **${minutes}m** / **${seconds}s**`
      )
      .setThumbnail(client.user?.avatarURL() ?? null);

    await interaction.editReply({ embeds: [emb] });
  }
};

export default cmd;

import { SlashCommandBuilder, EmbedBuilder as Embed, ChatInputCommandInteraction } from 'discord.js';
import { command, CustomClient } from '..';

const cmd: command = {
  data: new SlashCommandBuilder().setName('help').setDescription('Help with commands.').setDMPermission(true),
  config: {
    group: 'info',
    cooldown: 3
  },
  async execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
    const { commands } = client;

    const helpEmbed = new Embed()
      .setTitle(`${client.user!.username} - Help`)
      .setThumbnail(client.user!.avatarURL())
      .setColor(client.config.embedColor)
      .setDescription(`**${client.user!.username}** - A simple bot used to send lfg messages for Valorant. \n\nMade by \`Sans#0001\` <@366536353418182657>.\n\u200b`);

    const groups = ['info', 'action', 'other'];
    groups.forEach(item => {
      let group = commands
        .filter(c => c.config.group === item)
        .map(command => `</${command.data.name}:${command.id}> - ${command.data.description}`)
        .join('\n');

      if (group) {
        helpEmbed.addFields({ name: `**${item.charAt(0).toUpperCase() + item.slice(1)} commands:**`, value: group });
      }
    });

    return interaction.reply({ embeds: [helpEmbed] });
  }
};

export default cmd;

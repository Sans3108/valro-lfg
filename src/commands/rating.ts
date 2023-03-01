import { SlashCommandBuilder, EmbedBuilder as Embed, ChatInputCommandInteraction } from 'discord.js';
import { command, CustomClient } from '../index.js';
import { checkUser, DB_UserTable } from '../utils.js';
import { getStringRating, integerRating, stringRating } from './rate.js';

const cmd: command = {
  data: new SlashCommandBuilder()
    .setName('rating')
    .setDescription(`Check your rating or someone else's!`)
    .addUserOption(option => {
      option.setName('user').setDescription('The member you want to check the rating of.').setRequired(false);
      return option;
    })
    .setDMPermission(false),
  config: {
    group: 'other',
    cooldown: 60
  },
  async execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
    const user = interaction.options.getUser('user') || interaction.user;

    const userIcon = user.avatarURL({ forceStatic: false }) || user.defaultAvatarURL;
    const guildIcon = interaction.guild?.iconURL({ forceStatic: false }) || userIcon;

    if (user.bot) {
      const botUserEmb = new Embed()
        .setTitle(`Invalid User`)
        .setDescription(`Bot users don't have a rating!`)
        .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: userIcon })
        .setColor(client.config.embedColor)
        .setThumbnail(guildIcon)
        .setFooter({ text: 'Valorant Romania' });

      return await interaction.reply({ embeds: [botUserEmb], ephemeral: true });
    }

    await checkUser(client.db, user.id);

    const dbUser = (await client.db.get<DB_UserTable>('users'))![user.id];
    const rounded: integerRating = Math.round(dbUser!.rating);
    const stringRating: stringRating = getStringRating(rounded);
    const starRating = `${client.config.stars.full.repeat(rounded)}${client.config.stars.empty.repeat(5 - rounded)}`;

    const ratingEmb = new Embed()
      .setColor(client.config.embedColor)
      .setAuthor({ name: `${user.username}#${user.discriminator}`, iconURL: userIcon })
      .setTitle(`${stringRating} - ${starRating}`)
      .setDescription(`${user} has a rating of **${rounded} / 5** (${dbUser!.rating}) with **${dbUser!.rates}** votes!`)
      .setThumbnail(guildIcon)
      .setFooter({ text: 'Valorant Romania' })
      .setTimestamp();

    return await interaction.reply({ embeds: [ratingEmb] });
  }
};

export default cmd;

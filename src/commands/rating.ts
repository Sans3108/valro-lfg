import { SlashCommandBuilder, EmbedBuilder as Embed, ChatInputCommandInteraction } from 'discord.js';
import { checkUser, command, CustomClient, DB_UserTable } from '../index.js';
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

    await checkUser(user.id);

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
  }
};

export default cmd;

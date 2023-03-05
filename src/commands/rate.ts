import { SlashCommandBuilder, EmbedBuilder as Embed, ChatInputCommandInteraction, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ModalSubmitInteraction } from 'discord.js';
import { ClientConfig, command, CustomClient } from '../index.js';

import { randomBytes } from 'crypto';
import j5 from 'json5';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateRating, checkUser, DB_User } from '../utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: ClientConfig = j5.parse(readFileSync(path.join(__dirname, '../../config', 'config.json5'), 'utf8'));
const badWords: string[] = j5.parse(readFileSync(path.join(__dirname, '../../config', 'badWords.json5'), 'utf8'));

function nonce() {
  return randomBytes(4).toString('hex');
}

function hasBadWords(input: string): boolean {
  return badWords.some(word => input.includes(word));
}

export enum integerRating {
  terrible = 1,
  bad = 2,
  average = 3,
  good = 4,
  excellent = 5
}

export enum stringRating {
  terrible = 'terrible',
  bad = 'bad',
  average = 'average',
  good = 'good',
  excellent = 'excellent'
}

const [s, e] = [config.rating.full, config.rating.empty];

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function getStringRating(rating: integerRating): stringRating {
  const lookupTable = {
    [integerRating.terrible]: stringRating.terrible,
    [integerRating.bad]: stringRating.bad,
    [integerRating.average]: stringRating.average,
    [integerRating.good]: stringRating.good,
    [integerRating.excellent]: stringRating.excellent
  };

  return lookupTable[rating];
}

const cmd: command = {
  data: new SlashCommandBuilder()
    .setName('rate')
    .setDescription('Rate other players.')
    .addUserOption(option => {
      option.setName('user').setDescription('The user you want to write about.').setRequired(true);

      return option;
    })
    .addIntegerOption(option => {
      option
        .setName('rating')
        .setDescription('How would you rate this user?')
        .setChoices(
          { name: `${capitalize(stringRating.terrible)} - ${s.repeat(1)}${e.repeat(4)}`, value: integerRating.terrible },
          { name: `${capitalize(stringRating.bad)} - ${s.repeat(2)}${e.repeat(3)}`, value: integerRating.bad },
          { name: `${capitalize(stringRating.average)} - ${s.repeat(3)}${e.repeat(2)}`, value: integerRating.average },
          { name: `${capitalize(stringRating.good)} - ${s.repeat(4)}${e.repeat(1)}`, value: integerRating.good },
          { name: `${capitalize(stringRating.excellent)} - ${s.repeat(5)}${e.repeat(0)}`, value: integerRating.excellent }
        )
        .setRequired(true);

      return option;
    })
    .setDMPermission(false),
  config: {
    group: 'action',
    cooldown: {
      staff: 2 * 60,
      normal: 2 * 60
    }
  },
  async execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
    const user = interaction.options.getUser('user', true);
    const rating: integerRating = interaction.options.getInteger('rating', true);
    const stringRating = getStringRating(rating);
    const starRating = `${s.repeat(rating)}${e.repeat(5 - rating)}`;

    const userIcon = interaction.user.avatarURL({ forceStatic: false }) || interaction.user.defaultAvatarURL;
    const ratedUserIcon = user.avatarURL({ forceStatic: false }) || user.defaultAvatarURL;
    const guildIcon = interaction.guild?.iconURL({ forceStatic: false }) || userIcon;

    if (user.bot) {
      const botUserEmb = new Embed()
        .setTitle(`Invalid User`)
        .setDescription('You cannot rate bot users!')
        .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: userIcon })
        .setColor(client.config.embedColor)
        .setThumbnail(guildIcon)
        .setFooter({ text: client.config.footer });

      return await interaction.reply({ embeds: [botUserEmb], ephemeral: true });
    }

    if (user.id === interaction.user.id) {
      const botUserEmb = new Embed()
        .setTitle(`Invalid User`)
        .setDescription('You cannot rate yourself!')
        .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: userIcon })
        .setColor(client.config.embedColor)
        .setThumbnail(guildIcon)
        .setFooter({ text: client.config.footer });

      return await interaction.reply({ embeds: [botUserEmb], ephemeral: true });
    }

    const n = nonce();

    const prompt = new ModalBuilder().setTitle(`${capitalize(stringRating)} - ${starRating}`).setCustomId(`${n}-opinion`);

    const opinionInput = new TextInputBuilder()
      .setCustomId(`${n}-opinionInput`)
      .setLabel(`Tell us more about ${user.username}`)
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(500)
      .setPlaceholder(`I think that ${user.username} is...`)
      .setRequired(true);

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(opinionInput);
    prompt.addComponents(row);

    await interaction.showModal(prompt);

    const filter = (i: ModalSubmitInteraction) => {
      return i.customId === `${n}-opinion`;
    };

    interaction
      .awaitModalSubmit({ time: 2 * 60 * 1000, filter })
      .then(async modalInteraction => {
        const userInput = modalInteraction.fields.getTextInputValue(`${n}-opinionInput`);

        if (hasBadWords(userInput)) {
          const badWordsEmb = new Embed()
            .setTitle(`Inappropriate Language`)
            .setDescription('Your message contains inappropriate language. Please refrain from using bad words.')
            .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: userIcon })
            .setColor(client.config.embedColor)
            .setThumbnail(guildIcon)
            .setFooter({ text: client.config.footer });

          return await modalInteraction.reply({ embeds: [badWordsEmb], ephemeral: true });
        }

        await checkUser(client.db, user.id);

        const users = client.db.table('users');

        const userData = (await users.get<DB_User>(user.id))!;

        let newRating = true;

        if (userData.ratings.some(r => r.id === interaction.user.id)) {
          const index = userData.ratings.findIndex(rating => rating.id === interaction.user.id);

          userData.ratings[index].rating = rating;
          userData.ratings[index].message = userInput;

          newRating = false;
        } else {
          userData.ratings.push({
            id: interaction.user.id,
            rating: rating,
            message: userInput
          });
        }

        userData.rating = calculateRating(userData);

        await users.set<DB_User>(user.id, userData);

        const opinionEmb = new Embed()
          .setAuthor({ name: `${user.username}#${user.discriminator}`, iconURL: ratedUserIcon })
          .setTitle(`${starRating}`)
          .setDescription(`<@${interaction.user.id}>${newRating ? `'s` : ` updated their`} rating for <@${user.id}>: **${capitalize(stringRating)}**`)
          .addFields({ name: 'Opinion:', value: userInput })
          .setColor(client.config.embedColor)
          .setThumbnail(guildIcon)
          .setFooter({ text: client.config.footer })
          .setTimestamp();

        await modalInteraction.reply({ embeds: [opinionEmb] });

        return;
      })
      .catch(console.error);

    return;
  }
};

export default cmd;

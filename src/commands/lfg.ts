import { SlashCommandBuilder, EmbedBuilder as Embed, ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, StringSelectMenuInteraction } from 'discord.js';
import { command, CustomClient } from '..';

enum Gamemode {
  unrated = 'unrated',
  ranked = 'ranked',
  other = 'other'
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const cmd: command = {
  data: new SlashCommandBuilder()
    .setName('lfg')
    .setDescription('Look for players.')
    .addStringOption(option => {
      option
        .setName('gamemode')
        .setDescription('The gamemode you wish to play.')
        .setRequired(true)
        .addChoices({ name: 'Unrated', value: Gamemode.unrated }, { name: 'Ranked', value: Gamemode.ranked }, { name: 'Other', value: Gamemode.other });

      return option;
    })
    .addIntegerOption(option => {
      option.setName('count').setDescription('How many players are you looking for.').setMinValue(1).setMaxValue(10).setRequired(true);

      return option;
    })
    .addStringOption(option => {
      option.setName('info').setDescription(`You can optionally provide some info. Don't specify the ranks here, you will be prompted for that.`).setMinLength(2).setMaxLength(100).setRequired(false);

      return option;
    })
    .setDMPermission(false),
  config: {
    group: 'search',
    cooldown: 5 * 60
  },
  async execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
    await interaction.deferReply({ ephemeral: true });
    const noVc = new Embed().setColor(client.config.embedColor).setDescription(`You must be in a Voice Channel to use this command!`);

    interaction.member = await interaction.guild!.members.fetch({ user: interaction.user.id, force: true });

    if (!interaction.member.voice.channelId) {
      return interaction.editReply({ embeds: [noVc] });
    }

    const gamemode: keyof typeof Gamemode = interaction.options.getString('gamemode', true) as Gamemode;
    const count: number = interaction.options.getInteger('count', true);
    const vc = `<#${interaction.member.voice.channelId}>`;
    const info = interaction.options.getString('info');

    const Rank = client.config.ranks;
    const arrow = client.config.arrows;

    const menu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ranks-menu')
        .setPlaceholder('No ranks selected...')
        .addOptions(
          {
            label: 'Unranked',
            value: Rank.unranked,
            emoji: Rank.unranked
          },
          {
            label: 'Iron',
            value: Rank.iron,
            emoji: Rank.iron
          },
          {
            label: 'Bronze',
            value: Rank.bronze,
            emoji: Rank.bronze
          },
          {
            label: 'Silver',
            value: Rank.silver,
            emoji: Rank.silver
          },
          {
            label: 'Gold',
            value: Rank.gold,
            emoji: Rank.gold
          },
          {
            label: 'Platinum',
            value: Rank.platinum,
            emoji: Rank.platinum
          },
          {
            label: 'Diamond',
            value: Rank.diamond,
            emoji: Rank.diamond
          },
          {
            label: 'Ascendant',
            value: Rank.ascendant,
            emoji: Rank.ascendant
          },
          {
            label: 'Immortal',
            value: Rank.immortal,
            emoji: Rank.immortal
          },
          {
            label: 'Radiant',
            value: Rank.radiant,
            emoji: Rank.radiant
          }
        )
        .setMinValues(1)
        .setMaxValues(3)
    );

    const userIcon = interaction.user.avatarURL({ forceStatic: false }) || interaction.user.defaultAvatarURL;
    const guildIcon = interaction.guild?.iconURL({ forceStatic: false }) || userIcon;

    const chooseRanks = new Embed()
      .setTitle(`Rank Selection`)
      .setDescription(`**Choose what ranks you are looking for!**\n\u200b`)
      .setColor(client.config.embedColor)
      .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: userIcon })
      .setThumbnail(guildIcon)
      .setFooter({ text: 'Valorant Romania' })
      .setTimestamp();

    const message = await interaction.editReply({ embeds: [chooseRanks], components: [menu] });

    const filter = (i: StringSelectMenuInteraction) => {
      return i.user.id === interaction.user.id;
    };

    message
      .awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 1 * 60 * 1000 }) // 1 minute
      .then(i => {
        const lfg = new Embed()
          .setTitle(`Looking for ${count > 1 ? count : 'a'} player${count > 1 ? 's' : ''}!`)
          .addFields(
            {
              name: `_Rank${i.values.length > 1 ? 's' : ''}_`,
              value: i.values.join('')
            },
            {
              name: '_Gamemode_',
              value: `\`${capitalize(gamemode)}\``
            },
            {
              name: '_Channel_',
              value: `${arrow.right} ${vc} ${arrow.left}`
            }
          )
          .setColor(client.config.embedColor)
          .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: userIcon })
          .setThumbnail(guildIcon)
          .setFooter({ text: 'Valorant Romania' })
          .setTimestamp();

        if (info) {
          lfg.addFields({
            name: '_Additional Info_',
            value: info
          });
        }

        interaction.channel?.send({ embeds: [lfg] });
        interaction.deleteReply();
      })
      .catch(e => {
        console.log(e);
        interaction.deleteReply();
      });

    return;
  }
};

export default cmd;

// const ranks = {
//   iron: '#292323',
//   bronze: '#795106',
//   silver: '#faf5f5',
//   gold: '#ecda75',
//   platinum: '#2f9485',
//   diamond: '#ab89c7',
//   ascendant: '#2ba55b',
//   immortal: '#f8342f',
//   radiant: '#ebb435'
// };

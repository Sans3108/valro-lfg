import {
  SlashCommandBuilder,
  EmbedBuilder as Embed,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  StringSelectMenuInteraction,
  GuildMember
} from 'discord.js';
import { command, CustomClient } from '..';

enum Gamemode {
  unrated = 'unrated',
  ranked = 'ranked',
  other = 'other'
}

enum Rank {
  iron = '<:iron:1064032537648840835>',
  bronze = '<:bronze:1064032528110993509>',
  silver = '<:silver:1064032543751540766>',
  gold = '<:gold:1064032532561133639>',
  platinum = '<:platinum:1064032539464966246>',
  diamond = '<:diamond:1064032530136834059>',
  ascendant = '<:ascendant:1064032525149810698>',
  immortal = '<:immortal:1064032534469550211>',
  radiant = '<:radiant:1064032542052859955>',
  unranked = '<:unranked:1064032993586450576>'
}

enum arrow {
  left = '<a:left_arrow:1063957940010221680>',
  right = '<a:right_arrow:1064041762865295370>'
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
    cooldown: 3
  },
  async execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
    const noVc = new Embed().setColor(client.config.embedColor).setDescription(`You must be in a Voice Channel to use this command!`);

    if (!(interaction.member as GuildMember).voice.channel) {
      return interaction.reply({ embeds: [noVc], ephemeral: true });
    }

    const gamemode: keyof typeof Gamemode = interaction.options.getString('gamemode') as Gamemode;
    const count: number = interaction.options.getInteger('count') as number;
    const vc = (interaction.member as GuildMember).voice.channel!;
    const info = interaction.options.getString('info');

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

    const message = await interaction.reply({ embeds: [chooseRanks], components: [menu], ephemeral: true });

    const filter = (i: StringSelectMenuInteraction) => {
      return i.user.id === interaction.user.id;
    };

    message
      .awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 1 * 60 * 1000 })
      .then(i => {
        interaction.deleteReply();

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

        message.interaction.channel?.send({ embeds: [lfg] });
      })
      .catch(e => interaction.deleteReply());

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
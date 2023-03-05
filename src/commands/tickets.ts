// count by claimant, otherwise closer

import { SlashCommandBuilder, EmbedBuilder as Embed, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { command, CustomClient } from '..';

const formatMonth = (month: number): string => {
  return month < 10 ? `0${month}` : month.toString();
};

export const DISCORD_EPOCH = 1420070400000;

export function snowflakeToDate(snowflake: string, epoch = DISCORD_EPOCH): Date {
  const milliseconds = BigInt(snowflake) >> 22n;
  return new Date(Number(milliseconds) + epoch);
}

export function dateToSnowflake(date: Date, epoch = DISCORD_EPOCH): string {
  const timestamp = date.getTime() - epoch;
  const snowflake = (BigInt(timestamp) << 22n).toString();
  return snowflake;
}

const cmd: command = {
  data: new SlashCommandBuilder()
    .setName('tickets')
    .setDescription('View ticket activity for the selected period.')
    .addIntegerOption(option => {
      option.setName('month').setDescription('What month? Defaults to last month.').setMinValue(1).setMaxValue(12).setRequired(false);
      return option;
    })
    .addIntegerOption(option => {
      option.setName('year').setDescription('What year? Defaults to current year.').setMinValue(2022).setMaxValue(2069).setRequired(false);
      return option;
    })
    .setDMPermission(false),
  config: {
    group: 'other',
    cooldown: {
      staff: 30 * 60,
      normal: 30 * 60
    }
  },
  async execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
    await interaction.deferReply();

    const logsChannel = await interaction.guild!.channels.fetch('856881888072957962'); // 856881888072957962

    const userIcon = interaction.user.avatarURL({ forceStatic: false }) || interaction.user.defaultAvatarURL;
    const guildIcon = interaction.guild?.iconURL({ forceStatic: false }) || userIcon;

    const noChannel = new Embed()
      .setTitle(`Invalid Channel`)
      .setDescription('Could not fetch the channel!')
      .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: userIcon })
      .setColor(client.config.embedColor)
      .setThumbnail(guildIcon)
      .setFooter({ text: client.config.footer });

    if (!logsChannel || !logsChannel.isTextBased() || logsChannel.isThread()) return interaction.editReply({ embeds: [noChannel] });

    const monthOption = interaction.options.getInteger('month'); // 1 based
    const yearOption = interaction.options.getInteger('year');

    const currentYear = new Date().getFullYear();
    const lastMonth = new Date().getMonth() === 0 ? 12 : new Date().getMonth(); // 1 based

    const month = (monthOption || lastMonth) - 1; // 0 based
    const strMonth = formatMonth(month + 1);

    const year = yearOption || currentYear;

    const noMessages = new Embed()
      .setTitle(`No Messages`)
      .setDescription('Could not find any messages!')
      .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: userIcon })
      .setColor(client.config.embedColor)
      .setThumbnail(guildIcon)
      .setFooter({ text: client.config.footer });

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const startString = `${year}-${strMonth}-01T00:00:00+00:00`;
    const startDate = new Date(startString);
    const startSnowflake = dateToSnowflake(startDate);

    const endString = `${year}-${strMonth}-${new Date(year, month + 1, 0).getDate()}T23:59:59+00:00`;
    const endDate = new Date(endString);
    const endSnowflake = dateToSnowflake(endDate);

    let messages = (
      await logsChannel.messages.fetch({
        before: endSnowflake,
        after: startSnowflake,
        limit: 100
      })
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (messages.size === 0) return interaction.editReply({ embeds: [noMessages] });

    if (messages.size > 99) {
      while (true) {
        const fetched = (
          await logsChannel.messages.fetch({
            before: dateToSnowflake(messages.first()!.createdAt),
            after: startSnowflake,
            limit: 100
          })
        ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        if (fetched.size === 0) break;
        if (fetched.first()!.createdAt < startDate) break;

        messages = messages.concat(fetched).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }
    }

    messages = messages
      .filter(msg => {
        const s = startDate;
        const e = endDate;
        const c = msg.createdAt;

        const inRange = c >= s && c <= e;
        const fromTarget = msg.author.id === '508391840525975553'; // 508391840525975553
        const hasEmbeds = msg.embeds.length > 0;

        return inRange && fromTarget && hasEmbeds;
      })
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const messageList = Array.from(new Set(Array.from(messages.values()))); // Remove any dupes if any (kinda useless tho)

    if (messageList.length === 0) return interaction.editReply({ embeds: [noMessages] });

    const _data: {
      responsible: {
        id: string;
        name?: string;
      };
      ticket: {
        caseId: number;
        messageURL: string;
      };
    }[] = messageList.map(m => {
      const fields = m.embeds[0].fields;

      const claimedField = fields.find(f => f.name.toLowerCase().includes('claimed by'))!;
      const closedField = fields.find(f => f.name.toLowerCase().includes('closed by'))!;

      const caseId = fields.find(f => f.name.toLowerCase().includes('ticket id'))!.value;

      const responsible = claimedField.value.toLowerCase().includes('not claimed') ? closedField.value : claimedField.value;

      const resId = responsible.slice(2, -1);

      return {
        responsible: {
          id: resId
        },
        ticket: {
          caseId: parseInt(caseId),
          messageURL: m.url
        }
      };
    });

    const responsibleIds = Array.from(new Set(_data.map(t => t.responsible.id))).map(id => client.users.fetch(id));

    const users = (await Promise.all(responsibleIds)).map(u => {
      return {
        id: u.id,
        name: `${u.username}#${u.discriminator}`
      };
    });

    const data = _data.map(t => {
      t.responsible.name = users.find(u => u.id === t.responsible.id)!.name;

      return t;
    });

    const dataStr =
      `Ticket Stats for ${monthNames[month]} ${year}\n\n` +
      users
        .map(u => {
          const tickets = data.filter(t => t.responsible.id === u.id);

          return `${u.name} - ${u.id}\n${tickets.length} Tickets Solved:\n${tickets.map(t => `#${t.ticket.caseId} ${t.ticket.messageURL}`).join('\n')}`;
        })
        .join('\n\n');

    const textBuffer = Buffer.from(dataStr, 'utf-8');

    const dataFile = new AttachmentBuilder(textBuffer, {
      name: `Ticket_Stats_${monthNames[month]}_${year}.txt`
    });

    return interaction.editReply({ content: 'This command is expensive to use and could cause errors. Please do not use recklessly.', files: [dataFile] });
  }
};

export default cmd;

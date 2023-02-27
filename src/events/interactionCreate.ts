import { Collection, CommandInteraction, EmbedBuilder as Embed, Events } from 'discord.js';
import { CustomClient, event } from '..';

const Permissions = {
  // General Permissions
  Administrator: 8n,
  ViewAuditLog: 128n,
  ManageServer: 32n,
  ManageRoles: 268435456n,
  ManageChannels: 16n,
  KickMembers: 2n,
  BanMembers: 4n,
  CreateInstantInvite: 1n,
  ChangeNickname: 67108864n,
  ManageNicknames: 134217728n,
  ManageEmojisAndStickers: 1073741824n,
  ManageWebhooks: 536870912n,
  ViewChannels: 1024n,
  ManageEvents: 8589934592n,
  ModerateMembers: 1099511627776n,
  ViewServerInsights: 524288n,
  ViewCreatorMonetizationInsights: 2199023255552n,

  // Text Permissions
  SendMessages: 2048n,
  CreatePublicThreads: 34359738368n,
  CreatePrivateThreads: 68719476736n,
  SendMessagesInThreads: 274877906944n,
  SendTTSMessages: 4096n,
  ManageMessages: 8192n,
  ManageThreads: 17179869184n,
  EmbedLinks: 16384n,
  AttachFiles: 32768n,
  ReadMessageHistory: 65536n,
  MentionEveryone: 131072n,
  UseExternalEmojis: 262144n,
  UseExternalStickers: 137438953472n,
  AddReactions: 64n,
  UseSlashCommands: 2147483648n,

  // Voice Permissions
  Connect: 1048576n,
  Speak: 2097152n,
  Video: 512n,
  MuteMembers: 4194304n,
  DeafenMembers: 8388608n,
  MoveMembers: 16777216n,
  UseVoiceActivity: 33554432n,
  PrioritySpeaker: 256n,
  RequestToSpeak: 4294967296n,
  UseEmbeddedActivities: 549755813888n
};

function getPermissionNames(bit: bigint): string[] {
  const permissionNames: string[] = [];

  for (const [name, value] of Object.entries(Permissions)) {
    if ((bit & value) === value) {
      permissionNames.push(name);
    }
  }

  return permissionNames;
}

const evt: event = {
  type: Events.InteractionCreate,
  execute: async (interaction: CommandInteraction) => {
    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as CustomClient;

    const permBit = 347136n;

    if (interaction.inGuild() && !interaction.guild?.members.me?.permissions.has(permBit))
      return await interaction.reply({
        embeds: [
          new Embed()
            .setTitle(`I'm missing permissions!`)
            .setDescription(
              `Make sure I have these permissions:\n${getPermissionNames(permBit)
                .map(s => `\`${s}\``)
                .join(', ')}`
            )
            .setColor(client.config.embedColor)
        ],
        ephemeral: true
      });

    const command = client.commands.get(interaction.commandName);

    if (!command)
      return await interaction.reply({
        embeds: [
          new Embed().setDescription(`\`${interaction.commandName}\` can't be used as it was deleted.\nThe entry for this command will also be deleted soon.`).setColor(client.config.embedColor)
        ],
        ephemeral: true
      });

    if (!client.cooldowns.has(command.data.name)) {
      client.cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.data.name);
    const cooldownAmount = (command.config.cooldown || 3) * 1000;

    function formatTime(seconds: number): string {
      if (seconds < 1) return 'a moment';

      let timeString = '';
      const hour = Math.floor(seconds / 3600);
      if (hour) timeString += `${hour}h `;
      const minute = Math.floor((seconds % 3600) / 60);
      if (minute) timeString += `${minute}m `;
      const second = Math.floor(seconds % 60);
      if (second) timeString += `${second}s`;

      return timeString.trim();
    }

    if (timestamps!.has(interaction.user.id)) {
      const expirationTime = timestamps!.get(interaction.user.id)! + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;

        return await interaction.reply({
          embeds: [new Embed().setDescription(`Please wait ${formatTime(timeLeft)} before reusing the \`${command.data.name}\` command, ${interaction.user}!`).setColor(client.config.embedColor)],
          ephemeral: true
        });
      }
    }

    timestamps!.set(interaction.user.id, now);
    setTimeout(() => timestamps!.delete(interaction.user.id), cooldownAmount);

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      const reply = { content: 'There was an error while executing this command!', ephemeral: true };
      if (interaction.replied || interaction.deferred) return interaction.editReply(reply).catch(console.error);
      return interaction.reply(reply).catch(console.error);
    }
  }
};

export default evt;

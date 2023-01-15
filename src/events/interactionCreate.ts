import { Collection, CommandInteraction, EmbedBuilder as Embed, Events } from 'discord.js';
import { CustomClient, event } from '..';

const evt: event = {
  type: Events.InteractionCreate,
  execute: async (interaction: CommandInteraction) => {
    if (!interaction.isCommand()) return;

    const client = interaction.client as CustomClient;

    if (interaction.inGuild() && !interaction.guild?.members.me?.permissions.has(281600n))
      return await interaction.reply({
        embeds: [
          new Embed()
            .setDescription(`I'm missing permissions!\nPermission bit: 281600\n\nDon't know what it is? Check [this](https://discordapi.com/permissions.html#281600)`)
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

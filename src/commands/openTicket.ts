import {
  CommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("openticket")
  .setDescription("Opens a new ticket in a new discord channel.");

export async function execute(interaction: CommandInteraction) {
  const ticketNumber = 0;
  if (interaction.guild) {
    // TODO: Suporter role id vom benutzer setzen lassen
    const suporterRoleId = interaction.guild.roles.cache.find(
      (role) => (role.id = "1286049120813060166")
    )?.id;

    if (suporterRoleId === undefined) {
      return interaction.reply("Suporter role not found.");
    }

    try {
      // Create new channel
      const channel = await interaction.guild.channels.create({
        name: `Ticket #${ticketNumber}`,
        type: 0,
        topic: `Support ticket #${ticketNumber} opened by <@${interaction.user.id}>`,
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: ["ViewChannel"],
          },
          {
            id: suporterRoleId,
            allow: ["ViewChannel"],
          },
        ],
      });

      // Deny @everyone to view channel
      channel.permissionOverwrites.edit(interaction.guild.id, {
        ViewChannel: false,
      });

      const embed = new EmbedBuilder()
        .setTitle(`Support ticket #${ticketNumber} opened`)
        .setDescription(
          `Hey <@${interaction.user.id}>, your support ticket has been opened!`
        )
        .setColor("#0099ff");

      // Send Embed in new suport channel
      await channel.send({ embeds: [embed] });

      // Silently reply to user and give channel link
      await interaction.reply({
        content: `Suport ticket opened: <#${channel.id}>`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error creating private channel:", error);
      interaction.reply("Failed to create the ticket channel.");
    }
  }
}

import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import redisCache from "../redisCache";
import appConfig from "../config";
import api from "../api";

export const data = new SlashCommandBuilder()
  .setName("openticket")
  .setDescription("Opens a new ticket in a private discord channel.");

export async function execute(interaction: CommandInteraction) {
  if (interaction.guild) {
    let ticketNumber;
    try {
      ticketNumber = (await api.getTicketNumber()).data;
    } catch {
      return interaction.reply(appConfig.messages.error500);
    }

    let supporterRoleId;
    try {
      supporterRoleId = (await redisCache.getValue(interaction.guild.id)).value;
    } catch {
      return interaction.reply(
        "This server has no supporter role setup. Please contact an administrator."
      );
    }
    const supporterRole = interaction.guild.roles.cache.find(
      (role) => (role.id = supporterRoleId)
    );
    if (supporterRole === undefined) {
      return interaction.reply(
        "This server has no supporter role setup. Please contact an administrator."
      );
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
            id: supporterRole.id,
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
          `Hey <@${interaction.user.id}>, your support ticket has been opened!\nPlease describe the issue you are facing.`
        )
        .setColor("#0099ff");

      // Send Embed in new suport channel
      await channel.send({ embeds: [embed] });

      // Silently reply to user and give channel link
      await interaction.reply({
        content: `Support ticket opened: <#${channel.id}>`,
        ephemeral: true,
      });

      // TODO: ticket number management completely in backend?
      // meaning no redisCache here just get from api
      // to /ticket-number-increased or smth
      const newTicketNumber = +ticketNumber + 1;
      await redisCache.setValue("ticketNumber", newTicketNumber.toString());

      // TODO: Vermutlich muss hier dann noch mehr rein
      await api.ticketHasBeenCreated(interaction.user.username);
    } catch (error) {
      console.error("Error creating private channel:", error);
      return interaction.reply(
        `Failed to create a new ticket channel. Please reach out to a <@${supporterRoleId}> directly.`
      );
    }
  } else {
    return interaction.reply("This command can only be used in a guild.");
  }
}

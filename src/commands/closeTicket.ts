import {
  CommandInteraction,
  EmbedBuilder,
  GuildChannel,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import redisCache, { RedisCacheItemNotFoundError } from "../redisCache";
import appConfig from "../config";

export const data = new SlashCommandBuilder()
  .setName("closeticket")
  .setDescription("Closes the ticket channel this command is used in.")
  .addStringOption((option) =>
    option
      .setName("reason")
      .setDescription("Give a reason for closing the support ticket.")
  );

export async function execute(interaction: CommandInteraction) {
  // Get the one who opened the issue
  // let customerUserId;
  // try {
  //   customerUserId = (
  //     await redisCache.getValue(`channelId-${interaction.channelId}`)
  //   ).value;
  // } catch (error) {
  //   if (error instanceof RedisCacheItemNotFoundError) {
  //     return interaction.reply({
  //       content: "This channel is not a ticket channel and can't be closed.",
  //       ephemeral: true,
  //     });
  //   }
  //   return interaction.reply({
  //     content: appConfig.messages.error500,
  //     ephemeral: true,
  //   });
  // }
  // TODO: find userId by checking who got viewing permissions
  const customerUserId = "378333347509829633";

  // Get reason for closing the issue
  // TODO: this don't work yet
  const reason = interaction.options.get("reason")?.value;

  // Only run if executed in guild channel
  if (
    interaction.channel !== null &&
    interaction.channel instanceof GuildChannel
  ) {
    // Make channel read-only for customer
    interaction.channel
      .permissionsFor(customerUserId)
      ?.remove(PermissionFlagsBits.SendMessages);

    // Send in channel that ticket is closed
    const ticketClosedEmbed = new EmbedBuilder()
      .setTitle("Ticket closed")
      .setDescription(
        `${
          reason !== undefined
            ? reason
            : "This ticket was closed by a supporter."
        }`
      )
      .setColor("#ff0909");
    interaction.channel.send({ embeds: [ticketClosedEmbed] });

    // Tell customer and supporter that issue was closed
    const customerUser = await interaction.client.users.fetch(customerUserId);
    customerUser.send(
      `The ticket channel <#${interaction.channelId}> was closed${
        reason !== undefined ? ` with reason: ${reason}` : "."
      }`
    );
    interaction.user.send(
      `The ticket channel <#${
        interaction.channelId
      }>, opened by <@${customerUserId}>, was closed${
        reason !== undefined ? ` with reason: ${reason}` : "."
      }`
    );
  }

  return;
}

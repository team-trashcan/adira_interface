import {
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  GuildChannel,
  OverwriteType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import redisCache, { RedisCacheItemNotFoundError } from "../redisCache";
import appConfig from "../config";
import getCategoryElseCreate from "../getCategoryElseCreate";

export const data = new SlashCommandBuilder()
  .setName("closeticket")
  .setDescription("Closes the ticket channel this command is used in.")
  .addStringOption((option) =>
    option
      .setName("reason")
      .setDescription("Give a reason for closing the support ticket.")
  );

export async function execute(interaction: CommandInteraction) {
  // Only run if executed in guild channel
  if (
    interaction.guild !== null &&
    interaction.channel !== null &&
    interaction.channel.type === ChannelType.GuildText
  ) {
    // Get the one who opened the issue
    let customerUserId: string | undefined;
    try {
      for (const overwrite of interaction.channel.permissionOverwrites.cache.values()) {
        if (
          overwrite.type === OverwriteType.Member &&
          overwrite.allow.bitfield === PermissionFlagsBits.ViewChannel
        ) {
          customerUserId = overwrite.id;
          break;
        }
      }

      if (customerUserId === undefined) {
        throw new Error("No user with view permission in channel found");
      }
    } catch (error) {
      console.log("Error deleting ticket: Error finding user:", error);
      return interaction.reply({
        content: appConfig.messages.error500,
        ephemeral: true,
      });
    }

    // Get reason for closing the issue
    const reason = interaction.options.get("reason")?.value;

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

    // Get/Create closed tickets category
    const category = await getCategoryElseCreate(
      interaction.guild.channels,
      appConfig.bot.closedSupportTicketCategory
    );

    // Move channel to closed tickets category
    await interaction.channel.setParent(category.id);

    // Tell customer that issue was closed
    const customerUser = await interaction.client.users.fetch(customerUserId);
    customerUser.send(
      `The support ticket channel <#${interaction.channelId}> was closed${
        reason !== undefined ? ` with reason: ${reason}` : "."
      }`
    );
  }

  return;
}

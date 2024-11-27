import {
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  OverwriteType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import redisCache, { RedisCacheItemNotFoundError } from "../redisCache";
import appConfig from "../config";
import getCategoryElseCreate from "../getCategoryElseCreate";
import api from "../api";

export const data = new SlashCommandBuilder()
  .setName("closeticket")
  .setDescription("Closes the ticket channel this command is used in.")
  .addStringOption((option) =>
    option
      .setName("reason")
      .setDescription("Give a reason for closing the support ticket.")
  )
  .addBooleanOption((option) =>
    option
      .setName("force")
      .setDescription("Force close the ticket, even if there is an error")
  );

export async function execute(interaction: CommandInteraction) {
  // Only run if executed in guild channel
  if (
    interaction.guild !== null &&
    interaction.channel !== null &&
    interaction.channel.type === ChannelType.GuildText
  ) {
    // Get forceClose
    const forceClose = interaction.options.get("force");

    // Get supporterRoleId from cache
    let supporterRoleId: string;
    try {
      supporterRoleId = (
        await redisCache.getValue(`guildId-${interaction.guild.id}`)
      ).value;
    } catch (error) {
      if (error instanceof RedisCacheItemNotFoundError) {
        try {
          supporterRoleId = (await api.getSupporterRole(interaction.guild.id))
            .data.roleId;
          await redisCache.setValue(
            `guildId-${interaction.guildId}`,
            supporterRoleId
          );
        } catch (_) {
          return interaction.reply(appConfig.messages.noSupporterRoleSetup);
        }
      }

      console.error("Error while getting supporter role:", error);
      return interaction.reply(appConfig.messages.error500);
    }

    // Get supporterRole
    if (supporterRoleId !== undefined) {
      const supporterRole = interaction.guild.roles.cache.find(
        (role) => (role.id = supporterRoleId)
      );
      if (supporterRole === undefined && !forceClose) {
        return interaction.reply(appConfig.messages.noSupporterRoleSetup);
      }
    }

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
      if (!forceClose) {
        console.log("Error deleting ticket: Error finding user:", error);
        return interaction.reply({
          content: appConfig.messages.error500,
          ephemeral: true,
        });
      }
    }

    if (customerUserId !== undefined) {
      // Make channel read-only for customer
      interaction.channel
        .permissionsFor(customerUserId)
        ?.remove(PermissionFlagsBits.SendMessages);
    }

    // Get reason for closing the issue
    const reason = interaction.options.get("reason")?.value;

    // Send in channel that ticket is closed
    const ticketClosedEmbed = new EmbedBuilder()
      .setTitle("Ticket closed")
      .setDescription(
        `${
          reason !== undefined
            ? reason
            : `This ticket was ${
                forceClose ? "forcefully " : ""
              }closed by a supporter.`
        }`
      )
      .setColor("#ff0909");
    interaction.reply({ embeds: [ticketClosedEmbed] });

    // Get/Create closed tickets category
    const category = await getCategoryElseCreate(
      interaction.guild.channels,
      appConfig.bot.closedSupportTicketCategory
    );

    // Move channel to closed tickets category
    await interaction.channel.setParent(category.id);

    // Re-apply permissions, since they get removed when moving - who invented that ._.
    // Deny @everyone to view channel
    interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
      ViewChannel: false,
    });
    // Allow the user who opened the ticket to view channel
    interaction.channel.permissionOverwrites.edit(interaction.user.id, {
      ViewChannel: true,
    });
    // Allow supporter role to view channel
    if (supporterRoleId !== undefined) {
      interaction.channel.permissionOverwrites.edit(supporterRoleId, {
        ViewChannel: true,
      });
    }

    // Tell customer that issue was closed
    if (customerUserId !== undefined) {
      const customerUser = await interaction.client.users.fetch(customerUserId);
      customerUser.send(
        `The support ticket channel <#${interaction.channelId}> was closed${
          reason !== undefined ? ` with reason: ${reason}` : "."
        }`
      );
    }
  }
}

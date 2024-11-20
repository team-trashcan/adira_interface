import {
  ButtonInteraction,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import redisCache, { RedisCacheItemNotFoundError } from "../redisCache";
import appConfig from "../config";
import api from "../api";
import getCategoryElseCreate from "../getCategoryElseCreate";

export const data = new SlashCommandBuilder()
  .setName("openticket")
  .setDescription("Opens a new ticket in a private discord channel.");

export async function execute(
  interaction: CommandInteraction | ButtonInteraction
) {
  // Don't run in DMs
  if (interaction.guild) {
    // Get next issue number from highest channel number
    let ticketNumber;
    try {
      ticketNumber = +(
        await redisCache.getValue(`ticketNumber-${interaction.guild.id}`)
      ).value;
    } catch (error) {
      if (error instanceof RedisCacheItemNotFoundError) {
        ticketNumber = 1;
      }
      console.error("Error while getting ticket number:", error);
      return interaction.reply(appConfig.messages.error500);
    }

    // Get supporterRoleId from cache
    let supporterRoleId;
    try {
      supporterRoleId = (
        await redisCache.getValue(`guildId-${interaction.guild.id}`)
      ).value;
    } catch (error) {
      if (error instanceof RedisCacheItemNotFoundError) {
        return interaction.reply(appConfig.messages.noSupporterRoleSetup);
      }
      console.error("Error while getting supporter role:", error);
      return interaction.reply(appConfig.messages.error500);
    }

    // Get supporterRole from discord
    const supporterRole = interaction.guild.roles.cache.find(
      (role) => (role.id = supporterRoleId)
    );
    if (supporterRole === undefined) {
      return interaction.reply(appConfig.messages.noSupporterRoleSetup);
    }

    try {
      // Create new channel
      const channel = await interaction.guild.channels.create({
        name: `Ticket #${ticketNumber}`,
        type: 0,
        topic: `Support ticket #${ticketNumber} opened by <@${interaction.user.id}>`,
        permissionOverwrites: [],
      });

      // Get/Create open tickets category
      const category = await getCategoryElseCreate(
        interaction.guild.channels,
        appConfig.bot.openSupportTicketCategory
      );

      // Move channel to open tickets category
      await channel.setParent(category.id);

      // Deny @everyone to view channel
      channel.permissionOverwrites.edit(interaction.guild.id, {
        ViewChannel: false,
      });
      // Allow the user who opened the ticket to view channel
      channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true,
      });
      // Allow supporter role to view channel
      channel.permissionOverwrites.edit(supporterRole.id, {
        ViewChannel: true,
      });

      // Add ticket channel in backend
      try {
        await api.addTicketChannel(
          interaction.channelId,
          interaction.user.username
        );
      } catch {
        return interaction.reply(appConfig.messages.error500);
      }

      // Silently reply to user and give channel link
      await interaction.reply({
        content: `Support ticket opened: <#${channel.id}>`,
        ephemeral: true,
      });

      // Send start message in new support channel
      await channel.send(
        `Hey <@${interaction.user.id}>, your support ticket has been opened!\nPlease describe the issue you are facing.`
      );

      // Set next ticketNumber to cache
      await redisCache.setValue(
        `ticketNumber-${interaction.guildId}`,
        `${ticketNumber + 1}`
      );

      // Add channel to cache
      await redisCache.setValue(
        `channelId-${channel.id}`,
        interaction.user.username
      );
    } catch (error) {
      console.error("Error creating private channel:", error);
      return interaction.reply(
        `Failed to create a new ticket channel. Please reach out to a <@${supporterRoleId}> directly.`
      );
    }
  } else {
    return interaction.reply("This command can only be used in a server.");
  }
}

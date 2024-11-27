import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import api from "../api";
import appConfig from "../config";
import redisCache from "../redisCache";

export const data = new SlashCommandBuilder()
  .setName("setup")
  .setDescription(
    "Set the ticket channel for opening tickets and the supporter role to access all ticket channels."
  )
  .addChannelOption((option) =>
    option
      .setName("support-channel")
      .setDescription("New ticket channels can be created here.")
      .setRequired(true)
  )
  .addRoleOption((option) =>
    option
      .setName("supporter-role")
      .setDescription("The supporter role can access all ticket channels.")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  // Only run in guilds
  if (interaction.guild === null || interaction.guildId === null) {
    return interaction.reply(appConfig.messages.errorNotInGuild);
  }

  // Supporter role
  const supporterRoleId = interaction.options
    .get("supporter-role")
    ?.value?.toString();
  if (!supporterRoleId) {
    console.error("/setup: no supporterRoleId given - should not be possible");
    return interaction.reply(appConfig.messages.error500);
  }

  const supporterRole = interaction.guild.roles.cache.find(
    (channel) => channel.id === supporterRoleId
  );
  if (supporterRole === undefined) {
    return interaction.reply({
      content: `The role with id ${supporterRoleId} does not exist.`,
      ephemeral: true,
    });
  }
  if (supporterRole.id === interaction.guildId) {
    return interaction.reply({
      content: `@everyone can't be set as the supporter role.`,
      ephemeral: true,
    });
  }
  await redisCache.setValue(`guildId-${interaction.guildId}`, supporterRoleId);
  await api.setSupporterRole(interaction.guildId, `${supporterRoleId}`);

  // Support channel
  const supportChannelId = interaction.options.get("support-channel")?.value;
  const supportChannel = interaction.guild.channels.cache.find(
    (channel) => channel.id === supportChannelId
  );
  if (supportChannel === undefined) {
    return interaction.reply({
      content: `The channel with id ${supportChannelId} does not exist.`,
      ephemeral: true,
    });
  }
  if (!supportChannel.isTextBased()) {
    return interaction.reply({
      content: `The channel with id ${supportChannelId} is not a text channel.`,
      ephemeral: true,
    });
  }
  const supportChannelEmbed = new EmbedBuilder()
    .setTitle("Support Tickets")
    .setDescription("To open a support ticket, just click on the button below.")
    .setColor("#00ff99");
  const createSupportTicketButton = new ButtonBuilder()
    .setCustomId("createSupportTicketButton")
    .setLabel("Open new ticket")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("<:externallink1:1293535015912869990>");
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    createSupportTicketButton
  );
  supportChannel.send({ embeds: [supportChannelEmbed], components: [row] });

  return await interaction.reply({
    content: `The support ticket channel is now <#${supportChannelId}>.\nThe role <@&${supporterRoleId}> has successfully been set as the supporter role.`,
    ephemeral: true,
  });
}

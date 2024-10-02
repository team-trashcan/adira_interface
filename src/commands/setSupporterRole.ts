import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import api from "../api";

export const data = new SlashCommandBuilder()
  .setName("setsupporterrole")
  .setDescription(
    "Set the supporter role for this server. This role can access all ticket channels."
  )
  .addRoleOption((option) =>
    option
      .setName("supporter-role")
      .setDescription("The supporter role can access all ticket channels.")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  const supporterRoleId = interaction.options.get("supporter-role")?.value;

  await api.setSupporterRole(
    interaction.guildId!, // Has to be defined, we only accept commands in guilds
    `${supporterRoleId}`
  );

  return await interaction.reply({
    content: `The role <@&${supporterRoleId}> has successfully been set as the supporter role.`,
    ephemeral: true,
  });
}

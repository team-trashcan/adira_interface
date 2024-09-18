import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("The message delay between your message and the bot");

export async function execute(interaction: CommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("Ping")
    .setDescription(
      `The time it takes your message to reach me: ${
        new Date().getTime() - new Date(interaction.createdTimestamp).getTime()
      }ms`
    )
    .setColor("#0099ff");

  interaction.reply({ embeds: [embed] });
}

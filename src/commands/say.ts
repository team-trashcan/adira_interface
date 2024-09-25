import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("say")
  .setDescription("A command to let the bot echo back what you said")
  .addStringOption((option) =>
    option.setName("input").setDescription("The input to echo back")
  );

export async function execute(interaction: CommandInteraction) {
  return interaction.reply(`${interaction.options.get("input")?.value}`);
}

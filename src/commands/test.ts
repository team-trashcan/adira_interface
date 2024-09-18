import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("test")
  .setDescription("A command to test things with")
  .addStringOption((option) =>
    option.setName("input").setDescription("The input to echo back")
  );

export async function execute(interaction: CommandInteraction) {
  let reply = `Hello ${
    interaction.user.globalName || interaction.user.username
  }!`;
  const stringInput = interaction.options.get("input")?.value;
  if (stringInput !== undefined) {
    reply += ` Your input was: \`${stringInput}\``;
  }
  return interaction.reply(reply);
}

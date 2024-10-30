import { CacheType, Interaction } from "discord.js";
import { execute as openTicketExecute } from "./commands/openTicket";

export default async function handleButtonPress(
  interaction: Interaction<CacheType>
) {
  // Only run for buttons
  if (!interaction.isButton()) return;

  if (interaction.customId === "createSupportTicketButton") {
    openTicketExecute(interaction);
  }
}

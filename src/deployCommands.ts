import { REST, Routes } from "discord.js";
import appConfig from "./config";
import { commands } from "./commands";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(appConfig.bot.discordToken);

export async function deployCommands(guildId: string) {
  try {
    console.log("Reloading (/) commands");

    await rest.put(
      Routes.applicationGuildCommands(appConfig.bot.discordClientId, guildId),
      {
        body: commandsData,
      }
    );

    console.log("Successfully reloaded (/) commands");
  } catch (error) {
    console.error("Error while reloading (/) commands:", error);
  }
}

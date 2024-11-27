import { REST, Routes } from "discord.js";
import appConfig from "./config";
import { commands } from "./commands";
import { MissingBotVariableError } from "./server";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(appConfig.bot.discordToken);

export async function deployCommands(guildId: string) {
  if (
    (appConfig.bot.discordClientId ?? process.env.DISCORD_BOT_CLIENT_ID) ===
    undefined
  ) {
    throw new MissingBotVariableError("No Discord bot client id found");
  }
  try {
    console.log("Reloading (/) commands");

    await rest.put(
      Routes.applicationGuildCommands(
        appConfig.bot.discordClientId ?? process.env.DISCORD_BOT_CLIENT_ID,
        guildId
      ),
      {
        body: commandsData,
      }
    );

    console.log("Successfully reloaded (/) commands");
  } catch (error) {
    console.error("Error while reloading (/) commands:", error);
  }
}

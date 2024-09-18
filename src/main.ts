import { Client } from "discord.js";
import { deployCommands } from "./deployCommands";
import { config } from "./config";
import { commands } from "./commands";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});

client.once("ready", async (client) => {
  if (config.FORCE_RELOAD_COMMANDS === "true") {
    // Reload (/) commands - they are only loaded on joining a server otherwise
    console.log("Development mode, force refreshing (/) commands");
    for (const guild of client.guilds.cache.values()) {
      await deployCommands({ guildId: guild.id });
    }
  }
  console.log("Discord bot is ready!");
});

// Deploy (/) commands when joining a new server
client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

// A (/) command was issued to this bot
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

// client.on("messageCreate", (message) => {
//   if (message.author.bot) return;
//   console.log(`${message.author.username}: ${message.content}`);
//   message.reply(message.content);
// });

// Login to discord
client.login(config.DISCORD_TOKEN);

import { Client } from "discord.js";
import { deployCommands } from "./deployCommands";
import appConfig from "./config";
import { commands } from "./commands";
import redisCache, { RedisCacheSetError } from "./redisCache";
import api, { ApiError } from "./api";
import handleUserMessage from "./handleUserMessage";
import handleButtonPress from "./handleButtonPress";

export class MissingBotVariableError extends Error {}

const client = new Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});
client.once("ready", async (client) => {
  let redisConnected = false;
  while (redisConnected === false) {
    try {
      await redisCache.client.connect();
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error connecting to redis:", error.message);
      }
      await redisCache.client.disconnect();
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    redisConnected = redisCache.client.isReady;
  }

  let gotTicketChannels = false;
  while (!gotTicketChannels) {
    try {
      const ticketChannelArray = (await api.getTicketChannels()).data;
      for (const ticketChannel of ticketChannelArray) {
        redisCache.setValue(
          `channelId-${ticketChannel.channelId}`,
          ticketChannel.username
        );
      }
      gotTicketChannels = true;
    } catch (error) {
      if (error instanceof ApiError || error instanceof RedisCacheSetError) {
        console.warn("Error getting ticket channels:", error.message);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  for (const guild of client.guilds.cache.values()) {
    let highestTicketNumber = 0;
    for (const channel of guild.channels.cache.values()) {
      if (/^ticket-[0-9]+$/g.test(channel.name)) {
        const ticketNumber = Number.parseInt(channel.name.slice(7));
        if (ticketNumber > highestTicketNumber) {
          highestTicketNumber = ticketNumber;
        }
      }
    }
    await redisCache.setValue(
      `ticketNumber-${guild.id}`,
      `${highestTicketNumber + 1}`
    );
  }

  if (appConfig.bot.forceReloadCommands === true) {
    // Reload (/) commands - they are only loaded when the bot gets added to a new server otherwise
    console.log("Force reloading (/) commands");
    for (const guild of client.guilds.cache.values()) {
      await deployCommands(guild.id);
    }
  }

  console.log("Discord bot is ready.");
});

// Deploy (/) commands when joining a new server
client.on("guildCreate", async (guild) => {
  await deployCommands(guild.id);
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

// This is how the bot can talk with users without (/) commands
client.on("messageCreate", async (message) => {
  await handleUserMessage(message);
});

// Bot reacts on button presses
client.on("interactionCreate", async (interaction) => {
  await handleButtonPress(interaction);
});

// Login to discord
if (
  (appConfig.bot.discordToken ?? process.env.DISCORD_BOT_TOKEN) === undefined
) {
  throw new MissingBotVariableError("No Discord bot token found");
}
client.login(appConfig.bot.discordToken ?? process.env.DISCORD_BOT_TOKEN);

import { Client } from "discord.js";
import { deployCommands } from "./deployCommands";
import appConfig from "./config";
import { commands } from "./commands";
import redisCache, { RedisCacheItemNotFoundError } from "./redisCache";
import api from "./api";
import handleUserMessage from "./handleUserMessage";
import handleButtonPress from "./handleButtonPress";

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

  console.log("Getting ticket channels");
  const ticketChannelArray = (await api.getTicketChannels()).data;
  for (const ticketChannel of ticketChannelArray) {
    redisCache.setValue(
      `channelId-${ticketChannel.channelId}`,
      ticketChannel.username
    );
  }

  console.log("Calculating next ticket number");
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

  console.log("Discord bot is ready!");
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
client.login(appConfig.bot.discordToken);

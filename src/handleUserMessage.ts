import { Message, OmitPartialGroupDMChannel } from "discord.js";
import appConfig from "./config";
import redisCache, { RedisCacheItemNotFoundError } from "./redisCache";
import api from "./api";

export default async function handleUserMessage(
  message: OmitPartialGroupDMChannel<Message<boolean>>
) {
  // Only run for humans
  if (message.author.bot) return;

  // Determine if message was sent in a ticket channel
  let customerUsername;
  try {
    customerUsername = (
      await redisCache.getValue(`channelId-${message.channelId}`)
    ).value;
  } catch (error) {
    if (error instanceof RedisCacheItemNotFoundError) {
      // Message was not sent inside a ticket channel, ignore
      return;
    }
    console.error(
      "Error while getting customerUsername on messageCreate:",
      error
    );
    message.reply(appConfig.messages.error500);
    return;
  }

  // Only reply to the one who opened the issue
  if (message.author.username === customerUsername) {
    const aiMessage = (await api.sendUserMessage(message.content)).data;
    message.reply(aiMessage.aiResponse);
  }
}

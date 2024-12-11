import { Message, OmitPartialGroupDMChannel } from "discord.js";
import appConfig from "./config";
import redisCache, { RedisCacheItemNotFoundError } from "./redisCache";
import api from "./api";

export default async function handleUserMessage(
  message: OmitPartialGroupDMChannel<Message<boolean>>
) {
  // Only run for humans
  if (message.author.bot) return;
  if (message.guildId === null) return;

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

  let supporterRoleId = "";
  try {
    supporterRoleId = (await redisCache.getValue(`guildId-${message.guildId}`))
      .value;
  } catch (error) {
    if (error instanceof RedisCacheItemNotFoundError) {
      supporterRoleId = (await api.getSupporterRole(message.guildId)).data
        .roleId;
      await redisCache.setValue(`guildId-${message.guildId}`, supporterRoleId);
    }
  }

  const roleIds = message.member?.roles.cache.map((role) => role.id) || [];
  const isSupporter = roleIds.includes(supporterRoleId);

  // Only reply to the one who opened the issue
  if (message.author.username === customerUsername || isSupporter) {
    const aiMessage = (
      await api.sendUserMessage(message.channelId, message.content, isSupporter)
    ).data;
    message.reply(aiMessage.aiResponse);
  }
}

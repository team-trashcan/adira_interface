import { ChannelType, GuildChannelManager } from "discord.js";

export default async function getCategoryElseCreate(
  guildChannels: GuildChannelManager,
  categoryName: string
) {
  let category;

  guildChannels.cache.find((channel) => {
    if (
      channel.type === ChannelType.GuildCategory &&
      channel.name === categoryName
    ) {
      category = channel;
    }
  });

  // Create category if not already created
  if (category === undefined) {
    category = await guildChannels.create({
      name: categoryName,
      type: ChannelType.GuildCategory,
    });
  }

  return category;
}

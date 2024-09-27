import { createClient, RedisClientOptions } from "redis";
import config from "./config";

export class RedisCacheItemNotFoundError extends Error {}
export class RedisCacheSetError extends Error {}

class RedisCache {
  public readonly client;

  constructor(private readonly options: RedisClientOptions<any, any>) {
    this.client = createClient(this.options);
  }

  async setValue(
    key: string,
    value: string,
    ttl: number = config.redis.defaultTTL
  ): Promise<void> {
    if ((await this.client.setEx(key, ttl, value)) !== "OK") {
      throw new RedisCacheSetError();
    }
  }

  async getValue(key: string): Promise<{ value: string; ttl: number }> {
    const data = await this.client.get(key);
    if (data === null) {
      throw new RedisCacheItemNotFoundError();
    }
    const ttl = await this.client.ttl(key);
    return { value: data, ttl };
  }

  async deleteValue(key: string): Promise<boolean> {
    return (await this.client.del(key)) > 0;
  }
}

const redisCache = new RedisCache(config.redis.options);

export default redisCache;

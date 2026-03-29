import Redis from "ioredis";
import { RedisSessionStoreInterface } from "../cache.interface";

export class RedisSessionStore implements RedisSessionStoreInterface {
  constructor(private client: Redis) { }

  async setKeepTtl<T>(key: string, value: T) {
    const str = JSON.stringify(value);

    return (await this.client.set(key, str, "KEEPTTL")) === "OK";
  }

  async hincrby(key: string, field: string, increment: number) {
    return await this.client.hincrby(key, field, increment);
  }

  async hget(key: string, field: string) {
    return await this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string) {
    return await this.client.hset(key, field, value);
  }
}

import { Logger } from '@nestjs/common';

/**
 * General function to invalidate cache based on a pattern
 * @param {Object} redisClient - The Redis client instance
 * @param {string} pattern - The pattern to match cache keys
 * @param {string} errorMessage - Custom error message for failure
 */
async function invalidateCache(
  redisClient,
  pattern: string,
  errorMessage: string,
) {
  try {
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
      Logger.log(`Invalidated cache with pattern: ${pattern}`);
    }
  } catch (error) {
    Logger.error(errorMessage, error);
  }
}

export async function invalidateAllSearchCaches(redisClient) {
  await invalidateCache(
    redisClient,
    'search:*',
    'Failed to invalidate global search caches',
  );
}

export async function invalidateUserCache(redisClient, userId) {
  await invalidateCache(
    redisClient,
    `search:${userId}:*`,
    `Failed to invalidate search cache for userId: ${userId}`,
  );
}

export async function invalidateParticularUserCache(redisClient, userId) {
  await invalidateCache(
    redisClient,
    `user:${userId}`,
    `Failed to invalidate particular cache for userId: ${userId}`,
  );
}

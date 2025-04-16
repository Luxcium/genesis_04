// Created by luxcium with Copilot
// src/core/rateLimiter/leakyBucketLimiter.ts

// Implements a leaky bucket rate limiter for Questrade API (6 requests/sec per token)
// See: https://www.questrade.com/api/documentation/rate-limiting

/**
 * Represents a queued API request job
 */
type RequestJob = { resolve: () => void; reject: () => void };

const RATE_LIMIT = 6; // Questrade: 6 requests per second per token
const WINDOW_MS = 1000;
let timestamps: number[] = [];
const queue: RequestJob[] = [];

/**
 * Throttle API requests to comply with Questrade rate limits
 */
export async function throttle(): Promise<void> {
    return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
        processQueue();
    });
}

function processQueue(): void {
    const now = Date.now();
    timestamps = timestamps.filter(ts => now - ts < WINDOW_MS);

    if (timestamps.length < RATE_LIMIT && queue.length > 0) {
        const job = queue.shift()!;
        timestamps.push(now);
        job.resolve();
        setTimeout(processQueue, 0);
    } else {
        setTimeout(processQueue, 50);
    }
}

// Created by luxcium © 2025 (MIT) with Copilot

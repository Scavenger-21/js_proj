import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ENDPOINTS = [
  'https://api.github.com/users/apiforge',
  'https://jsonplaceholder.typicode.com/posts/1',
  'https://jsonplaceholder.typicode.com/users',
  'https://pokeapi.co/api/v2/pokemon/pikachu',
  'https://api.stripe.com/v1/charges',
  'https://api.openai.com/v1/chat/completions',
  'https://slack.com/api/chat.postMessage',
  'https://api.twilio.com/2010-04-01/Accounts',
  'https://graph.microsoft.com/v1.0/me',
];

const METHODS = ['GET', 'GET', 'GET', 'POST', 'POST', 'PUT', 'DELETE', 'PATCH'];

const STATUS_CODES = [
  200, 200, 200, 200, 201, 201, 204, 
  400, 401, 403, 404, 429,
  500, 502, 503
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('Seeding database with presentation data...');
  
  // Clear existing history to have a clean slate
  await prisma.requestHistory.deleteMany({});
  
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  
  const records = [];
  
  // Generate 250 requests over the last 24 hours
  for (let i = 0; i < 250; i++) {
    const method = getRandomItem(METHODS);
    const url = getRandomItem(ENDPOINTS);
    const statusCode = getRandomItem(STATUS_CODES);
    const isSuccess = statusCode >= 200 && statusCode < 400;
    
    // Most requests are fast, some are slow
    const isSlow = Math.random() > 0.9;
    const responseTime = isSlow ? getRandomInt(800, 3500) : getRandomInt(20, 300);
    
    const responseSize = getRandomInt(1024, 1024 * 50); // 1KB to 50KB
    
    // Distribute timestamps mostly in the last 6 hours, some older
    const isRecent = Math.random() > 0.3;
    const timeOffset = isRecent 
      ? getRandomInt(0, 6 * 60 * 60 * 1000) 
      : getRandomInt(6 * 60 * 60 * 1000, ONE_DAY_MS);
      
    const createdAt = new Date(now - timeOffset);
    
    records.push({
      method,
      url,
      headers: JSON.stringify({ 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' }),
      body: method !== 'GET' && method !== 'DELETE' ? JSON.stringify({ test: 'data', timestamp: createdAt.toISOString() }) : null,
      statusCode,
      responseBody: JSON.stringify({ message: isSuccess ? 'Success' : 'Error', code: statusCode }),
      responseHeaders: JSON.stringify({ 'content-type': 'application/json', 'x-request-id': `req-${i}`, 'cache-control': 'no-cache' }),
      responseTime,
      responseSize,
      isSuccess,
      createdAt,
    });
  }
  
  // Sort chronologically for better realism
  records.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  
  // Insert in batches
  for (const record of records) {
    await prisma.requestHistory.create({ data: record });
  }

  console.log(`Successfully seeded ${records.length} realistic requests for the presentation!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

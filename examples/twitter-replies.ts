/**
 * Example: Fetch Twitter Replies with OpenVault
 * 
 * This shows how the fetch-twitter-replies skill from claude-toolkit
 * can be rewritten to use OpenVault for credential management.
 */

import { Vault } from 'openvault';

// Initialize vault - automatically finds .env file
const vault = new Vault();

// Get the bearer token with validation and helpful error messages
// If missing, throws error with setup instructions from the registry
const bearerToken = vault.get('TWITTER_BEARER_TOKEN');

interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

interface ApiResponse {
  data?: Tweet[];
  meta?: { next_token?: string };
  errors?: Array<{ message: string }>;
}

async function fetchReplies(tweetId: string): Promise<Tweet[]> {
  const headers = { Authorization: `Bearer ${bearerToken}` };
  const baseUrl = 'https://api.twitter.com/2/tweets/search/recent';
  
  const allTweets: Tweet[] = [];
  let nextToken: string | undefined;

  while (true) {
    const params = new URLSearchParams({
      query: `conversation_id:${tweetId}`,
      'tweet.fields': 'author_id,created_at,public_metrics',
      max_results: '100',
    });

    if (nextToken) {
      params.set('next_token', nextToken);
    }

    const response = await fetch(`${baseUrl}?${params}`, { headers });
    
    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    if (data.errors) {
      throw new Error(`API errors: ${data.errors.map(e => e.message).join(', ')}`);
    }

    if (data.data) {
      allTweets.push(...data.data);
    }

    nextToken = data.meta?.next_token;
    if (!nextToken) break;
  }

  return allTweets;
}

// Usage
async function main() {
  const tweetId = process.argv[2];
  
  if (!tweetId) {
    console.error('Usage: npx ts-node twitter-replies.ts <tweet_id>');
    process.exit(1);
  }

  console.log(`Fetching replies to tweet ${tweetId}...`);
  const replies = await fetchReplies(tweetId);
  console.log(`Found ${replies.length} replies`);
  console.log(JSON.stringify(replies, null, 2));
}

main().catch(console.error);

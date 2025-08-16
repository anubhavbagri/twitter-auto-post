require('dotenv').config();
const GenAI = require("@google/genai");
const { TwitterApi } = require("twitter-api-v2");
const SECRETS = require("./SECRETS");

const twitterClient = new TwitterApi({
  appKey: SECRETS.APP_KEY,
  appSecret: SECRETS.APP_SECRET,
  accessToken: SECRETS.ACCESS_TOKEN,
  accessSecret: SECRETS.ACCESS_SECRET,
});

const genAI = new GenAI.GoogleGenAI({apiKey: SECRETS.GEMINI_API_KEY});

const fs = require('fs');
const path = './counter.txt';

function readCounter() {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, '4'); // Set initial value to 4 if file doesn't exist
  }
  const data = fs.readFileSync(path, 'utf8');
  return parseInt(data, 10);
}

function updateCounter(counter) {
  fs.writeFileSync(path, counter.toString());
}

const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1; // Months are zero-indexed
const year = today.getFullYear();

const todayDate = `${day}/${month}/${year}`;

async function run() {
  const counter = readCounter();
  const newCounter = counter + 1;
  updateCounter(newCounter);

  // Write your prompt here
  const prompt =
    `generate content on any major festival in India on ${todayDate} (make a wish if applicable to my audience in present tense); only if festival not present then only about historical event with regards to ${todayDate} in India (fun fact if none seems applicable) as a tweet, it should not be vague and should be unique; under 270 characters and should be plain text, you can use relevant emojis`;

  // For text-only input, use the gemini-pro model
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const tweetText = `${newCounter}/40🧘🏻\n${response.text}`;

  console.log("Generated tweet:", tweetText);

  sendTweet(text);
}

run();

async function sendTweet(tweetText) {
  try {
    await twitterClient.v2.tweet(tweetText);
    console.log("Tweet sent successfully!");
  } catch (error) {
    console.error("Error sending tweet:", error);
  }
}

// async function getLastTweet() {
//   try {
//     // First, get the authenticated user's information
//     const user = await twitterClient.v2.me();
//     const userId = user.data.id;
//     console.log(`Getting last tweet for user: ${user.data.username} (ID: ${userId})`);

//     // Calculate the start time for 24 hours ago
//     const startTime = new Date();
//     startTime.setDate(startTime.getDate() - 1);
//     const startTimeISO = startTime.toISOString();

//     // Get the user's timeline with the most recent tweets from the last 24 hours
//     const tweets = await twitterClient.v2.userTimeline(userId, {
//       max_results: 5, // Minimum of 5 results
//       'tweet.fields': ['created_at', 'author_id', 'public_metrics'],
//       start_time: startTimeISO
//     });

//     if (tweets.data && tweets.data.length > 0) {
//       const lastTweet = tweets.data[0];
//       console.log("Last tweet found:");
//       console.log(`Tweet ID: ${lastTweet.id}`);
//       console.log(`Created at: ${lastTweet.created_at}`);
//       console.log(`Text: ${lastTweet.text}`);
//       console.log(`Metrics:`, lastTweet.public_metrics);
//       return lastTweet;
//     } else {
//       console.log("No tweets found for this user in the last 24 hours.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error getting last tweet:", error);
//     return null;
//   }
// }
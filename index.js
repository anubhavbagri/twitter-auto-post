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

const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1; // Months are zero-indexed
const year = today.getFullYear();

const todayDate = `${day}/${month}/${year}`;

const startDate = new Date(2025, 7, 12);
const streak = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

async function run() {
  // Write your prompt here
  const prompt =
    `generate content on historical event with regards to ${todayDate} in India (general fun fact if no historical event seems applicable) as a tweet, it should not be vague and should be unique; under 270 characters and should be plain text, you can use relevant emojis`;

  // For text-only input, use the gemini-pro model
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const tweetText = `${streak}/40🧘🏻\n${response.text}`;

  console.log("Generated tweet:", tweetText);

  sendTweet(tweetText);
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
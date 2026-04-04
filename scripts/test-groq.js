import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY not found in .env.local");
    process.exit(1);
  }

  const groq = new Groq({ apiKey });
  const model = "llama-3.3-70b-versatile";

  console.log(`Testing Groq with model: ${model}...`);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say 'Groq is ready!' if you are working correctly.",
        },
      ],
      model: model,
    });

    console.log("Response:", chatCompletion.choices[0].message.content);
    console.log("SUCCESS: Groq is working correctly.");
  } catch (error) {
    console.error("ERROR: Groq test failed.");
    console.error(error);
    process.exit(1);
  }
}

testGroq();

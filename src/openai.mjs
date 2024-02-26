import dotenv from "dotenv";
dotenv.config({ path: process.ENV });
import OpenAI from "openai";

const YOUR_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: YOUR_OPENAI_API_KEY });

const getPrompt = (code, name) => {
  return `You're a reviewer for very important enterprice code, expert in TS.
  You get paid to find bugs, find code improvements, bring best practices.
  Review the following TypeScript function named ${name}
  and provide comments for bugs/ potential bugs and improvements to the code: \`\`\`\n\n${code}.\`\`\`
   Each line passed containst the number of the line and the code on that line.
    Write github review for some lines as an array in following valid JSON format:
     '[{"line": {#line_for_comment}, "review":"{your review}"}, ...]''. 
     Remove trailing commas in the result JSON.
     Make sure comments are valuable and make sense.
     
     Write a reviews in a voice of Darth Vader, very distinctive. Sometimes quote Darth Vader in the end of comments.`;
}

export class Reviewer {
  constructor(apiKey = process.env.OPENAI_API_KEY) {
    this.reviews = [];
    this.api = new OpenAI({ apiKey });
  }

  async writeReview(code, name) {
    const prompt = getPrompt(code, name);
    try {

      const completion = await openai.chat.completions.create({
        messages: [{ "role": "user", "content": prompt }],
        model: "gpt-3.5-turbo",
      });
      const comments = JSON.parse(completion.choices[0].message.content);
      // console.log({comments});
      return comments;
    } catch (error) {
      console.error("Error calling the ChatGPT API:", error);
      return [];
    }

  }
}
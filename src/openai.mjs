import dotenv from "dotenv";
dotenv.config({ path: process.ENV });
import OpenAI from "openai";

const YOUR_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({apiKey: YOUR_OPENAI_API_KEY});

export async function reviewFunction(functionText, functionName) {
    const prompt = `You're a reviewer for very important enterprice code. You get paid to find bugs and find code improvements.
    Review the following TypeScript function named ${functionName}
    and provide comments for some lines of code for bugs/ potential bugs and improvements to the code:\n\n${functionText}.
     Each line passed containst the number of the line and the code on that line.
      Write github review for some lines as an array in following valid JSON format:
       '[{"line": {#line}, "review":"{your review}"}, ...]''. 
       Remove trailing commas in the result JSON.
       
       Write a reviews in a voice of Darth Vader, very distinctive. Sometimes quote Darth Vader in the end of comments.`;
  
    // Ensure your prompt does not exceed GPT-4's token limit here
  
    try {
      // console.log("Calling the ChatGPT API...");
  
      const completion = await openai.chat.completions.create({
        messages: [{"role": "user", "content": prompt}],
        model: "gpt-3.5-turbo",
      });
  
      // console.log(completion);
  
      // Extract and return comments from the response
      // console.log(completion.choices[0].message.content);
      const comments = JSON.parse(completion.choices[0].message.content);
      // console.log({comments});
      return comments;
    } catch (error) {
      console.error("Error calling the ChatGPT API:", error);
      return "Error processing function review.";
    }
  }
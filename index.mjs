import 'dotenv/config'
import ts from "typescript";
import fs from "fs";
import OpenAI from "openai";

const YOUR_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({apiKey: YOUR_OPENAI_API_KEY});
// Placeholder for an HTTP request library, like axios

async function reviewFunction(functionText, functionName) {
  const prompt = `Review the following TypeScript function named ${functionName}
  and provide comments for some lines of code:\n\n${functionText}.
   Each line passed containst the number of the line and the code on that line.
    Write github review for some lines as an array in following valid JSON format:
     '[{"line": {#line}, "review":"{your review}"}, ...]''. 
     Remove trailing commas in the result JSON.
     
     Write a review in a voice of Darth Vader.`;

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

const getName = (node) => {
  if (ts.isFunctionDeclaration(node)) {
    return node.name?.text;
  } else if (ts.isMethodDeclaration(node)) {
    return node.name?.getText();
  } else {
    return 'anonymous';
  }
}

async function processFile(fileName) {
  const reviews = [];
  const fileContents = fs.readFileSync(fileName, "utf8");
  const sourceFile = ts.createSourceFile(fileName, fileContents, ts.ScriptTarget.Latest, true);
  
  async function visit(node, level = 0) {
    // console.log(level, "Visiting: ", ts.SyntaxKind[node.kind]);
    const shouldCheck = ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node);
    if (shouldCheck) {
      const functionName = getName(node);
      console.log("Function Name: ", functionName);
      
      //const functionText = fileContents.substring(node.pos, node.end);
      const functionText = extractFunctionWithLineNumbers(fileContents, node);
  
      const reviewComment = await reviewFunction(functionText, functionName);
      reviews.push(...reviewComment);
      // console.log(`Review for ${functionName}: ${reviewComment}`, reviewComment);
    }
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      console.log(`Arrow Function or Function Expression`);
    }
  
    for (const child of getChildNodes(node)) {
      await visit(child, level + 1);
    }
    console.log(reviews);
  }

  await visit(sourceFile);
}

// Example usage, replace 'path/to/your/file.ts' with the actual file path
processFile("./example.ts").then(() => console.log("Review complete."));

function getChildNodes(node) {
  const children = [];
  node.forEachChild(child => {
      children.push(child);
  });
  return children;
}

function extractFunctionWithLineNumbers(fileContents, node) {
  // Calculate start and end lines
  const lines = fileContents.split(/\r?\n/);
  const startLine = fileContents.substring(0, node.pos).split(/\r?\n/).length;
  const endLine = fileContents.substring(0, node.end).split(/\r?\n/).length;

  // Extract the function content with line numbers
  let extractedContent = '';
  for (let i = startLine; i <= endLine; i++) {
      extractedContent += `${i}:${lines[i - 1]}\n`;
  }

  return extractedContent;
}
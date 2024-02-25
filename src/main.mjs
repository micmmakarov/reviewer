import fs from "fs";
import { commentOnLines } from "./github.mjs";
import { reviewFunction } from "./openai.mjs";
import { extractFunctionWithLineNumbers, getName } from "./utils.mjs";
import ts from "typescript";

export async function processFile(fileName) {
  const reviews = [];
  const fileContents = fs.readFileSync(fileName, "utf8");
  const sourceFile = ts.createSourceFile(fileName, fileContents, ts.ScriptTarget.Latest, true);
  
  async function visit(node, level = 0) {
    const shouldCheck = ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node);
    if (shouldCheck) {
      const functionName = getName(node);
      console.log("Function Name: ", functionName);
      
      const functionText = extractFunctionWithLineNumbers(fileContents, node);
  
      const reviewComment = await reviewFunction(functionText, functionName);
      reviews.push(...reviewComment);
    }
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      console.log(`Arrow Function or Function Expression`);
    }
  
    for (const child of getChildNodes(node)) {
      await visit(child, level + 1);
    }
    if (level === 0) {
      console.log(reviews);
      await commentOnLines(reviews);
    }
    console.log("Done visiting node for", fileName);
  }

  // within the content window of gpt4
  if (fileContents.length < 17000) {
    console.log("File contents length: ", fileContents.length);
    const functionText = extractFunctionWithLineNumbers(fileContents, sourceFile);
    const reviewComments = await reviewFunction(functionText, fileName);
    await commentOnLines(reviewComments);
  } else {
    await visit(sourceFile);
  }
}
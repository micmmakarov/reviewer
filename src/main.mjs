import fs from "fs";
import { Commenter } from "./github.mjs";
import { Reviewer } from "./openai.mjs";
import { extractFunctionWithLineNumbers, getName } from "./utils.mjs";
import ts from "typescript";

export class Engineer {
    constructor(files, { owner, repo, pullRequest, commitId }, { githubToken, openaiToken }) {
        this.files = files;
        this.owner = owner;
        this.repo = repo;
        this.pullRequest = pullRequest;
        this.commitId = commitId;
        this.commenter = new Commenter(owner, repo, pullRequest, commitId, githubToken);
        this.reviewer = new Reviewer(openaiToken);
    }
    async processFiles() {

    }
    async processFile(fileName) {
        const reviews = [];
        const fileContents = fs.readFileSync(fileName, "utf8");
        const sourceFile = ts.createSourceFile(fileName, fileContents, ts.ScriptTarget.Latest, true);
    }

    async visit(node, level = 0) {
        const shouldCheck = ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node);
        if (shouldCheck) {
            const functionName = getName(node);
            console.log("Function Name: ", functionName);

            const code = extractFunctionWithLineNumbers(fileContents, node);

            const reviewComment = await this.reviewer.writeReview(code, functionName);
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
            await this.commenter.commentOnLines(fileName, reviews);
        }
        console.log("Done visiting node for", fileName);

        if (fileContents.length < 17000) {
            console.log("File contents length: ", fileContents.length);
            const code = extractFunctionWithLineNumbers(fileContents, sourceFile);
            const reviewComments = await this.reviewer.writeReview(code, fileName);
            console.log("Review Comments: ", reviewComments);
            await this.commenter.commentOnLines(reviewComments);
        } else {
            await visit(sourceFile);
        }
    }
}
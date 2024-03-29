import fs from "fs";
import { Commenter } from "./github.mjs";
import { Reviewer } from "./openai.mjs";
import { extractFunctionWithLineNumbers, getName, getChildNodes } from "./utils.mjs";
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
        console.log("Processing files: ", this.files);
        for (const file of this.files) {
            await this.processFile(file);
        }
    }
    async processFile(fileName) {
        const fileContents = fs.readFileSync(fileName, "utf8");
        const sourceFile = ts.createSourceFile(fileName, fileContents, ts.ScriptTarget.Latest, true);

        const visit = async (node, level = 0) => {
            const shouldCheck = ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node);
            if (shouldCheck) {
                const functionName = getName(node);
                console.log("Function Name: ", functionName);

                const code = extractFunctionWithLineNumbers(fileContents, node);

                const reviewComment = await this.reviewer.writeReview(code, functionName);
                console.log("Publishing Comments: ", reviewComment);
                await this.commenter.commentOnLines(fileName, reviewComment);
            }
            if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
                console.log(`Arrow Function or Function Expression`);
            }

            for (const child of getChildNodes(node)) {
                await visit(child, level + 1);
            }
            if (level === 0) {
                console.log("Done visiting node for", fileName);
            }
        }
        if (fileContents.length < 17000) {
            console.log("File contents length: ", fileContents.length);
            const code = extractFunctionWithLineNumbers(fileContents, sourceFile);
            const reviewComments = await this.reviewer.writeReview(code, fileName);
            console.log("Review Comments: ", reviewComments);
            await this.commenter.commentOnLines(fileName, reviewComments);
        } else {
            await visit(sourceFile);
        }
    }
}
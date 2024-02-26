import core from '@actions/core';
import github from '@actions/github';
import { Engineer } from "./src/main.mjs";
import fs from "fs";

try {
  // `who-to-greet` input defined in action metadata file
  const changedFiles = core.getInput('file-list');
  const tsFileList = fs.readFileSync(changedFiles, "utf8").split('\n').filter((f) => f.endsWith('.ts'));
  console.log(`TS files changed: `, changedFiles, tsFileList);
  const githubToken = core.getInput('github-token');
  const openaiToken = core.getInput('openai-token');
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const pullRequest = github.context.payload.pull_request.number;
  const commitId = github.context.payload.pull_request.head.sha;
  const engineer = new Engineer(tsFileList,
    { owner, repo, pullRequest, commitId },
    { githubToken, openaiToken });
  engineer.processFiles().then((result) => {
    console.log('Processing result: ', result);
  });
} catch (error) {
  core.setFailed(error.message);
}
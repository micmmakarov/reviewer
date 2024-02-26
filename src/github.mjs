import dotenv from "dotenv";
dotenv.config({ path: process.ENV });
import { Octokit } from 'octokit';

export class Commenter {
  constructor(owner, repo, pullRequest, commitId, token = process.env.GITHUB_TOKEN) {
    this.owner = owner;
    this.repo = repo;
    this.pullNumber = pullRequest;
    this.commitId = commitId;
    this.api = new Octokit({ auth: token });
  }

  async commentOnLines(path, comments) {
    for (const comment of comments) {
      const { line, review: body } = comment;
      const payload = {
        owner: this.owner,
        repo: this.repo,
        pull_number: this.pullNumber,
        body,
        commit_id: this.commitId,
        path,
        line,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      };
      try {
        await this.api.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', payload);
      } catch (error) {
        console.log('Error commenting on lines:', error.message, comment);
      }
    }
  }
}

export const commentOnLines = async (comments) => {
  // Example usage
  const commitId = 'd202127548434484e26bdc3ac4d58adb9f05dbef'; // SHA of the commit at the head of the PR
  const path = 'example3.ts';
  for (const comment of comments) {
    const { line, review: body } = comment;
    const payload = {
      owner: 'micmmakarov',
      repo: 'review',
      pull_number: '3',
      body,
      commit_id: commitId,
      path: path,
      //            start_line: line,
      //            start_side: 'RIGHT',
      line,
      // side: 'RIGHT',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    };
    //console.log('payload', payload, comment);
    try {
      await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', payload);
    } catch (error) {
      console.log('Error commenting on lines:', error.message, comment);
    }
    //await createPRComment(token, owner, repo, pullNumber, body, commitId, path, line);
  }
}

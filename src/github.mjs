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
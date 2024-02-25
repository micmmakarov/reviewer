import dotenv from "dotenv";
dotenv.config({ path: process.ENV });
import { Octokit } from 'octokit';
console.log('process.env.GITHUB_TOKEN', process.env.GITHUB_TOKEN);
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })


// Function to create a comment on a PR for a specific file and line number
export async function createPRComment(token, owner, repo, pullNumber, body, commitId, path, position) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };
  const data = {
    body: body,
    commit_id: commitId,
    path: path,
    position: position
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
        console.log('response', response);
      throw new Error(`Error: ${response.status}`);
    }

    const jsonResponse = await response.json();
    console.log('Comment created successfully:', jsonResponse);
  } catch (error) {
    console.error('Failed to create comment:', error.message);
  }
}


export const commentOnLines = async (comments) => {
    // Example usage
    const owner = 'micmmakarov';
    const repo = 'review';
    const pullNumber = 1; // Pull request number
    const commitId = 'b9b4558ffe18574e35c2c85abdb9c95cf6c20aaf'; // SHA of the commit at the head of the PR
    const path = './example.ts';
    //const position = 4; // Line number in the file's diff to comment on
    for (const comment of comments) {
        const { line, review: body } = comment;
        await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
            owner: 'micmmakarov',
            repo: 'review',
            pull_number: '1',
            body,
            commit_id: commitId,
            path: path,
            start_line: 1,
            start_side: 'RIGHT',
            line,
            side: 'RIGHT',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        //await createPRComment(token, owner, repo, pullNumber, body, commitId, path, line);
    }
}

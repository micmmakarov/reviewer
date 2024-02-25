import dotenv from "dotenv";
dotenv.config({ path: process.ENV });
import { Octokit } from 'octokit';
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
      // console.log('response', response);
      throw new Error(`Error: ${response.status}`);
    }

    const jsonResponse = await response.json();
    // console.log('Comment created successfully:', jsonResponse);
  } catch (error) {
    console.error('Failed to create comment:', error.message);
  }
}


export const commentOnLines = async (comments) => {
    // Example usage
    const commitId = '44c11051254aac24785647528a785fdd1b664aaa'; // SHA of the commit at the head of the PR
    const path = 'example3.ts';
    for (const comment of comments) {
        const { line, review: body } = comment;
        const payload = {
            owner: 'micmmakarov',
            repo: 'review',
            pull_number: '2',
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
        await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', payload)
        //await createPRComment(token, owner, repo, pullNumber, body, commitId, path, line);
    }
}

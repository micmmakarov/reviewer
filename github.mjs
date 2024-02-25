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
      throw new Error(`Error: ${response.status}`);
    }

    const jsonResponse = await response.json();
    console.log('Comment created successfully:', jsonResponse);
  } catch (error) {
    console.error('Failed to create comment:', error.message);
  }
}


export const commentOnLines = async (lines) => {
    // Example usage
    const token = process.env.GITHUB_TOKEN;
    const owner = 'micmmakarov';
    const repo = 'review';
    const pullNumber = 1; // Pull request number
    const body = 'This is a comment example for a specific line.';
    const commitId = 'commit_sha'; // SHA of the commit at the head of the PR
    const path = 'file_path_relative_to_repo_root';
    const position = 4; // Line number in the file's diff to comment on

    createPRComment(token, owner, repo, pullNumber, body, commitId, path, position);
}

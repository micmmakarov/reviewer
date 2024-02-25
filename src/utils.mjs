import ts from "typescript";

export function getChildNodes(node) {
    const children = [];
    node.forEachChild(child => {
        children.push(child);
    });
    return children;
  }

  export const getName = (node) => {
    if (ts.isFunctionDeclaration(node)) {
      return node.name?.text;
    } else if (ts.isMethodDeclaration(node)) {
      return node.name?.getText();
    } else {
      return 'anonymous';
    }
  }
  
  export function extractFunctionWithLineNumbers(fileContents, node) {
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
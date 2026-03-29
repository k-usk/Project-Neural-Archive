import { marked } from 'marked';

const markdown = `1.  **知識の結晶化**: 膨大な**人工知能 (AI)**用語を、**「Neural Archive Aesthetic」**に基づいた...`;

function preprocess(m) {
  let p = m;
  // Step 1: Remove internal spaces (safety)
  p = p.replace(/\*\* +/g, '**').replace(/ +\*\*/g, '**');

  // Step 2: Ensure space OUTSIDE **...**
  // Match any **...** block and handle its neighbors
  p = p.replace(/([^\s\*]?)(\*\*.*?\*\*)([^\s\*]?)/g, (match, p1, p2, p3) => {
    let res = p2;
    if (p1) {
      res = (/\s/.test(p1) ? p1 : p1 + ' ') + res;
    }
    if (p3) {
      res = res + (/\s/.test(p3) ? p3 : ' ' + p3);
    }
    return res;
  });
  return p;
}

marked.use({ hooks: { preprocess } });
console.log("RESULT:\n", marked.parse(markdown));

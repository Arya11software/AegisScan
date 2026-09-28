import * as parser from '@babel/parser';

/**
 * CONFIG-REAL-001: Potential Client-Side Credential Exposure Rule
 * Uses @babel/parser to analyze AST nodes of TypeScript/JavaScript source files.
 * Inspects ObjectProperty AST nodes for credential-like key patterns.
 */
export function analyzeClientCredentials(filePath, fileContent) {
  const observations = [];

  let ast;
  try {
    ast = parser.parse(fileContent, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    });
  } catch (err) {
    // If syntax/parser error occurs, gracefully return empty results (safe parsing)
    return observations;
  }

  const lines = fileContent.split('\n');

  function maskValue(val) {
    if (!val || typeof val !== 'string') return '********';
    if (val.length <= 6) return '******';
    // Requirement 8 format: TEST_SECRET_123 -> TEST_SECR********
    return `${val.slice(0, 8)}********`;
  }

  const credentialKeyPattern = /^(apiKey|api_key|secret|clientSecret|accessToken|privateKey|password)$/i;

  function traverseNode(node) {
    if (!node || typeof node !== 'object') return;

    // Direct ObjectProperty AST inspection
    if (node.type === 'ObjectProperty') {
      const keyName = node.key ? (node.key.name || node.key.value) : null;
      if (keyName && credentialKeyPattern.test(keyName)) {
        if (node.value && (node.value.type === 'StringLiteral' || node.value.type === 'Literal')) {
          const rawValue = node.value.value;
          const lineNum = node.loc ? node.loc.start.line : 1;
          const exists = observations.some(o => o.file === filePath && o.line === lineNum && o.symbol === keyName);
          if (!exists) {
            observations.push({
              ruleId: 'CONFIG-REAL-001',
              checkId: 'REAL-CHK-001',
              checkName: 'Potential Client-Side Credential Exposure',
              observationType: 'CLIENT_SIDE_CREDENTIAL_PATTERN',
              result: 'OBSERVED',
              severity: 'HIGH',
              file: filePath,
              line: lineNum,
              symbol: keyName,
              matchedPattern: 'Credential-like AST property declaration',
              valueMasked: maskValue(rawValue),
              codeSnippet: lines[lineNum - 1] ? lines[lineNum - 1].trim() : ''
            });
          }
        }
      }
    }

    // Recursively traverse child AST nodes
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'comments') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(traverseNode);
      } else if (child && typeof child === 'object' && child.type) {
        traverseNode(child);
      }
    }
  }

  traverseNode(ast);
  return observations;
}


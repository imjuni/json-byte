/* eslint-disable no-restricted-syntax */
import { JSONPath } from 'jsonpath-plus';

import { safeYamlParse } from '#/lib/json/safeYamlParse';

export interface ITextPosition {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

/**
 * Find the text position (line and column) of a JSON/YAML node by its JSONPath
 * This function searches through the text to find the key that matches the JSONPath
 * Supports both JSON and YAML formats
 */
export function findTextPositionByJsonPath(content: string, jsonPath: string): ITextPosition | null {
  try {
    // Try to parse as YAML first (YAML parser also handles JSON)
    const parsed = safeYamlParse(content);

    if (parsed instanceof Error) {
      return null;
    }

    const result = JSONPath({ path: jsonPath, json: parsed, resultType: 'all' });

    if (result.length === 0) {
      return null;
    }

    // Extract the last key from the JSONPath (e.g., "$.address.city" -> "city")
    // eslint-disable-next-line no-useless-escape
    const pathParts = jsonPath.split(/[\.\[\]'"]/).filter((part) => part && part !== '$');
    const targetKey = pathParts[pathParts.length - 1];

    // Split content into lines
    const lines = content.split('\n');

    // Detect if content is YAML (no braces/brackets at root level typically)
    const isYaml = !content.trim().startsWith('{') && !content.trim().startsWith('[');

    // Search for the key in the content
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      // Look for the key as a property name (e.g., "city": value or city: value)
      const keyPattern = new RegExp(`["']?${targetKey}["']?\\s*:`);
      const match = line.match(keyPattern);

      if (match) {
        const startColumn = match.index ?? 0;
        const startLine = lineIndex + 1; // Monaco uses 1-based line numbers
        const keyIndentation = line.search(/\S/); // Find indentation level of the key

        // Find the end of the value on this or subsequent lines
        let endLine = startLine;
        let endColumn = line.length;

        if (isYaml) {
          // YAML: Find end by indentation level
          const valueStart = startColumn + match[0].length;
          const valueOnSameLine = line.substring(valueStart).trim();

          if (valueOnSameLine) {
            // Simple value on the same line
            endColumn = line.length;
          } else {
            // Multi-line value: find next line with same or less indentation
            for (let i = lineIndex + 1; i < lines.length; i += 1) {
              const nextLine = lines[i];

              // Skip empty lines
              if (nextLine.trim() !== '') {
                const nextIndentation = nextLine.search(/\S/);
                if (nextIndentation <= keyIndentation) {
                  // Found next key at same or higher level
                  endLine = i;
                  endColumn = 0;
                  break;
                }

                // Include this line in the selection
                endLine = i + 1;
                endColumn = nextLine.length;
              }
            }
          }
        } else {
          // JSON: Find end by brackets/braces
          const valueStart = startColumn + match[0].length;
          let depth = 0;
          let inString = false;
          let foundEnd = false;

          for (let i = lineIndex; i < lines.length && !foundEnd; i += 1) {
            const currentLine = lines[i];
            const startPos = i === lineIndex ? valueStart : 0;

            for (let j = startPos; j < currentLine.length; j += 1) {
              const char = currentLine[j];

              if (char === '"' && (j === 0 || currentLine[j - 1] !== '\\')) {
                inString = !inString;
              }

              if (!inString) {
                if (char === '{' || char === '[') {
                  depth += 1;
                } else if (char === '}' || char === ']') {
                  depth -= 1;
                  if (depth === 0) {
                    endLine = i + 1;
                    endColumn = j + 1;
                    foundEnd = true;
                    break;
                  }
                } else if (depth === 0 && (char === ',' || char === '\n')) {
                  endLine = i + 1;
                  endColumn = j;
                  foundEnd = true;
                  break;
                }
              }
            }
          }
        }

        return {
          startLine,
          startColumn: startColumn + 1, // Monaco uses 1-based columns
          endLine,
          endColumn,
        };
      }
    }

    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error finding text position:', error);
    return null;
  }
}

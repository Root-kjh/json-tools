export interface RepairResult {
  success: boolean
  repaired: string
  fixes: string[]
}

export function repairJson(input: string): RepairResult {
  const fixes: string[] = []
  let result = input

  // Remove BOM
  if (result.charCodeAt(0) === 0xFEFF) {
    result = result.slice(1)
    fixes.push('Removed BOM character')
  }

  // Replace single quotes with double quotes (for keys and string values)
  const singleQuotePattern = /(?<!\\)'([^'\\]*(?:\\.[^'\\]*)*)'/g
  if (singleQuotePattern.test(result)) {
    result = result.replace(singleQuotePattern, '"$1"')
    fixes.push('Replaced single quotes with double quotes')
  }

  // Add quotes to unquoted keys
  const unquotedKeyPattern = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g
  if (unquotedKeyPattern.test(result)) {
    result = result.replace(unquotedKeyPattern, '$1"$2"$3')
    fixes.push('Added quotes to unquoted keys')
  }

  // Remove trailing commas in arrays
  const trailingCommaArrayPattern = /,(\s*)\]/g
  if (trailingCommaArrayPattern.test(result)) {
    result = result.replace(trailingCommaArrayPattern, '$1]')
    fixes.push('Removed trailing comma in array')
  }

  // Remove trailing commas in objects
  const trailingCommaObjectPattern = /,(\s*)\}/g
  if (trailingCommaObjectPattern.test(result)) {
    result = result.replace(trailingCommaObjectPattern, '$1}')
    fixes.push('Removed trailing comma in object')
  }

  // Replace JavaScript undefined with null
  const undefinedPattern = /:\s*undefined\b/g
  if (undefinedPattern.test(result)) {
    result = result.replace(undefinedPattern, ': null')
    fixes.push('Replaced undefined with null')
  }

  // Replace NaN with null
  const nanPattern = /:\s*NaN\b/g
  if (nanPattern.test(result)) {
    result = result.replace(nanPattern, ': null')
    fixes.push('Replaced NaN with null')
  }

  // Replace Infinity with null
  const infinityPattern = /:\s*-?Infinity\b/g
  if (infinityPattern.test(result)) {
    result = result.replace(infinityPattern, ': null')
    fixes.push('Replaced Infinity with null')
  }

  // Remove comments (// and /* */)
  const singleLineCommentPattern = /\/\/[^\n]*/g
  const multiLineCommentPattern = /\/\*[\s\S]*?\*\//g
  if (singleLineCommentPattern.test(result) || multiLineCommentPattern.test(result)) {
    result = result.replace(singleLineCommentPattern, '')
    result = result.replace(multiLineCommentPattern, '')
    fixes.push('Removed comments')
  }

  // Try to parse
  try {
    JSON.parse(result)
    return { success: true, repaired: result, fixes }
  } catch {
    // If still failing, return with fixes attempted
    return { 
      success: fixes.length > 0, 
      repaired: result, 
      fixes: fixes.length > 0 ? fixes : ['Could not auto-repair JSON']
    }
  }
}

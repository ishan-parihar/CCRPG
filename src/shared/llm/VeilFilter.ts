/**
 * VeilFilter - strips Veil-violating content from LLM input and output.
 * Per foundations/20 section 4 and foundations/22 section 13.
 */

interface VeilPattern {
  readonly regex: RegExp;
  readonly category: string;
}

const VEIL_PATTERNS: readonly VeilPattern[] = [
  {
    regex: /\b(Infrared|Magenta|Red|Amber|Orange|Green|Turquoise|White)\s+(stage|level|altitude|development)/gi,
    category: 'stage-as-developmental-label',
  },
  {
    regex: /\b(Agency|Communion|Eros|Agape)\s+(drive|score|level|metric)/gi,
    category: 'drive-label-as-system-term',
  },
  {
    regex: /\b(dark[-\s]?addiction|dark[-\s]?allergy|golden[-\s]?addiction|golden[-\s]?allergy)\b/gi,
    category: 'shadow-quadrant-name',
  },
  {
    regex: /\b(score|rating|level|altitude|metric|assessment)\s*[:=]?\s*\d+/gi,
    category: 'numerical-score-in-assessment',
  },
  {
    regex: /\b(polarity|crystalliz|STO|STS)\s+(vector|magnitude|direction|score)/gi,
    category: 'polarity-data',
  },
  {
    regex: /\btheta[-\s]?decay\b/gi,
    category: 'theta-decay',
  },
  {
    regex: /\b(your\s+(assessment|evaluation|diagnosis|developmental\s+score))\b/gi,
    category: 'assessment-diagnostic-language',
  },
  {
    regex: /\d+%\s*(complete|progress|to\s+next)/gi,
    category: 'progress-percentage',
  },
];

/**
 * Filters input going TO the LLM by removing Veil-violating patterns.
 * Returns sanitized content string.
 */
export function filterInput(content: string): string {
  let result = content;
  for (const pattern of VEIL_PATTERNS) {
    pattern.regex.lastIndex = 0;
    result = result.replace(pattern.regex, '');
  }
  // Clean up double spaces and leading/trailing whitespace from removals
  result = result.replace(/  +/g, ' ').trim();
  return result;
}

/**
 * Filters output coming FROM the LLM by checking for Veil violations.
 * Returns an object indicating whether the content passed, the filtered content,
 * and a list of violation categories found.
 */
export function filterOutput(content: string): {
  readonly passed: boolean;
  readonly filtered: string;
  readonly violations: readonly string[];
} {
  const violations: string[] = [];
  let filtered = content;

  for (const pattern of VEIL_PATTERNS) {
    // Reset lastIndex for global regexes
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(filtered)) {
      violations.push(pattern.category);
      // Reset lastIndex again before replace
      pattern.regex.lastIndex = 0;
      filtered = filtered.replace(pattern.regex, '');
    }
  }

  filtered = filtered.replace(/  +/g, ' ').trim();

  return {
    passed: violations.length === 0,
    filtered,
    violations,
  };
}

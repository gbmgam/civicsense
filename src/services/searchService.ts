import { EnrichedService, SearchMatchResult, SearchResponse } from '../types/civic';

const CONVERSATIONAL_STOPWORDS = new Set([
  'i',
  'me',
  'my',
  'we',
  'our',
  'you',
  'your',
  'need',
  'want',
  'looking',
  'search',
  'searching',
  'find',
  'get',
  'obtain',
  'apply',
  'applying',
  'application',
  'where',
  'how',
  'what',
  'which',
  'who',
  'when',
  'can',
  'could',
  'should',
  'would',
  'do',
  'does',
  'did',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'to',
  'for',
  'of',
  'in',
  'on',
  'at',
  'by',
  'with',
  'from',
  'about',
  'into',
  'a',
  'an',
  'the',
  'and',
  'or',
  'please',
  'help',
  'tell',
  'go',
  'visit',
  'office',
  'department',
  'counter',
  'desk',
  'service',
  'government',
  'official',
]);

const SYNONYM_MAP: Record<string, string[]> = {
  ddo: ['ddo', 'drawing', 'disbursing', 'treasury', 'signature', 'bill', 'token'],
  sign: ['signature', 'ddo', 'endorsement', 'countersignature'],
  signature: ['ddo', 'signature', 'bill', 'treasury'],
  salary: ['ddo', 'income', 'treasury'],
  income: ['income', 'revenue', 'salary', 'ews', 'scholarship'],
  birth: ['birth', 'newborn', 'baby', 'dob', 'vital', 'child'],
  baby: ['birth', 'newborn', 'vital'],
  death: ['death', 'deceased', 'mortality', 'cremation', 'vital'],
  pension: ['pension', 'retirement', 'retiree', 'ppo', 'superannuation', 'life', 'senior'],
  retire: ['pension', 'ppo', 'retirement', 'life'],
  ppo: ['pension', 'ppo'],
  jeevan: ['life certificate', 'pension', 'biometric'],
  shop: ['trade', 'license', 'commercial', 'business'],
  business: ['trade', 'license', 'commercial'],
  store: ['trade', 'license'],
  trade: ['trade', 'license', 'business', 'municipal'],
  house: ['property', 'building', 'deed', 'mutation', 'occupancy', 'domicile'],
  land: ['property', 'mutation', 'khata', 'encumbrance', 'rural', 'deed'],
  property: ['property', 'deed', 'mutation', 'encumbrance', 'building', 'sub-registrar'],
  deed: ['property', 'sale deed', 'registration', 'sub-registrar'],
  registry: ['property', 'sale deed', 'registration'],
  plan: ['building', 'approval', 'blueprint', 'construction', 'urban'],
  construction: ['building', 'approval', 'occupancy', 'permit'],
  permit: ['building', 'trade', 'license', 'occupancy'],
  marriage: ['marriage', 'wedding', 'spouse', 'vital'],
  wedding: ['marriage', 'vital'],
  elderly: ['senior citizen', 'pension', 'welfare'],
  old: ['senior citizen', 'pension'],
  farmer: ['rural', 'agricultural', 'subsidy'],
  kisan: ['rural', 'agricultural', 'subsidy'],
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isFuzzyTokenMatch(queryToken: string, targetWord: string): boolean {
  if (queryToken.length < 4 || targetWord.length < 4) return false;
  if (targetWord.startsWith(queryToken) || queryToken.startsWith(targetWord)) return true;
  const maxDist = queryToken.length >= 7 ? 2 : 1;
  return levenshteinDistance(queryToken, targetWord) <= maxDist;
}

export function extractSearchTerms(rawQuery: string): {
  normalizedQuery: string;
  extractedTerms: string[];
  expandedTerms: string[];
} {
  const normalizedQuery = normalizeText(rawQuery);
  const allTokens = normalizedQuery.split(' ').filter(Boolean);

  // Keep meaningful tokens; if all tokens were stopwords (e.g. "office"), fall back to all tokens
  let coreTokens = allTokens.filter((t) => !CONVERSATIONAL_STOPWORDS.has(t));
  if (coreTokens.length === 0 && allTokens.length > 0) {
    coreTokens = allTokens;
  }

  const expandedSet = new Set<string>(coreTokens);
  for (const token of coreTokens) {
    const synonyms = SYNONYM_MAP[token];
    if (synonyms) {
      synonyms.forEach((s) => expandedSet.add(s));
    }
  }

  return {
    normalizedQuery,
    extractedTerms: coreTokens,
    expandedTerms: Array.from(expandedSet),
  };
}

export function searchCivicServices(
  rawQuery: string,
  allEnrichedServices: EnrichedService[],
  selectedCategory?: string,
  selectedDepartmentId?: string
): SearchResponse {
  const activeServices = allEnrichedServices.filter(
    (item) => item.service.status === 'active'
  );

  // Filter by category and department first if selected
  const filteredPool = activeServices.filter((item) => {
    if (selectedCategory && selectedCategory !== 'All' && item.service.category !== selectedCategory) {
      return false;
    }
    if (
      selectedDepartmentId &&
      selectedDepartmentId !== 'All' &&
      item.service.departmentId !== selectedDepartmentId
    ) {
      return false;
    }
    return true;
  });

  const allCategories = Array.from(
    new Set(activeServices.map((s) => s.service.category))
  );

  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return {
      query: rawQuery,
      normalizedQuery: '',
      extractedTerms: [],
      exactMatches: filteredPool.map((enriched) => ({
        enriched,
        score: 100,
        matchReasons: ['Directory listing'],
      })),
      relatedServices: activeServices.slice(0, 6),
      suggestedCategories: allCategories,
    };
  }

  const { normalizedQuery, extractedTerms, expandedTerms } = extractSearchTerms(trimmed);
  const corePhrase = extractedTerms.join(' ');

  const scoredResults: SearchMatchResult[] = [];

  for (const item of filteredPool) {
    const { service, department, office, requirements } = item;
    const nameNorm = normalizeText(service.name);
    const descNorm = normalizeText(service.description);
    const catNorm = normalizeText(service.category);
    const deptNorm = normalizeText(department?.name || '');
    const officeNorm = normalizeText(
      `${office?.name || ''} ${office?.building || ''} ${office?.counter || ''} ${office?.desk || ''}`
    );
    const keywordsNorm = service.keywords.map((k) => normalizeText(k));
    const reqNorm = normalizeText(requirements.map((r) => r.name).join(' '));

    let score = 0;
    const matchReasons: string[] = [];

    // 1. Direct phrase match on service name or keywords
    if (corePhrase.length >= 2) {
      if (nameNorm.includes(corePhrase)) {
        score += 90;
        matchReasons.push(`Matches service "${service.name}"`);
      } else if (keywordsNorm.some((k) => k.includes(corePhrase) || corePhrase.includes(k))) {
        score += 80;
        matchReasons.push('Direct keyword match');
      }
    }

    // 2. Full normalized query substring match
    if (normalizedQuery.length >= 3 && nameNorm.includes(normalizedQuery)) {
      score += 60;
    }

    // 3. Token-by-token evaluation for extracted user terms
    const targetWords = `${nameNorm} ${keywordsNorm.join(' ')} ${catNorm} ${deptNorm}`.split(/\s+/);

    let matchedCoreTokens = 0;
    for (const token of extractedTerms) {
      if (token.length < 2) continue;

      let tokenMatched = false;
      if (nameNorm.split(/\s+/).some((w) => w === token || w.startsWith(token))) {
        score += 45;
        tokenMatched = true;
        if (!matchReasons.includes('Service title match')) {
          matchReasons.push('Service title match');
        }
      } else if (keywordsNorm.some((k) => k === token || k.includes(token))) {
        score += 38;
        tokenMatched = true;
        if (!matchReasons.includes('Service keyword match')) {
          matchReasons.push('Service keyword match');
        }
      } else if (catNorm.includes(token)) {
        score += 28;
        tokenMatched = true;
        if (!matchReasons.includes(`Category: ${service.category}`)) {
          matchReasons.push(`Category: ${service.category}`);
        }
      } else if (deptNorm.includes(token)) {
        score += 24;
        tokenMatched = true;
        if (!matchReasons.includes('Department match')) {
          matchReasons.push('Department match');
        }
      } else if (officeNorm.includes(token)) {
        score += 20;
        tokenMatched = true;
        if (!matchReasons.includes('Office / counter match')) {
          matchReasons.push('Office / counter match');
        }
      } else if (descNorm.includes(token) || reqNorm.includes(token)) {
        score += 15;
        tokenMatched = true;
        if (!matchReasons.includes('Procedure / requirement match')) {
          matchReasons.push('Procedure / requirement match');
        }
      } else if (targetWords.some((w) => isFuzzyTokenMatch(token, w))) {
        score += 22;
        tokenMatched = true;
        if (!matchReasons.includes('Closest spelling match')) {
          matchReasons.push('Closest spelling match');
        }
      }

      if (tokenMatched) {
        matchedCoreTokens++;
      }
    }

    // Bonus if all extracted core terms matched
    if (extractedTerms.length > 1 && matchedCoreTokens === extractedTerms.length) {
      score += 50;
    }

    // 4. Check expanded synonyms if score is still 0 or low
    if (score < 30) {
      for (const expTerm of expandedTerms) {
        if (extractedTerms.includes(expTerm)) continue;
        if (
          nameNorm.includes(expTerm) ||
          keywordsNorm.some((k) => k.includes(expTerm)) ||
          catNorm.includes(expTerm)
        ) {
          score += 18;
          if (!matchReasons.includes('Related topic match')) {
            matchReasons.push('Related topic match');
          }
        }
      }
    }

    if (score > 0) {
      scoredResults.push({
        enriched: item,
        score,
        matchReasons: matchReasons.length > 0 ? matchReasons : ['Relevant service'],
      });
    }
  }

  scoredResults.sort((a, b) => b.score - a.score);

  // Related fallback services so the citizen never sees a dead end
  const matchedIds = new Set(scoredResults.map((r) => r.enriched.service.id));
  const relatedServices = activeServices
    .filter((s) => !matchedIds.has(s.service.id))
    .slice(0, 6);

  return {
    query: rawQuery,
    normalizedQuery,
    extractedTerms,
    exactMatches: scoredResults,
    relatedServices: relatedServices.length > 0 ? relatedServices : activeServices.slice(0, 6),
    suggestedCategories: allCategories,
  };
}

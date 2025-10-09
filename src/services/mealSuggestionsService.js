import { getMeals } from './mealsService';
import { searchExternalMeals, getExternalMealDetails } from './externalMealsService';

// Debounce utility
let searchTimeout = null;

// Get meal title suggestions combining local and external sources
export async function getMealSuggestions(query, options = {}) {
  const {
    includeExternal = true,
    maxResults = 10,
    maxExternalResults = 5
  } = options;

  console.log('getMealSuggestions called with:', query, options);

  if (!query || query.length < 2) {
    console.log('Query too short, returning empty array');
    return [];
  }

  try {
    // Always get local meals first (fast)
    console.log('Getting local meal suggestions...');
    const localMeals = await getLocalMealSuggestions(query, maxResults);
    console.log('Local meals found:', localMeals.length);

    // If we have enough local results or external search is disabled, return local only
    if (!includeExternal || localMeals.length >= maxResults) {
      return localMeals.slice(0, maxResults);
    }

    // Get external suggestions to fill the gap
    const remainingSlots = maxResults - localMeals.length;
    const externalLimit = Math.min(remainingSlots, maxExternalResults);

    const externalMeals = await searchExternalMeals(query, externalLimit);

    // Merge results, prioritizing local meals
    const mergedResults = [
      ...localMeals,
      ...filterDuplicateExternalMeals(externalMeals, localMeals)
    ];

    return mergedResults.slice(0, maxResults);

  } catch (error) {
    console.error('Error getting meal suggestions:', error);
    // Fallback to local only
    return await getLocalMealSuggestions(query, maxResults);
  }
}

// Get suggestions from local meals only
export async function getLocalMealSuggestions(query, limit = 10) {
  try {
    const meals = await getMeals();
    const queryLower = query.toLowerCase();

    // Filter and score local meals
    const matches = meals
      .filter(meal => meal.title.toLowerCase().includes(queryLower))
      .map(meal => ({
        ...meal,
        isLocal: true,
        matchScore: calculateMatchScore(meal.title, query)
      }))
      .sort((a, b) => {
        // Sort by match score (exact matches first), then by eaten count
        if (a.matchScore !== b.matchScore) {
          return b.matchScore - a.matchScore;
        }
        return (b.eatenCount || 0) - (a.eatenCount || 0);
      });

    return matches.slice(0, limit);
  } catch (error) {
    console.error('Error getting local meal suggestions:', error);
    return [];
  }
}

// Calculate match score for sorting
function calculateMatchScore(title, query) {
  const titleLower = title.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match gets highest score
  if (titleLower === queryLower) return 100;

  // Starts with query gets high score
  if (titleLower.startsWith(queryLower)) return 80;

  // Contains query as whole word gets medium score
  const words = titleLower.split(' ');
  if (words.some(word => word.startsWith(queryLower))) return 60;

  // Contains query anywhere gets low score
  if (titleLower.includes(queryLower)) return 40;

  return 0;
}

// Filter out external meals that are too similar to local ones
function filterDuplicateExternalMeals(externalMeals, localMeals) {
  const localTitles = localMeals.map(meal => meal.title.toLowerCase());

  return externalMeals.filter(externalMeal => {
    const externalTitle = externalMeal.title.toLowerCase();

    // Check for exact matches or very similar titles
    return !localTitles.some(localTitle => {
      return similarity(localTitle, externalTitle) > 0.8;
    });
  });
}

// Simple string similarity calculation (Jaro-Winkler style)
function similarity(s1, s2) {
  if (s1 === s2) return 1;

  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0 || len2 === 0) return 0;

  const maxDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  let matches = 0;
  let transpositions = 0;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - maxDistance);
    const end = Math.min(i + maxDistance + 1, len2);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  return jaro;
}

// Debounced search function for UI components
export function createDebouncedMealSearch(callback, delay = 300) {
  return (query, options) => {
    console.log('Debounced search triggered for:', query);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      console.log('Debounced search executing for:', query);
      const results = await getMealSuggestions(query, options);
      console.log('Debounced search results:', results.length);
      callback(results);
    }, delay);
  };
}

// Convert external meal selection to saveable meal format
export async function convertExternalMealToLocal(externalMeal) {
  if (!externalMeal.isExternal) {
    return externalMeal; // Already a local meal
  }

  try {
    // Get full details if we only have basic info
    const fullDetails = externalMeal.externalId
      ? await getExternalMealDetails(externalMeal.externalId)
      : externalMeal;

    // Convert to local meal format
    return {
      title: fullDetails.title,
      description: fullDetails.description || '',
      image: fullDetails.image || '',
      rating: fullDetails.rating || 0,
      freezerPortions: 0,
      versions: [],
      // Store external metadata for reference
      externalSource: 'spoonacular',
      externalId: fullDetails.externalId,
      readyInMinutes: fullDetails.readyInMinutes,
      servings: fullDetails.servings,
      cuisines: fullDetails.cuisines,
      dishTypes: fullDetails.dishTypes
    };
  } catch (error) {
    console.error('Error converting external meal:', error);
    // Fallback to basic conversion
    return {
      title: externalMeal.title,
      description: externalMeal.description || '',
      image: externalMeal.image || '',
      rating: externalMeal.rating || 0,
      freezerPortions: 0,
      versions: []
    };
  }
}
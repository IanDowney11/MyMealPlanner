// External Meals Service - Spoonacular API Integration
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Get API key from environment variables
const getApiKey = () => {
  return import.meta.env.VITE_SPOONACULAR_API_KEY || '';
};

// Cache management
const getCacheKey = (query) => `spoonacular_search_${query.toLowerCase()}`;

const getCachedResults = (query) => {
  try {
    const cacheKey = getCacheKey(query);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

const setCachedResults = (query, data) => {
  try {
    const cacheKey = getCacheKey(query);
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

// Transform Spoonacular recipe to our meal format
const transformSpoonacularRecipe = (recipe) => ({
  id: `spoonacular_${recipe.id}`,
  title: recipe.title,
  description: recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '',
  image: recipe.image || null,
  rating: recipe.spoonacularScore ? Math.round(recipe.spoonacularScore / 20) : 0, // Convert 0-100 to 0-5
  isExternal: true,
  source: 'spoonacular',
  externalId: recipe.id,
  readyInMinutes: recipe.readyInMinutes,
  servings: recipe.servings,
  cuisines: recipe.cuisines || [],
  dishTypes: recipe.dishTypes || []
});

// Search Spoonacular API
export async function searchExternalMeals(query, limit = 10) {
  if (!query || query.length < 2) return [];

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('Spoonacular API key not configured');
    return [];
  }

  // Check cache first
  const cachedResults = getCachedResults(query);
  if (cachedResults) {
    console.log('Using cached results for:', query);
    return cachedResults.slice(0, limit);
  }

  try {
    const searchParams = new URLSearchParams({
      apiKey,
      query,
      number: Math.min(limit, 25), // Spoonacular max is 100, but we'll use 25 for performance
      addRecipeInformation: 'true',
      fillIngredients: 'false'
    });

    console.log('Searching Spoonacular for:', query, 'with params:', searchParams.toString());
    const response = await fetch(`${SPOONACULAR_BASE_URL}/complexSearch?${searchParams}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Spoonacular API: Invalid API key');
      } else if (response.status === 402) {
        console.error('Spoonacular API: Quota exceeded');
      } else {
        console.error('Spoonacular API error:', response.status, response.statusText);
      }
      return [];
    }

    const data = await response.json();
    console.log('Spoonacular response:', data);
    const transformedResults = data.results.map(transformSpoonacularRecipe);

    // Cache the results
    setCachedResults(query, transformedResults);

    console.log(`Found ${transformedResults.length} external meals for "${query}"`);
    console.log('Transformed results:', transformedResults);
    return transformedResults.slice(0, limit);

  } catch (error) {
    console.error('Error searching external meals:', error);
    return [];
  }
}

// Get detailed recipe information (for when user selects an external meal)
export async function getExternalMealDetails(externalId) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/${externalId}/information?apiKey=${apiKey}`
    );

    if (!response.ok) return null;

    const recipe = await response.json();
    return transformSpoonacularRecipe(recipe);

  } catch (error) {
    console.error('Error fetching external meal details:', error);
    return null;
  }
}

// Clear all cached results (utility function)
export function clearExternalMealsCache() {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('spoonacular_search_'));
    cacheKeys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${cacheKeys.length} cached external meal searches`);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Get cache statistics (for debugging/admin)
export function getCacheStats() {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('spoonacular_search_'));

    let totalSize = 0;
    let validEntries = 0;
    let expiredEntries = 0;

    cacheKeys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
        try {
          const { timestamp } = JSON.parse(item);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;
          if (isExpired) {
            expiredEntries++;
          } else {
            validEntries++;
          }
        } catch {
          expiredEntries++;
        }
      }
    });

    return {
      totalEntries: cacheKeys.length,
      validEntries,
      expiredEntries,
      totalSizeKB: Math.round(totalSize / 1024)
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
}
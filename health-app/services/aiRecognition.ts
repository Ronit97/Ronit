import { AIRecognitionResult, FoodItem } from '../types';
import { FOOD_DATABASE } from '../data/foods';

// Simulated AI food recognition with realistic Indian meal patterns.
// In production this would call a TensorFlow/EfficientNet inference endpoint.

interface MealPattern {
  keywords: string[];
  foods: string[]; // food IDs
  confidence: number;
}

const MEAL_PATTERNS: MealPattern[] = [
  {
    keywords: ['dal', 'rice', 'plate', 'thali', 'lunch'],
    foods: ['f001', 'f002', 'f020'],
    confidence: 0.88,
  },
  {
    keywords: ['roti', 'chapati', 'sabji', 'dinner'],
    foods: ['f003', 'f007', 'f020'],
    confidence: 0.84,
  },
  {
    keywords: ['dosa', 'idli', 'south', 'breakfast'],
    foods: ['f008', 'f010'],
    confidence: 0.91,
  },
  {
    keywords: ['biryani', 'chicken', 'rice'],
    foods: ['f017'],
    confidence: 0.87,
  },
  {
    keywords: ['oats', 'morning', 'bowl'],
    foods: ['f026', 'f027'],
    confidence: 0.93,
  },
  {
    keywords: ['eggs', 'bhurji', 'omelette', 'breakfast'],
    foods: ['f018'],
    confidence: 0.89,
  },
  {
    keywords: ['paneer', 'palak', 'spinach'],
    foods: ['f005'],
    confidence: 0.86,
  },
  {
    keywords: ['chole', 'chana', 'chickpea'],
    foods: ['f013', 'f003'],
    confidence: 0.85,
  },
  {
    keywords: ['poha', 'breakfast', 'flattened rice'],
    foods: ['f015'],
    confidence: 0.90,
  },
  {
    keywords: ['rajma', 'kidney', 'beans'],
    foods: ['f014', 'f002'],
    confidence: 0.83,
  },
];

const DEFAULT_RECOGNITION: string[] = ['f001', 'f002', 'f003'];

function getFoodsByIds(ids: string[]): FoodItem[] {
  return ids
    .map((id) => FOOD_DATABASE.find((f) => f.id === id))
    .filter((f): f is FoodItem => !!f);
}

export const recognizeMealFromPhoto = async (
  photoUri: string
): Promise<AIRecognitionResult> => {
  // Simulate network latency of a real ML inference call
  await new Promise((resolve) => setTimeout(resolve, 1800));

  // In production: POST photoUri to FastAPI endpoint → TensorFlow model
  // For MVP: use filename/uri heuristics + random meal pattern selection
  const uriLower = photoUri.toLowerCase();
  const matchedPattern =
    MEAL_PATTERNS.find((p) =>
      p.keywords.some((kw) => uriLower.includes(kw))
    ) || MEAL_PATTERNS[Math.floor(Math.random() * MEAL_PATTERNS.length)];

  const foods = getFoodsByIds(matchedPattern.foods);
  const baseConfidence = matchedPattern.confidence;

  return {
    confidence: baseConfidence,
    processingTime: 1800,
    foods: foods.map((food, i) => ({
      food,
      confidence: baseConfidence - i * 0.04,
      estimatedQuantity: 1.0,
    })),
  };
};

export const recognizeMealFromText = (text: string): AIRecognitionResult => {
  const textLower = text.toLowerCase();
  const matched = MEAL_PATTERNS.filter((p) =>
    p.keywords.some((kw) => textLower.includes(kw))
  );

  if (matched.length === 0) {
    const foods = getFoodsByIds(DEFAULT_RECOGNITION);
    return {
      confidence: 0.6,
      processingTime: 50,
      foods: foods.map((food) => ({
        food,
        confidence: 0.6,
        estimatedQuantity: 1.0,
      })),
    };
  }

  const best = matched[0];
  const foods = getFoodsByIds(best.foods);
  return {
    confidence: best.confidence,
    processingTime: 50,
    foods: foods.map((food, i) => ({
      food,
      confidence: best.confidence - i * 0.03,
      estimatedQuantity: 1.0,
    })),
  };
};

export const getQuickFoodSuggestions = (memberId: string): FoodItem[] => {
  const memberSuggestions: Record<string, string[]> = {
    ajay: ['f001', 'f003', 'f022', 'f021', 'f036'],
    ronit: ['f029', 'f032', 'f035', 'f004', 'f030'],
    seema: ['f005', 'f001', 'f028', 'f026', 'f036'],
    cheshta: ['f029', 'f032', 'f030', 'f004', 'f027'],
    shivi: ['f026', 'f029', 'f028', 'f037', 'f001'],
  };
  const ids = memberSuggestions[memberId] || DEFAULT_RECOGNITION;
  return getFoodsByIds(ids);
};

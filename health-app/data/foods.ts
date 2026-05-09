import { FoodItem } from '../types';

export const FOOD_DATABASE: FoodItem[] = [
  // ── Indian staples ──────────────────────────────────────────────────────────
  {
    id: 'f001', name: 'Dal (Toor/Arhar)', nameHindi: 'तूर दाल', emoji: '🫘',
    servingSize: 150, servingUnit: '1 bowl (150g)', calories: 150, isIndian: true,
    category: 'Indian Lentils',
    macros: { protein: 10, carbs: 25, fat: 1.5, fiber: 6 },
  },
  {
    id: 'f002', name: 'Steamed Rice', nameHindi: 'चावल', emoji: '🍚',
    servingSize: 150, servingUnit: '1 cup cooked (150g)', calories: 195, isIndian: true,
    category: 'Indian Grains',
    macros: { protein: 4, carbs: 43, fat: 0.5, fiber: 0.6 },
  },
  {
    id: 'f003', name: 'Chapati / Roti', nameHindi: 'चपाती', emoji: '🫓',
    servingSize: 40, servingUnit: '1 chapati (40g)', calories: 104, isIndian: true,
    category: 'Indian Breads',
    macros: { protein: 3.5, carbs: 20, fat: 1.5, fiber: 2 },
  },
  {
    id: 'f004', name: 'Chicken Curry', nameHindi: 'चिकन करी', emoji: '🍗',
    servingSize: 200, servingUnit: '1 serving (200g)', calories: 280, isIndian: true,
    category: 'Indian Non-Veg',
    macros: { protein: 28, carbs: 8, fat: 15, fiber: 1 },
  },
  {
    id: 'f005', name: 'Palak Paneer', nameHindi: 'पालक पनीर', emoji: '🥬',
    servingSize: 200, servingUnit: '1 serving (200g)', calories: 260, isIndian: true,
    category: 'Indian Veg',
    macros: { protein: 14, carbs: 12, fat: 18, fiber: 3 },
  },
  {
    id: 'f006', name: 'Masoor Dal', nameHindi: 'मसूर दाल', emoji: '🫘',
    servingSize: 150, servingUnit: '1 bowl (150g)', calories: 140, isIndian: true,
    category: 'Indian Lentils',
    macros: { protein: 11, carbs: 22, fat: 1, fiber: 8 },
  },
  {
    id: 'f007', name: 'Aloo Sabji', nameHindi: 'आलू सब्जी', emoji: '🥔',
    servingSize: 150, servingUnit: '1 serving (150g)', calories: 175, isIndian: true,
    category: 'Indian Veg',
    macros: { protein: 3, carbs: 30, fat: 6, fiber: 3 },
  },
  {
    id: 'f008', name: 'Dosa (Plain)', nameHindi: 'डोसा', emoji: '🫓',
    servingSize: 100, servingUnit: '1 dosa (100g)', calories: 160, isIndian: true,
    category: 'South Indian',
    macros: { protein: 4, carbs: 32, fat: 2.5, fiber: 1 },
  },
  {
    id: 'f009', name: 'Idli', nameHindi: 'इडली', emoji: '⚪',
    servingSize: 80, servingUnit: '2 idlis (80g)', calories: 80, isIndian: true,
    category: 'South Indian',
    macros: { protein: 3, carbs: 16, fat: 0.5, fiber: 1 },
  },
  {
    id: 'f010', name: 'Sambar', nameHindi: 'सांभर', emoji: '🍲',
    servingSize: 150, servingUnit: '1 bowl (150g)', calories: 95, isIndian: true,
    category: 'South Indian',
    macros: { protein: 5, carbs: 16, fat: 2, fiber: 4 },
  },
  {
    id: 'f011', name: 'Paneer (Cottage Cheese)', nameHindi: 'पनीर', emoji: '🧀',
    servingSize: 100, servingUnit: '100g', calories: 265, isIndian: true,
    category: 'Indian Dairy',
    macros: { protein: 18, carbs: 3, fat: 20, fiber: 0 },
  },
  {
    id: 'f012', name: 'Paratha (Plain)', nameHindi: 'पराठा', emoji: '🫓',
    servingSize: 80, servingUnit: '1 paratha (80g)', calories: 230, isIndian: true,
    category: 'Indian Breads',
    macros: { protein: 5, carbs: 32, fat: 9, fiber: 2 },
  },
  {
    id: 'f013', name: 'Chole (Chana Masala)', nameHindi: 'छोले', emoji: '🫘',
    servingSize: 200, servingUnit: '1 serving (200g)', calories: 210, isIndian: true,
    category: 'Indian Veg',
    macros: { protein: 11, carbs: 33, fat: 5, fiber: 9 },
  },
  {
    id: 'f014', name: 'Rajma (Kidney Bean Curry)', nameHindi: 'राजमा', emoji: '🫘',
    servingSize: 200, servingUnit: '1 bowl (200g)', calories: 200, isIndian: true,
    category: 'Indian Veg',
    macros: { protein: 12, carbs: 32, fat: 3, fiber: 8 },
  },
  {
    id: 'f015', name: 'Poha', nameHindi: 'पोहा', emoji: '🍱',
    servingSize: 150, servingUnit: '1 plate (150g)', calories: 200, isIndian: true,
    category: 'Indian Breakfast',
    macros: { protein: 4, carbs: 38, fat: 5, fiber: 2 },
  },
  {
    id: 'f016', name: 'Upma', nameHindi: 'उपमा', emoji: '🍱',
    servingSize: 150, servingUnit: '1 plate (150g)', calories: 190, isIndian: true,
    category: 'Indian Breakfast',
    macros: { protein: 5, carbs: 30, fat: 7, fiber: 3 },
  },
  {
    id: 'f017', name: 'Chicken Biryani', nameHindi: 'चिकन बिरयानी', emoji: '🍛',
    servingSize: 300, servingUnit: '1 plate (300g)', calories: 480, isIndian: true,
    category: 'Indian Non-Veg',
    macros: { protein: 28, carbs: 58, fat: 14, fiber: 2 },
  },
  {
    id: 'f018', name: 'Egg Bhurji', nameHindi: 'अंडा भुर्जी', emoji: '🍳',
    servingSize: 150, servingUnit: '2 eggs scrambled (150g)', calories: 210, isIndian: true,
    category: 'Indian Breakfast',
    macros: { protein: 14, carbs: 4, fat: 16, fiber: 1 },
  },
  {
    id: 'f019', name: 'Lassi (Sweet)', nameHindi: 'लस्सी', emoji: '🥛',
    servingSize: 250, servingUnit: '1 glass (250ml)', calories: 175, isIndian: true,
    category: 'Indian Drinks',
    macros: { protein: 7, carbs: 28, fat: 4, fiber: 0 },
  },
  {
    id: 'f020', name: 'Raita (Plain)', nameHindi: 'रायता', emoji: '🥄',
    servingSize: 100, servingUnit: '1 small bowl (100g)', calories: 60, isIndian: true,
    category: 'Indian Sides',
    macros: { protein: 3.5, carbs: 7, fat: 1.5, fiber: 0.5 },
  },
  {
    id: 'f021', name: 'Moong Dal Khichdi', nameHindi: 'मूंग दाल खिचड़ी', emoji: '🍲',
    servingSize: 200, servingUnit: '1 bowl (200g)', calories: 220, isIndian: true,
    category: 'Indian Comfort',
    macros: { protein: 9, carbs: 40, fat: 4, fiber: 5 },
  },
  {
    id: 'f022', name: 'Tandoori Chicken', nameHindi: 'तंदूरी चिकन', emoji: '🍗',
    servingSize: 200, servingUnit: '2 pieces (200g)', calories: 220, isIndian: true,
    category: 'Indian Non-Veg',
    macros: { protein: 36, carbs: 6, fat: 7, fiber: 1 },
  },
  {
    id: 'f023', name: 'Bhindi Masala', nameHindi: 'भिंडी मसाला', emoji: '🥒',
    servingSize: 150, servingUnit: '1 serving (150g)', calories: 110, isIndian: true,
    category: 'Indian Veg',
    macros: { protein: 3, carbs: 12, fat: 6, fiber: 4 },
  },
  {
    id: 'f024', name: 'Methi Sabji', nameHindi: 'मेथी सब्जी', emoji: '🌿',
    servingSize: 150, servingUnit: '1 serving (150g)', calories: 95, isIndian: true,
    category: 'Indian Veg',
    macros: { protein: 4, carbs: 10, fat: 5, fiber: 5 },
  },

  // ── International / Global ──────────────────────────────────────────────────
  {
    id: 'f025', name: 'Boiled Eggs', emoji: '🥚',
    servingSize: 50, servingUnit: '1 egg (50g)', calories: 78, isIndian: false,
    category: 'Proteins',
    macros: { protein: 6, carbs: 0.5, fat: 5.5, fiber: 0 },
  },
  {
    id: 'f026', name: 'Oats (Cooked)', emoji: '🥣',
    servingSize: 150, servingUnit: '1 bowl cooked (150g)', calories: 150, isIndian: false,
    category: 'Breakfast',
    macros: { protein: 5, carbs: 27, fat: 2.5, fiber: 4 },
  },
  {
    id: 'f027', name: 'Banana', emoji: '🍌',
    servingSize: 120, servingUnit: '1 medium (120g)', calories: 105, isIndian: false,
    category: 'Fruits',
    macros: { protein: 1.3, carbs: 27, fat: 0.3, fiber: 3 },
  },
  {
    id: 'f028', name: 'Apple', emoji: '🍎',
    servingSize: 182, servingUnit: '1 medium (182g)', calories: 95, isIndian: false,
    category: 'Fruits',
    macros: { protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
  },
  {
    id: 'f029', name: 'Chicken Breast (Grilled)', emoji: '🍗',
    servingSize: 150, servingUnit: '150g', calories: 248, isIndian: false,
    category: 'Proteins',
    macros: { protein: 46, carbs: 0, fat: 5.5, fiber: 0 },
  },
  {
    id: 'f030', name: 'Greek Yogurt', emoji: '🥛',
    servingSize: 170, servingUnit: '1 cup (170g)', calories: 100, isIndian: false,
    category: 'Dairy',
    macros: { protein: 17, carbs: 6, fat: 0.7, fiber: 0 },
  },
  {
    id: 'f031', name: 'Almonds', emoji: '🌰',
    servingSize: 28, servingUnit: '1 handful (28g)', calories: 164, isIndian: false,
    category: 'Nuts & Seeds',
    macros: { protein: 6, carbs: 6, fat: 14, fiber: 3.5 },
  },
  {
    id: 'f032', name: 'Whey Protein Shake', emoji: '💪',
    servingSize: 300, servingUnit: '1 scoop + water (300ml)', calories: 130, isIndian: false,
    category: 'Supplements',
    macros: { protein: 25, carbs: 4, fat: 2, fiber: 0 },
  },
  {
    id: 'f033', name: 'Sweet Potato (Boiled)', emoji: '🍠',
    servingSize: 150, servingUnit: '1 medium (150g)', calories: 129, isIndian: false,
    category: 'Vegetables',
    macros: { protein: 2.3, carbs: 30, fat: 0.2, fiber: 4.7 },
  },
  {
    id: 'f034', name: 'Salmon (Baked)', emoji: '🐟',
    servingSize: 150, servingUnit: '150g fillet', calories: 280, isIndian: false,
    category: 'Proteins',
    macros: { protein: 39, carbs: 0, fat: 13, fiber: 0 },
  },
  {
    id: 'f035', name: 'Brown Rice (Cooked)', emoji: '🍚',
    servingSize: 150, servingUnit: '1 cup cooked (150g)', calories: 216, isIndian: false,
    category: 'Grains',
    macros: { protein: 5, carbs: 45, fat: 1.8, fiber: 3.5 },
  },
  {
    id: 'f036', name: 'Broccoli (Steamed)', emoji: '🥦',
    servingSize: 150, servingUnit: '1 cup (150g)', calories: 52, isIndian: false,
    category: 'Vegetables',
    macros: { protein: 4.5, carbs: 10, fat: 0.7, fiber: 5 },
  },
  {
    id: 'f037', name: 'Mixed Salad (No Dressing)', emoji: '🥗',
    servingSize: 200, servingUnit: '1 large bowl (200g)', calories: 50, isIndian: false,
    category: 'Vegetables',
    macros: { protein: 3, carbs: 8, fat: 0.5, fiber: 4 },
  },
  {
    id: 'f038', name: 'Peanut Butter', emoji: '🥜',
    servingSize: 32, servingUnit: '2 tbsp (32g)', calories: 190, isIndian: false,
    category: 'Nuts & Seeds',
    macros: { protein: 8, carbs: 7, fat: 16, fiber: 2 },
  },
  {
    id: 'f039', name: 'Milk (Full Fat)', emoji: '🥛',
    servingSize: 240, servingUnit: '1 cup (240ml)', calories: 150, isIndian: false,
    category: 'Dairy',
    macros: { protein: 8, carbs: 12, fat: 8, fiber: 0 },
  },
  {
    id: 'f040', name: 'Orange', emoji: '🍊',
    servingSize: 130, servingUnit: '1 medium (130g)', calories: 62, isIndian: false,
    category: 'Fruits',
    macros: { protein: 1.2, carbs: 15, fat: 0.2, fiber: 3 },
  },
];

export const searchFoods = (query: string): FoodItem[] => {
  const q = query.toLowerCase().trim();
  if (!q) return FOOD_DATABASE.slice(0, 20);
  return FOOD_DATABASE.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.nameHindi?.includes(q) ||
      f.category.toLowerCase().includes(q)
  ).slice(0, 30);
};

export const getIndianFoods = (): FoodItem[] =>
  FOOD_DATABASE.filter((f) => f.isIndian);

export const getFoodById = (id: string): FoodItem | undefined =>
  FOOD_DATABASE.find((f) => f.id === id);

export const calculateMealMacros = (
  foods: Array<{ food: FoodItem; quantity: number }>
) => {
  return foods.reduce(
    (acc, { food, quantity }) => ({
      calories: acc.calories + food.calories * quantity,
      protein: acc.protein + food.macros.protein * quantity,
      carbs: acc.carbs + food.macros.carbs * quantity,
      fat: acc.fat + food.macros.fat * quantity,
      fiber: acc.fiber + food.macros.fiber * quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
};

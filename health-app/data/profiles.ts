import { FamilyMember } from '../types';

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'ajay',
    name: 'Ajay Agarwal',
    firstName: 'Ajay',
    age: 57,
    gender: 'male',
    height: 172,
    weight: 98,
    targetWeight: 82,
    bloodType: 'B+',
    profileColor: '#FF6B6B',
    profileGradient: ['#FF6B6B', '#FF4757'],
    goals: ['weight_loss', 'longevity', 'cardio_endurance'],
    conditions: ['Obese (BMI 33.1)', 'Mild hypertension risk'],
    dietType: 'omnivore',
    activityLevel: 'light',
    isAdmin: true,
    emoji: '👨',
    bio: 'Family patriarch. Working on losing weight, improving heart health, and building lasting habits for a long, active life.',
    dailyTargets: {
      calories: 1800,
      protein: 148,
      carbs: 180,
      fat: 60,
      steps: 8000,
      water: 2500,
      workoutsPerWeek: 4,
      sleepHours: 7.5,
    },
  },
  {
    id: 'ronit',
    name: 'Ronit Agarwal',
    firstName: 'Ronit',
    age: 29,
    gender: 'male',
    height: 178,
    weight: 73,
    targetWeight: 82,
    bloodType: 'O+',
    profileColor: '#4ECDC4',
    profileGradient: ['#4ECDC4', '#1ABC9C'],
    goals: ['muscle_gain', 'cardio_endurance', 'energy'],
    conditions: [],
    dietType: 'omnivore',
    activityLevel: 'moderate',
    isAdmin: false,
    emoji: '💪',
    bio: 'Building strength, improving endurance, and optimizing energy levels. Loves training and wants a performance edge.',
    dailyTargets: {
      calories: 2800,
      protein: 175,
      carbs: 320,
      fat: 90,
      steps: 10000,
      water: 3000,
      workoutsPerWeek: 5,
      sleepHours: 8,
    },
  },
  {
    id: 'seema',
    name: 'Seema Agarwal',
    firstName: 'Seema',
    age: 55,
    gender: 'female',
    height: 160,
    weight: 65,
    targetWeight: 62,
    bloodType: 'A+',
    profileColor: '#A29BFE',
    profileGradient: ['#A29BFE', '#6C5CE7'],
    goals: ['longevity', 'flexibility', 'daily_functioning'],
    conditions: ['Mild joint stiffness'],
    dietType: 'vegetarian',
    activityLevel: 'light',
    isAdmin: false,
    emoji: '🌸',
    bio: 'Focused on staying mobile, healthy, and energetic well into her golden years. Enjoys yoga and walking.',
    dailyTargets: {
      calories: 1600,
      protein: 95,
      carbs: 200,
      fat: 55,
      steps: 7000,
      water: 2000,
      workoutsPerWeek: 3,
      sleepHours: 7.5,
    },
  },
  {
    id: 'cheshta',
    name: 'Cheshta Agarwal',
    firstName: 'Cheshta',
    age: 25,
    gender: 'female',
    height: 165,
    weight: 57,
    targetWeight: 62,
    bloodType: 'B+',
    profileColor: '#FFD93D',
    profileGradient: ['#FFD93D', '#FFC107'],
    goals: ['muscle_gain', 'cardio_endurance', 'energy'],
    conditions: [],
    dietType: 'omnivore',
    activityLevel: 'moderate',
    isAdmin: false,
    emoji: '⚡',
    bio: 'Athletic and driven. Wants to build lean muscle, improve stamina, and have the energy to dominate every day.',
    dailyTargets: {
      calories: 2200,
      protein: 130,
      carbs: 255,
      fat: 73,
      steps: 10000,
      water: 2500,
      workoutsPerWeek: 5,
      sleepHours: 8,
    },
  },
  {
    id: 'shivi',
    name: 'Shivi Rathi',
    firstName: 'Shivi',
    age: 29,
    gender: 'female',
    height: 163,
    weight: 70,
    targetWeight: 60,
    bloodType: 'O+',
    profileColor: '#FF9F43',
    profileGradient: ['#FF9F43', '#F39C12'],
    goals: ['weight_loss', 'cardio_endurance', 'energy'],
    conditions: [],
    dietType: 'omnivore',
    activityLevel: 'moderate',
    isAdmin: false,
    emoji: '🌟',
    bio: 'Goal-oriented and motivated. Focused on sustainable fat loss, building a fitness habit, and feeling her absolute best.',
    dailyTargets: {
      calories: 1600,
      protein: 115,
      carbs: 175,
      fat: 55,
      steps: 10000,
      water: 2500,
      workoutsPerWeek: 4,
      sleepHours: 8,
    },
  },
];

export const getMemberById = (id: string): FamilyMember | undefined =>
  FAMILY_MEMBERS.find((m) => m.id === id);

export const calculateBMI = (weight: number, height: number): number =>
  parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));

export const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#4ECDC4' };
  if (bmi < 25) return { label: 'Normal', color: '#00D4AA' };
  if (bmi < 30) return { label: 'Overweight', color: '#FFD93D' };
  return { label: 'Obese', color: '#FF6B6B' };
};

export const calculateTDEE = (member: FamilyMember): number => {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const bmr =
    member.gender === 'male'
      ? 88.362 + 13.397 * member.weight + 4.799 * member.height - 5.677 * member.age
      : 447.593 + 9.247 * member.weight + 3.098 * member.height - 4.33 * member.age;
  return Math.round(bmr * activityMultipliers[member.activityLevel]);
};

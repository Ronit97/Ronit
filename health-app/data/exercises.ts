import { Exercise } from '../types';

export const EXERCISE_LIBRARY: Exercise[] = [
  // ── Strength ─────────────────────────────────────────────────────────────
  {
    id: 'e001', name: 'Barbell Bench Press', emoji: '🏋️', category: 'strength',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: ['Barbell', 'Bench'], difficulty: 'intermediate',
    description: 'Compound upper-body push movement. Lie on bench, lower bar to chest, press up.',
    caloriesPerMinute: 6, isCompound: true,
  },
  {
    id: 'e002', name: 'Squat (Barbell)', emoji: '🦵', category: 'strength',
    muscleGroups: ['Quads', 'Glutes', 'Hamstrings', 'Core'],
    equipment: ['Barbell', 'Rack'], difficulty: 'intermediate',
    description: 'King of leg exercises. Bar on upper back, squat to parallel, drive up through heels.',
    caloriesPerMinute: 8, isCompound: true,
  },
  {
    id: 'e003', name: 'Deadlift', emoji: '🏋️', category: 'strength',
    muscleGroups: ['Hamstrings', 'Glutes', 'Back', 'Traps'],
    equipment: ['Barbell'], difficulty: 'intermediate',
    description: 'Full-body strength movement. Hinge at hips, grip bar, drive hips forward to stand.',
    caloriesPerMinute: 8, isCompound: true,
  },
  {
    id: 'e004', name: 'Pull-Up / Chin-Up', emoji: '💪', category: 'strength',
    muscleGroups: ['Lats', 'Biceps', 'Rear Delts'],
    equipment: ['Pull-up Bar'], difficulty: 'intermediate',
    description: 'Dead hang, pull chest to bar. Chin-up (supinated grip) emphasises biceps.',
    caloriesPerMinute: 7, isCompound: true,
  },
  {
    id: 'e005', name: 'Overhead Press (OHP)', emoji: '🙌', category: 'strength',
    muscleGroups: ['Shoulders', 'Triceps', 'Traps'],
    equipment: ['Barbell'], difficulty: 'intermediate',
    description: 'Press barbell from shoulder level to lockout overhead.',
    caloriesPerMinute: 6, isCompound: true,
  },
  {
    id: 'e006', name: 'Dumbbell Row', emoji: '💪', category: 'strength',
    muscleGroups: ['Lats', 'Rhomboids', 'Biceps'],
    equipment: ['Dumbbell', 'Bench'], difficulty: 'beginner',
    description: 'One arm on bench, row dumbbell to hip keeping back flat.',
    caloriesPerMinute: 5, isCompound: false,
  },
  {
    id: 'e007', name: 'Push-Up', emoji: '🤸', category: 'strength',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: ['Bodyweight'], difficulty: 'beginner',
    description: 'Classic bodyweight push. Keep body rigid, lower chest to floor, press up.',
    caloriesPerMinute: 5, isCompound: true,
  },
  {
    id: 'e008', name: 'Bodyweight Squat', emoji: '🦵', category: 'strength',
    muscleGroups: ['Quads', 'Glutes', 'Hamstrings'],
    equipment: ['Bodyweight'], difficulty: 'beginner',
    description: 'Feet shoulder-width, squat to parallel, maintain upright torso.',
    caloriesPerMinute: 5, isCompound: true,
  },
  {
    id: 'e009', name: 'Lunges', emoji: '🚶', category: 'strength',
    muscleGroups: ['Quads', 'Glutes', 'Hamstrings'],
    equipment: ['Bodyweight'], difficulty: 'beginner',
    description: 'Step forward, lower back knee towards floor, alternate legs.',
    caloriesPerMinute: 5, isCompound: true,
  },
  {
    id: 'e010', name: 'Plank', emoji: '🤸', category: 'strength',
    muscleGroups: ['Core', 'Shoulders', 'Glutes'],
    equipment: ['Bodyweight'], difficulty: 'beginner',
    description: 'Hold forearm/straight-arm plank position with neutral spine.',
    caloriesPerMinute: 3, isCompound: false,
  },
  {
    id: 'e011', name: 'Dumbbell Curl', emoji: '💪', category: 'strength',
    muscleGroups: ['Biceps'],
    equipment: ['Dumbbell'], difficulty: 'beginner',
    description: 'Supinate wrist, curl dumbbell from hip to shoulder, controlled negative.',
    caloriesPerMinute: 4, isCompound: false,
  },
  {
    id: 'e012', name: 'Tricep Dip', emoji: '💪', category: 'strength',
    muscleGroups: ['Triceps', 'Chest', 'Shoulders'],
    equipment: ['Parallel Bars', 'Bench'], difficulty: 'beginner',
    description: 'Lower body between bars by bending elbows, press back up.',
    caloriesPerMinute: 5, isCompound: false,
  },
  {
    id: 'e013', name: 'Romanian Deadlift (RDL)', emoji: '🏋️', category: 'strength',
    muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back'],
    equipment: ['Barbell', 'Dumbbell'], difficulty: 'intermediate',
    description: 'Hinge at hips keeping back straight, feel hamstring stretch, drive hips forward.',
    caloriesPerMinute: 6, isCompound: true,
  },
  {
    id: 'e014', name: 'Lat Pulldown', emoji: '🏋️', category: 'strength',
    muscleGroups: ['Lats', 'Biceps', 'Rear Delts'],
    equipment: ['Cable Machine'], difficulty: 'beginner',
    description: 'Pull bar to upper chest, retract shoulder blades, controlled release.',
    caloriesPerMinute: 5, isCompound: true,
  },
  {
    id: 'e015', name: 'Hip Thrust', emoji: '🦵', category: 'strength',
    muscleGroups: ['Glutes', 'Hamstrings'],
    equipment: ['Barbell', 'Bench'], difficulty: 'intermediate',
    description: 'Upper back on bench, bar across hips, thrust hips to lockout.',
    caloriesPerMinute: 5, isCompound: false,
  },

  // ── Cardio ─────────────────────────────────────────────────────────────────
  {
    id: 'e016', name: 'Running (Outdoor)', emoji: '🏃', category: 'cardio',
    muscleGroups: ['Full Body'],
    equipment: ['Running Shoes'], difficulty: 'beginner',
    description: 'Steady-state outdoor run. Maintain conversational pace for aerobic base.',
    caloriesPerMinute: 10, isCompound: true,
  },
  {
    id: 'e017', name: 'Treadmill Walk / Run', emoji: '🚶', category: 'cardio',
    muscleGroups: ['Full Body'],
    equipment: ['Treadmill'], difficulty: 'beginner',
    description: 'Controlled speed and incline training indoors.',
    caloriesPerMinute: 8, isCompound: true,
  },
  {
    id: 'e018', name: 'Cycling (Stationary)', emoji: '🚴', category: 'cardio',
    muscleGroups: ['Quads', 'Calves', 'Glutes'],
    equipment: ['Stationary Bike'], difficulty: 'beginner',
    description: 'Low-impact cardio. Adjust resistance for interval or steady state.',
    caloriesPerMinute: 9, isCompound: true,
  },
  {
    id: 'e019', name: 'Jump Rope', emoji: '⏭️', category: 'cardio',
    muscleGroups: ['Calves', 'Shoulders', 'Core'],
    equipment: ['Jump Rope'], difficulty: 'beginner',
    description: 'Excellent cardio and coordination. Start slow, build rhythm.',
    caloriesPerMinute: 12, isCompound: true,
  },
  {
    id: 'e020', name: 'Swimming Laps', emoji: '🏊', category: 'cardio',
    muscleGroups: ['Full Body'],
    equipment: ['Pool'], difficulty: 'beginner',
    description: 'Full-body, zero-impact cardio. Mix strokes for complete conditioning.',
    caloriesPerMinute: 10, isCompound: true,
  },
  {
    id: 'e021', name: 'Brisk Walking', emoji: '🚶', category: 'cardio',
    muscleGroups: ['Legs', 'Core'],
    equipment: ['None'], difficulty: 'beginner',
    description: 'Power walk at 5-6 km/h. Ideal low-impact daily activity.',
    caloriesPerMinute: 5, isCompound: false,
  },
  {
    id: 'e022', name: 'Stair Climbing', emoji: '🪜', category: 'cardio',
    muscleGroups: ['Glutes', 'Quads', 'Calves'],
    equipment: ['Stairs', 'StairMaster'], difficulty: 'beginner',
    description: 'Climb stairs for cardio and lower-body strengthening.',
    caloriesPerMinute: 9, isCompound: true,
  },

  // ── HIIT ───────────────────────────────────────────────────────────────────
  {
    id: 'e023', name: 'Burpees', emoji: '🔥', category: 'hiit',
    muscleGroups: ['Full Body'],
    equipment: ['Bodyweight'], difficulty: 'intermediate',
    description: 'Squat thrust + jump. Most calorie-dense bodyweight movement.',
    caloriesPerMinute: 14, isCompound: true,
  },
  {
    id: 'e024', name: 'Mountain Climbers', emoji: '🏔️', category: 'hiit',
    muscleGroups: ['Core', 'Shoulders', 'Hip Flexors'],
    equipment: ['Bodyweight'], difficulty: 'beginner',
    description: 'High plank, drive knees alternately to chest at speed.',
    caloriesPerMinute: 11, isCompound: true,
  },
  {
    id: 'e025', name: 'Jump Squats', emoji: '🦘', category: 'hiit',
    muscleGroups: ['Quads', 'Glutes', 'Calves'],
    equipment: ['Bodyweight'], difficulty: 'beginner',
    description: 'Squat deep, explode up into a jump, land softly and repeat.',
    caloriesPerMinute: 10, isCompound: true,
  },
  {
    id: 'e026', name: 'Box Jumps', emoji: '📦', category: 'hiit',
    muscleGroups: ['Quads', 'Glutes', 'Calves'],
    equipment: ['Plyo Box'], difficulty: 'intermediate',
    description: 'Jump onto box with two feet, stand fully, step down, repeat.',
    caloriesPerMinute: 10, isCompound: true,
  },
  {
    id: 'e027', name: 'Kettlebell Swing', emoji: '🔔', category: 'hiit',
    muscleGroups: ['Glutes', 'Hamstrings', 'Core', 'Shoulders'],
    equipment: ['Kettlebell'], difficulty: 'intermediate',
    description: 'Hike KB between legs, drive hips to swing to shoulder height.',
    caloriesPerMinute: 12, isCompound: true,
  },

  // ── Yoga / Flexibility ─────────────────────────────────────────────────────
  {
    id: 'e028', name: 'Sun Salutation (Surya Namaskar)', emoji: '☀️', category: 'yoga',
    muscleGroups: ['Full Body'],
    equipment: ['Yoga Mat'], difficulty: 'beginner',
    description: '12-pose flowing sequence. Great warm-up and full-body mobility.',
    caloriesPerMinute: 4, isCompound: true,
  },
  {
    id: 'e029', name: 'Warrior Pose (Virabhadrasana)', emoji: '🧘', category: 'yoga',
    muscleGroups: ['Quads', 'Hips', 'Core'],
    equipment: ['Yoga Mat'], difficulty: 'beginner',
    description: 'Deep lunge with arms extended. Builds hip strength and focus.',
    caloriesPerMinute: 3, isCompound: false,
  },
  {
    id: 'e030', name: 'Child\'s Pose (Balasana)', emoji: '🧘', category: 'yoga',
    muscleGroups: ['Back', 'Hips', 'Shoulders'],
    equipment: ['Yoga Mat'], difficulty: 'beginner',
    description: 'Rest pose. Kneel, fold forward, arms extended. Deep spine stretch.',
    caloriesPerMinute: 2, isCompound: false,
  },
  {
    id: 'e031', name: 'Downward Dog (Adho Mukha)', emoji: '🐕', category: 'yoga',
    muscleGroups: ['Hamstrings', 'Calves', 'Shoulders', 'Core'],
    equipment: ['Yoga Mat'], difficulty: 'beginner',
    description: 'Inverted V-shape. Pedal heels to deepen hamstring stretch.',
    caloriesPerMinute: 3, isCompound: true,
  },
  {
    id: 'e032', name: 'Seated Forward Bend', emoji: '🧘', category: 'flexibility',
    muscleGroups: ['Hamstrings', 'Lower Back'],
    equipment: ['Yoga Mat'], difficulty: 'beginner',
    description: 'Sit with legs extended, hinge forward from hips, reach toes.',
    caloriesPerMinute: 2, isCompound: false,
  },
  {
    id: 'e033', name: 'Hip Flexor Stretch', emoji: '🦵', category: 'flexibility',
    muscleGroups: ['Hip Flexors', 'Quads'],
    equipment: ['Yoga Mat'], difficulty: 'beginner',
    description: 'Kneeling lunge, push hips forward, hold 30–60 seconds each side.',
    caloriesPerMinute: 2, isCompound: false,
  },
  {
    id: 'e034', name: 'Foam Rolling (Full Body)', emoji: '🎯', category: 'flexibility',
    muscleGroups: ['Full Body'],
    equipment: ['Foam Roller'], difficulty: 'beginner',
    description: 'Roll over major muscle groups 60–90 seconds each to release tension.',
    caloriesPerMinute: 2, isCompound: false,
  },
];

export const getExercisesByCategory = (category: string): Exercise[] =>
  category === 'all'
    ? EXERCISE_LIBRARY
    : EXERCISE_LIBRARY.filter((e) => e.category === category);

export const searchExercises = (query: string): Exercise[] => {
  const q = query.toLowerCase();
  return EXERCISE_LIBRARY.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.muscleGroups.some((m) => m.toLowerCase().includes(q)) ||
      e.category.includes(q)
  );
};

export const getExerciseById = (id: string): Exercise | undefined =>
  EXERCISE_LIBRARY.find((e) => e.id === id);

export const WORKOUT_TEMPLATES: Record<
  string,
  { name: string; emoji: string; exercises: string[]; description: string }
> = {
  beginner_full_body: {
    name: 'Beginner Full Body',
    emoji: '🌱',
    description: '3 sets of basics — perfect for starting out.',
    exercises: ['e007', 'e008', 'e009', 'e010', 'e021'],
  },
  strength_upper: {
    name: 'Upper Body Strength',
    emoji: '💪',
    description: 'Chest, back, shoulders and arms.',
    exercises: ['e001', 'e004', 'e005', 'e006', 'e011', 'e012'],
  },
  strength_lower: {
    name: 'Lower Body Power',
    emoji: '🦵',
    description: 'Quad, hamstring and glute dominant.',
    exercises: ['e002', 'e003', 'e013', 'e015', 'e009'],
  },
  hiit_fat_burn: {
    name: 'HIIT Fat Burn',
    emoji: '🔥',
    description: '20-min high intensity — maximum calorie burn.',
    exercises: ['e023', 'e024', 'e025', 'e019', 'e027'],
  },
  yoga_morning: {
    name: 'Morning Yoga Flow',
    emoji: '☀️',
    description: 'Start the day with mobility and mindfulness.',
    exercises: ['e028', 'e029', 'e031', 'e030', 'e033'],
  },
  cardio_endurance: {
    name: 'Cardio Endurance',
    emoji: '🏃',
    description: 'Build your aerobic base and stamina.',
    exercises: ['e016', 'e017', 'e019', 'e022'],
  },
};

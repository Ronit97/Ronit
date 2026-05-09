# Agarwal Health — Setup Guide

## Quick Start

```bash
cd health-app
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or press:
- `a` → Android emulator
- `i` → iOS simulator (macOS only)
- `w` → Web browser

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile framework | React Native + Expo SDK 51 |
| Navigation | Expo Router v3 (file-based) |
| State management | Zustand v4 |
| Persistence | AsyncStorage |
| UI gradients | expo-linear-gradient |
| Camera/Gallery | expo-image-picker, expo-camera |
| Charts | react-native-svg |
| Icons | @expo/vector-icons |

## Pre-configured Family Profiles

| Member | Age | Goals | Conditions |
|--------|-----|-------|------------|
| **Ajay Agarwal** (Admin) | 57M | Weight loss, longevity, cardio | Obese (BMI 33.1) |
| **Ronit Agarwal** | 29M | Muscle gain, cardio, energy | None |
| **Seema Agarwal** | 55F | Longevity, flexibility, daily functioning | Mild joint stiffness |
| **Cheshta Agarwal** | 25F | Muscle gain, cardio, energy | None |
| **Shivi Rathi** | 29F | Weight loss, cardio, energy | None |

## Feature Tour

### 🏠 Dashboard
- Personalised health score (0-100) calculated from nutrition + fitness + activity + wellness
- Daily macros tracker (calories, protein, carbs, fat)
- Quick action buttons (Log Meal, Workout, Water, Steps)
- Score breakdown chart
- AI-generated insights tailored to each member's goals
- Mood check-in

### 📸 Log Screen
- **AI Photo Recognition** — takes a camera/gallery photo and simulates ML food identification
- **Smart search** — 40+ Indian + international foods searchable by name or Hindi
- **Quick add** — member-personalised food suggestions
- Water intake quick-log (+250ml taps)
- Steps quick-log (+1000 taps)
- Sleep & weight logging

### 💪 Workouts
- **Exercise library** — 34 exercises across Strength, Cardio, HIIT, Flexibility, Yoga
- Category filter (All, Strength, Cardio, HIIT, Flex, Yoga)
- Multi-select and start custom workout
- **6 workout templates** curated for different goals
- Live workout timer + calorie burn tracking
- Workout history with stats

### 👨‍👩‍👧‍👦 Family Dashboard
- Full family leaderboard ranked by today's health score
- Comparative stats (combined steps, workouts)
- Weekly challenge progress bars
- Quick profile switch
- Individual profile cards with BMI & goals

### 👤 Profile
- Complete body metrics (BMI, TDEE, target weight)
- Weight goal progress bar
- Log today's weight
- Daily nutritional targets
- Health conditions display
- Diet type & activity level
- Notification settings

## AI Meal Recognition (MVP Simulation)

The current implementation simulates AI inference with realistic meal pattern matching. The architecture is production-ready for integration with a real ML backend:

```
Photo → expo-image-picker → recognizeMealFromPhoto() → FastAPI endpoint (future)
                                     ↓
                          Pattern matching (MVP) → Food items + portions
                                     ↓
                          User confirms → addMealLog()
```

To connect a real model: replace `recognizeMealFromPhoto()` in `services/aiRecognition.ts` with an API call to your FastAPI/TensorFlow Serving endpoint.

## Health Score Algorithm

```
Score (0-100) = Nutrition (0-25) + Fitness (0-25) + Activity (0-25) + Wellness (0-25)

Nutrition: calories within target + protein hit + meal variety + fiber
Fitness:   workout duration + intensity (calories burned)
Activity:  steps vs. target + water intake
Wellness:  sleep hours + mood rating + weight tracking
```

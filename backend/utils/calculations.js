// utils/calculations.js
exports.calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

exports.calculateBMR = (weight, height, age, gender) => {
  if (gender === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  }
  return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
};

exports.calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

exports.calculateCaloriesBurned = (weight, duration, intensity) => {
  const MET = {
    low: 3,
    moderate: 5,
    high: 8,
    veryHigh: 10,
  };
  return Math.round((MET[intensity] * 3.5 * weight * duration) / 200);
};

exports.calculateMacros = (dailyCalories, weight, goal) => {
  let proteinRatio, carbsRatio, fatRatio;

  switch (goal) {
    case "lose":
      proteinRatio = 0.4; // 40% protein
      carbsRatio = 0.35; // 35% carbs
      fatRatio = 0.25; // 25% fat
      break;
    case "gain":
      proteinRatio = 0.3; // 30% protein
      carbsRatio = 0.5; // 50% carbs
      fatRatio = 0.2; // 20% fat
      break;
    default: // maintain
      proteinRatio = 0.3; // 30% protein
      carbsRatio = 0.4; // 40% carbs
      fatRatio = 0.3; // 30% fat
  }

  return {
    protein: Math.round((dailyCalories * proteinRatio) / 4),
    carbs: Math.round((dailyCalories * carbsRatio) / 4),
    fats: Math.round((dailyCalories * fatRatio) / 9),
  };
};

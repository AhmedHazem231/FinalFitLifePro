// services/AchievementService.js
const User = require("../models/User");
const NotificationService = require("./NotificationService");

class AchievementService {
  constructor() {
    this.achievements = {
      workouts: [
        {
          id: "first_workout",
          name: "First Step",
          description: "Complete your first workout",
          points: 50,
        },
        {
          id: "workout_streak_7",
          name: "Week Warrior",
          description: "Complete workouts 7 days in a row",
          points: 100,
        },
        {
          id: "workout_streak_30",
          name: "Monthly Master",
          description: "Complete workouts 30 days in a row",
          points: 500,
        },
        {
          id: "hundred_workouts",
          name: "Century Club",
          description: "Complete 100 workouts",
          points: 1000,
        },
      ],
      progress: [
        {
          id: "weight_goal",
          name: "Goal Crusher",
          description: "Reach your weight goal",
          points: 200,
        },
        {
          id: "consistent_tracking",
          name: "Tracking Pro",
          description: "Track progress for 30 consecutive days",
          points: 300,
        },
      ],
      social: [
        {
          id: "community_helper",
          name: "Community Hero",
          description: "Help 10 community members",
          points: 150,
        },
        {
          id: "popular_post",
          name: "Influencer",
          description: "Get 100 likes on a post",
          points: 200,
        },
      ],
    };
  }

  async checkWorkoutAchievements(userId, workoutCount, streakDays) {
    try {
      const user = await User.findById(userId);
      const earnedAchievements = [];

      // Check first workout
      if (workoutCount === 1) {
        earnedAchievements.push(this.achievements.workouts[0]);
      }

      // Check workout count milestones
      if (workoutCount === 100) {
        earnedAchievements.push(this.achievements.workouts[3]);
      }

      // Check streaks
      if (streakDays === 7) {
        earnedAchievements.push(this.achievements.workouts[1]);
      }
      if (streakDays === 30) {
        earnedAchievements.push(this.achievements.workouts[2]);
      }

      // Award achievements
      for (const achievement of earnedAchievements) {
        if (
          !user.progress.badges.some((badge) => badge.name === achievement.name)
        ) {
          user.progress.badges.push({
            name: achievement.name,
            description: achievement.description,
            dateEarned: new Date(),
          });
          user.progress.points += achievement.points;

          // Send notification
          await NotificationService.notifyAchievement(userId, achievement);
        }
      }

      if (earnedAchievements.length > 0) {
        await user.save();
      }

      return earnedAchievements;
    } catch (error) {
      console.error("Error checking achievements:", error);
      throw error;
    }
  }

  async checkProgressAchievements(userId, currentWeight, goalWeight) {
    try {
      if (goalWeight) {
        const goalAchieved =
          (goalWeight > currentWeight && currentWeight >= goalWeight) ||
          (goalWeight < currentWeight && currentWeight <= goalWeight);

        if (goalAchieved) {
          const user = await User.findById(userId);
          const achievement = this.achievements.progress[0];

          if (
            !user.progress.badges.some(
              (badge) => badge.name === achievement.name,
            )
          ) {
            user.progress.badges.push({
              name: achievement.name,
              description: achievement.description,
              dateEarned: new Date(),
            });
            user.progress.points += achievement.points;
            await user.save();

            await NotificationService.notifyAchievement(userId, achievement);
            return [achievement];
          }
        }
      }
      return [];
    } catch (error) {
      console.error("Error checking progress achievements:", error);
      throw error;
    }
  }

  async checkSocialAchievements(userId, postLikes) {
    try {
      if (postLikes >= 100) {
        const user = await User.findById(userId);
        const achievement = this.achievements.social[1];

        if (
          !user.progress.badges.some((badge) => badge.name === achievement.name)
        ) {
          user.progress.badges.push({
            name: achievement.name,
            description: achievement.description,
            dateEarned: new Date(),
          });
          user.progress.points += achievement.points;
          await user.save();

          await NotificationService.notifyAchievement(userId, achievement);
          return [achievement];
        }
      }
      return [];
    } catch (error) {
      console.error("Error checking social achievements:", error);
      throw error;
    }
  }
}

module.exports = new AchievementService();

// services/NotificationService.js
const Notification = require("../models/Notification");
const emailService = require("../utils/emailService");

class NotificationService {
  async create(userId, type, title, message, data = {}, link = "") {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        data,
        link,
      });

      // If user has email notifications enabled, send email
      const user = await User.findById(userId).select(
        "email preferences.notifications",
      );
      if (user.preferences.notifications[type]) {
        await emailService.sendEmail(user.email, title, message);
      }

      return notification;
    } catch (error) {
      console.error("Notification creation failed:", error);
      throw error;
    }
  }

  async getUnread(userId) {
    return await Notification.find({
      user: userId,
      read: false,
    }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true },
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { user: userId, read: false },
      { read: true },
    );
  }

  // Notification templates
  async notifyWorkoutComplete(userId, workout) {
    return this.create(
      userId,
      "workout",
      "Workout Completed! 💪",
      `Great job completing your ${workout.type} workout!`,
      { workoutId: workout._id },
      `/workouts/${workout._id}`,
    );
  }

  async notifyAchievement(userId, achievement) {
    return this.create(
      userId,
      "achievement",
      "New Achievement Unlocked! 🏆",
      `You've earned the "${achievement.name}" badge!`,
      { achievement },
      "/achievements",
    );
  }

  async notifyProgressMilestone(userId, milestone) {
    return this.create(
      userId,
      "progress",
      "Progress Milestone! 🎯",
      `Congratulations! ${milestone.message}`,
      { milestone },
      "/progress",
    );
  }
}

module.exports = new NotificationService();

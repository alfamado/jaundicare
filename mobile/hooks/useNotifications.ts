/**
 * JaundiCare — useNotifications hook
 * Schedules postnatal follow-up reminders using Expo notifications.
 * Native push — far more reliable than browser Notification API.
 */

import { useCallback } from "react";
import * as Notifications from "expo-notifications";
import type { BabyProfile } from "../services/api";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

const REMINDERS = [
  { dayOffset: 1,  title: "JaundiCare — Day 1 check",   body: "Look at your baby's eyes, gums, and soles for yellowing." },
  { dayOffset: 2,  title: "JaundiCare — Day 2-3 check", body: "Check eyes, gums, palms and soles. Watch feeding closely." },
  { dayOffset: 7,  title: "JaundiCare — Day 7 follow-up",body: "Review feeding, weight and any persistent yellowing." },
  { dayOffset: 14, title: "JaundiCare — Day 14 check",  body: "If jaundice is still present or worsening, seek medical advice today." },
];

export function useNotifications() {

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }, []);

  const scheduleFollowUpReminders = useCallback(async (profile: BabyProfile) => {
    if (!profile.date_of_birth || !profile.time_of_birth) return;

    const granted = await requestPermission();
    if (!granted) return;

    // Cancel any existing JaundiCare reminders first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const birthDt = new Date(`${profile.date_of_birth}T${profile.time_of_birth}`);
    const now     = Date.now();

    for (const reminder of REMINDERS) {
      const dueTime = birthDt.getTime() + reminder.dayOffset * 24 * 60 * 60 * 1000;
      const delay   = dueTime - now;

      // Only schedule future reminders
      if (delay > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body:  reminder.body,
            sound: true,
            data:  { dayOffset: reminder.dayOffset },
          },
          trigger: { seconds: Math.floor(delay / 1000) },
        });
      }
    }
  }, [requestPermission]);

  const cancelAllReminders = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  return { requestPermission, scheduleFollowUpReminders, cancelAllReminders };
}
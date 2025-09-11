import { Expo } from "expo-server-sdk";

// Create a new Expo SDK client
let expo = new Expo();

export async function sendPushNotification(pushTokens, data) {
  let messages = [];

  for (let pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      title: data.title || "New Message",
      body: data.message,
      data: data.data || {},
    });
  }

  console.log("[Push Debug] Sending Expo pushes:", messages);
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("[Push Debug] Tickets:", ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("[Push Debug] Error sending push chunk:", error);
    }
  }

  return tickets;
}

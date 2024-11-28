export async function sendPushNotification(title, message, link) {
  try {
    //send alert push notification to Ori's Iphone
    await fetch(
      `https://alertzy.app/send?accountKey=e87wqg3oajr8pn9&title=${encodeURI(title)}&message=${encodeURI(message)}&link=${encodeURI(link)}`,
      {
        method: 'POST',
        body: '',
        credentials: 'include',
      },
    );
  } catch (error) {
    console.log("Push notification didn't sent | ", error);
  }
}
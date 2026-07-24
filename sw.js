self.addEventListener('push', e => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'icon.png' // You can add an icon later
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // Open the app when the notification is clicked
  event.waitUntil(
      clients.openWindow('/')
  );
});

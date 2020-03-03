  self.addEventListener('install', (event) => {
     event.waitUntil(skipWaiting());
 });

 self.addEventListener('activate', function(event) {
	return self.clients.claim();
});


self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const parsedData = event.data.json();
  const notification = parsedData.notification;
  const title = notification.title;
  const body = notification.body;
  const icon = notification.icon;
  const data = parsedData.data;

  event.waitUntil(
    self.registration.showNotification(title, { body, icon, data })
  );
}, false);

self.addEventListener('notificationclick', (event) => {
  var notif = event.notification;
  notif.close();
  event.waitUntil(self.clients.openWindow('/carparks'));
}, false);



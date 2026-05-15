// Service Worker para BarrioAlerta
// Maneja Push Notifications de Firebase Cloud Messaging

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// La config de Firebase se inyecta en el cliente al registrar el SW.
// Aquí solo necesitamos inicializar messaging para recibir notificaciones en background.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebase.initializeApp(event.data.config);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const { title, body, icon } = payload.notification || {};
      self.registration.showNotification(title || 'BarrioAlerta', {
        body: body || '',
        icon: icon || '/icon-192.png',
        badge: '/icon-192.png',
        data: payload.data,
      });
    });
  }
});

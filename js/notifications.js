function sendNotification(data) {

    notificationData = formatNotification(data);
    if (!('Notification' in window)) {
        alert(notificationData.message + '\n' + notificationData.options.body);
    }
    else if (Notification.permission === 'granted') {
        var notification = new Notification(notificationData.message, notificationData.options);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
            if (permission === 'granted') {
                var notification = new Notification(notificationData.message, notificationData.options);
            }
        });
    } 
}

function formatNotification(data) {
    return {
        message: 'Hola, ' + data.name,
        options: {
            body: 'He recibido tu mensaje y en breve te contestaré a ' + data.email
        }
    }
}

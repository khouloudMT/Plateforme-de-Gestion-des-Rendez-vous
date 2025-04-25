import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket;
  private notifications = new Subject<any>();

  constructor() {
    this.socket = new WebSocket('ws://localhost:5000/ws');
    
    this.socket.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      this.notifications.next(notification);
    };
  }

  getNotifications() {
    return this.notifications.asObservable();
  }

  sendNotification(notification: any) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(notification));
    }
  }
}

// import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { environment } from '../../../backend'; // mets l'URL de ton backend

// @Injectable({
//   providedIn: 'root'
// })
// export class NotificationService {
//   private socket: Socket;

//   constructor() {
//     this.socket = io(environment.socketUrl); // e.g. http://localhost:5000
//   }

//   joinRoom(userId: string) {
//     this.socket.emit('joinRoom', userId);
//   }

//   onStatusChange(callback: (data: any) => void) {
//     this.socket.on('appointmentStatusChanged', callback);
//   }
// }

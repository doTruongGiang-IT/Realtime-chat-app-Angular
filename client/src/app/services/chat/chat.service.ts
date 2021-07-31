import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private url: string = "http://localhost:3000";

  constructor() { 
    this.socket = io(this.url, {transports: ['websocket', 'polling', 'flashsocket']});
  };

  joinMeeting(data: any): void {
    this.socket.emit('join', data);
  };

  sendMessage(data: any): void {
    this.socket.emit('message', data);
  };

  getMessage(): Observable<any> {
    return new Observable<{user: string, message: string}>(observer => {
      this.socket.on('newMessage', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket?.disconnect();
      };
    });
  };

  getStorage() {
    const storage = localStorage.getItem("chats");
    return storage ? JSON.parse(storage) : [];
  };

  setStorage(storages: any[]): void {
    localStorage.setItem('chats', JSON.stringify(storages));
  };  

}

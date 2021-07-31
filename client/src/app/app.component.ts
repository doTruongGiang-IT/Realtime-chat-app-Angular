import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatService } from './services/chat/chat.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('popup', {static: false}) popup: any;
  private subs: Subscription[] = [];
  private storages: any[] = [];
  roomID: string = "";
  messageText: string = "";
  messages: {user: string, message: string}[] = [];
  phone: string = "";
  currentUser: any;
  selectedUser: any;
  showScreen?: boolean;
  users = [
    {
      id: 1,
      name: "Do Truong Giang",
      phone: '776134908',
      image: "../assets/giang.png",
      roomID: {
        2: 'room-1',
        3: 'room-2',
        4: 'room-3'
      }
    },
    {
      id: 2,
      name: "Duong Bac Dong",
      phone: '123456789',
      image: '../assets/dong.svg',
      roomID: {
        1: 'room-1',
        3: 'room-4',
        4: 'room-5'
      }
    },
    {
      id: 3,
      name: "Bui Trung Hau",
      phone: '827487248',
      image: '../assets/hau.png',
      roomID: {
        1: 'room-2',
        2: 'room-4',
        4: 'room-6'
      }
    },
    {
      id: 4,
      name: "Luu Duc Hoa",
      phone: '823748327',
      image: '../assets/hoa.png',
      roomID: {
        1: 'room-3',
        2: 'room-5',
        3: 'room-6'
      }
    },
  ];

  constructor(private chatService: ChatService, private modalService: NgbModal) {
  };

  ngOnInit(): void {
    // this.currentUser = this.users[0];
    this.subs.push(
      this.chatService.getMessage().subscribe((data: {user: string, message: string}) => {
        // this.messages.push(data);
        if(this.roomID) {
          setTimeout(() => {
            this.storages = this.chatService.getStorage();
            const storeIndex = this.storages.findIndex((storage) => storage.roomID === this.roomID);
            this.messages = this.storages[storeIndex].chats;
          }, 500);
        }
      }),
    );
  };

  ngAfterViewInit():void {
    this.openPopup(this.popup);
  };

  openPopup(content: any): void {
    this.modalService.open(content, {backdrop: 'static', centered: true});
  };

  signIn(dismiss: any): void {
    this.currentUser = this.users.find((user) => user.phone === this.phone.toString());
    this.users = this.users.filter((user) => user.phone !== this.phone.toString());
    if(this.currentUser) {
      this.showScreen = true;
      dismiss();
    };
  };

  selectUser(phone: string): void {
    this.selectedUser = this.users.find((user) => user.phone === phone);
    this.roomID = this.selectedUser.roomID[this.currentUser.id];
    this.messages = [];
    this.storages = this.chatService.getStorage();
    const storeIndex = this.storages.findIndex((storage) => storage.roomID === this.roomID);
    if(storeIndex !== -1) {
      this.messages = this.storages[storeIndex].chats;
    };
    this.join(this.currentUser.name, this.currentUser.roomID);
  };

  join(username: string, roomID: string): void {
    this.chatService.joinMeeting({user: username, room: roomID});
  };

  sendMessage(): void {
    this.chatService.sendMessage({user: this.currentUser.name, room: this.roomID, message: this.messageText});
    this.storages = this.chatService.getStorage();
    const storeIndex = this.storages.findIndex((storage) => storage.roomID === this.roomID);
    if(storeIndex !== -1) {
      this.storages[storeIndex].chats.push({
        user: this.currentUser.name,
        message: this.messageText,
      }); 
    }else {
      const updateStorage = {
        roomID: this.roomID,
        chats: [
          {
            user: this.currentUser.name,
            message: this.messageText, 
          }
        ]
      };
      this.storages.push(updateStorage);
    };

    this.chatService.setStorage(this.storages);
    this.messageText = "";
  };

  ngOnDestroy(): void {
    this.subs.forEach((sub) => {
      if(sub) {
        sub.unsubscribe();
      };
    });
  };
}

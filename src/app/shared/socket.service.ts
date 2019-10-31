import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable()
export class SocketService {
  private url = environment.socket;
  public socket: any;
  public data = new Subject<any>();
  constructor() {
  }



  voteChange() {
    this.socket = io(this.url);
    this.socket.on('data', (data: any) => {
      console.log(data);
      this.data.next(data);
    });
    return () => {
      this.socket.disconnect();
    };
  }
}

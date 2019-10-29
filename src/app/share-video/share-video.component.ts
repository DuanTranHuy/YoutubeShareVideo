import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment.prod';
import { YoutubeDataAPI } from 'youtube-v3-api';
import { AuthService } from '../shared/auth.service';

const API_KEY = environment.youtubeApi;

const api = new YoutubeDataAPI(API_KEY);
@Component({
  selector: 'app-share-video',
  templateUrl: './share-video.component.html',
  styleUrls: ['./share-video.component.css']
})
export class ShareVideoComponent implements OnInit {
  user: firebase.User;
  url: string;
  constructor(
    public afs: AngularFirestore,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.userData.subscribe(x => {
      this.user = x;
    });
  }

  share() {
    const videoId = this.extractVideoID();
    if (!videoId) {
      alert('Cant not exact url');
      return;
    }
    return api.searchVideo(videoId).then(data => {
      const result = data as any;
      return this.afs.collection('video').add({
        videoId,
        videoDescription: result.items[0].snippet.description,
        sharedBy: this.user.email,
        videoName: result.items[0].snippet.title,
        time: Date.now()
      }).then((docRef) => {
        return this.afs.collection('votes').doc(docRef.id).set({id: docRef.id});
      });
    }, () => {
      alert('Wrong url');
    });
  }

  extractVideoID() {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = this.url.match(regExp);
    if (match && match[7].length === 11) {
      return match[7];
    } else {
      return null;
    }
  }
}

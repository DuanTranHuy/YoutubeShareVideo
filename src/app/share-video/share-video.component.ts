import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment.prod';
import { YoutubeDataAPI } from 'youtube-v3-api';
import { firestore } from 'firebase/app';
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
      console.log(data);
      const result = data as any;
      console.log(result.items[0].snippet.description);
      return this.afs.collection('video').add({
        videoId,
        videoDescription: result.items[0].snippet.description,
        sharedBy: this.user.email,
        videoName: result.items[0].snippet.title,
        time: Date.now()
      }).then((docRef) => {
        return this.afs.collection('votes').doc(docRef.id).set({});
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

  like() {
    // if (!this.user) {
    //   return;
    // }
    // if (item.votes) {
    //   if (!item.votes.find(b => b.by === this.user.uid)) {
    //     return this.afs.collection('video').doc(item.id).update(
    //       { votes: firestore.FieldValue.arrayUnion({ by: this.user.uid, value: rate }) });
    //   }
    // } else {
    //   return this.afs.collection('video').doc(item.id).update(
    //     { votes: firestore.FieldValue.arrayUnion({ by: this.user.uid, value: rate }) });
    // }
    // this.videosCollection.subscribe(x => {
    //   console.log(x);
    // });
    return this.afs.collection('video').doc('IummScF3Ygt0qmdE5MXU').update(
      { votes: firestore.FieldValue.arrayUnion({ by: this.user.uid, value: true }) });
  }
  unlike() {
    return this.afs.collection('video').doc('IummScF3Ygt0qmdE5MXU').update(
      { votes: firestore.FieldValue.arrayRemove({ by: this.user.uid, value: true }) })
  }

  dislike() {
    return this.afs.collection('video').doc('IummScF3Ygt0qmdE5MXU').update(
      { votes: firestore.FieldValue.arrayUnion({ by: this.user.uid, value: false }) });
  }

  undislike() {
    return this.afs.collection('video').doc('IummScF3Ygt0qmdE5MXU').update(
      { votes: firestore.FieldValue.arrayRemove({ by: this.user.uid, value: false }) });
  }
}

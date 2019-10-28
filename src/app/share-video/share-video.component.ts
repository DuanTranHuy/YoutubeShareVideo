import { Component, OnInit, Query } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment.prod';
import { YoutubeDataAPI } from 'youtube-v3-api';
import { Video } from './video';
import { firestore } from 'firebase/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API_KEY = environment.youtubeApi;

const api = new YoutubeDataAPI(API_KEY);
@Component({
  selector: 'app-share-video',
  templateUrl: './share-video.component.html',
  styleUrls: ['./share-video.component.css']
})
export class ShareVideoComponent implements OnInit {
  videosCollection: Observable<Video[]>;
  user: firebase.User;
  url: string;
  constructor(
    public afs: AngularFirestore,
  ) { }

  ngOnInit() {
    this.videosCollection = this.afs.collection<Video>('video', ref => ref.orderBy('time', 'desc')).snapshotChanges().pipe(
      map(
        changes => {
          return changes.map(change => {
            const data = change.payload.doc.data();
            const id = change.payload.doc.id;
            if (data.votes && data.votes.length > 0) {
              let numberLike = 0;
              let numberDislike = 0;
              data.votes.forEach(x => {
                if (x) {
                  numberLike = numberLike + 1;
                } else {
                  numberDislike = numberDislike + 1;
                }
              });
              data.like = numberLike;
              data.dislike = numberDislike;
            } else {
              data.like = 0;
              data.dislike = 0;
            }
            return { id, ...data };
          });
        }
      )
    );
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
        videoDescription: result.items[0].snippet.description.slice(0, 50),
        sharedBy: 'duan@gmail.com',
        videoName: result.items[0].snippet.title,
        time: Date.now()
      });
    }, (err) => {
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
    this.videosCollection.subscribe(x => {
      console.log(x);
    });
    return this.afs.collection('video').doc('IummScF3Ygt0qmdE5MXU').update(
      { votes: firestore.FieldValue.arrayUnion({ by: 'GDUCoZisxGONQ6kGk0SeV8BJn2d2', value: true }) });
  }
  unlike() {
    return this.afs.collection('video').doc('IummScF3Ygt0qmdE5MXU').update(
      { votes: firestore.FieldValue.arrayRemove({ by: 'GDUCoZisxGONQ6kGk0SeV8BJn2d2', value: true }) })
  }

  dislike() {
    return this.afs.collection('video').doc('IummScF3Ygt0qmdE5MXU').update(
      { votes: firestore.FieldValue.arrayUnion({ by: 'GDUCoZisxGONQ6kGk0SeV8BJn2d2', value: false }) });
  }

  undislike() {
    return this.afs.collection('video').doc('IummScF3Ygt0qmdE5MXU').update(
      { votes: firestore.FieldValue.arrayRemove({ by: 'GDUCoZisxGONQ6kGk0SeV8BJn2d2', value: false }) });
  }
}

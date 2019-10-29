import { Component, OnInit } from '@angular/core';
import { Video, VoteCollection } from '../share-video/video';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { DomSanitizer } from '@angular/platform-browser';
import { firestore } from 'firebase/app';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  videosCollection: Video[] = [];
  videos: Video[];
  user: firebase.User;
  voteCollection: AngularFirestoreCollection<VoteCollection>;
  votes: VoteCollection[] = [];
  constructor(
    public afs: AngularFirestore,
    public sanitizer: DomSanitizer,
    public authService: AuthService

  ) { }

  ngOnInit() {
    this.authService.userData.subscribe(x => {
      this.user = x;
    });

    this.voteCollection = this.afs.collection<VoteCollection>('votes');
    this.voteCollection.get().toPromise().then(x => {
      x.docs.forEach(item => {
        this.votes.push(item.data() as VoteCollection);
      });
    });
    this.afs.collection<Video>('video', ref => ref.orderBy('time', 'desc').limit(15)).get().toPromise().then(x => {
      x.docs.forEach(item => {
        const video = item.data() as Video;
        video.id = item.id;
        video.url = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${video.videoId}`);
        this.videosCollection.push(video);
      });
    }).then(() => {
      this.afs.collection<VoteCollection>('votes').snapshotChanges().subscribe(x => {
        x.forEach(element => {
          const voteCollection = element.payload.doc.data();
          const item = this.videosCollection.find(m => m.id === voteCollection.id);
          this.update(item, voteCollection);
        });
      });
    }
    );

  }


  like(item: Video) {
    item.liked = true;
    item.like = item.like + 1;
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayUnion({ by: this.user.uid, value: true }) });
  }

  unlike(item: Video) {
    item.liked = false;
    item.like = item.like - 1;
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayRemove({ by: this.user.uid, value: true }) });
  }

  dislike(item: Video) {
    item.disliked = true;
    item.dislike = item.dislike + 1;
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayUnion({ by: this.user.uid, value: false }) });
  }

  undislike(item: Video) {
    item.disliked = false;
    item.dislike = item.dislike - 1;
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayRemove({ by: this.user.uid, value: false }) });
  }

  update(item: Video, data: VoteCollection) {
    if (data.votes && data.votes.length > 0) {
      let numberLike = 0;
      let numberDislike = 0;
      data.votes.forEach(x => {
        if (x.value) {
          numberLike = numberLike + 1;
        } else {
          numberDislike = numberDislike + 1;
        }
        if (this.user) {
          if (x.value && x.by === this.user.uid) {
            item.liked = true;
            item.disliked = false;

          }
          if (!x.value && x.by === this.user.uid) {
            item.disliked = true;
            item.liked = false;
          }
        }
      });
      item.like = numberLike;
      item.dislike = numberDislike;
    } else {
      item.liked = false;
      item.disliked = false;
      item.like = 0;
      item.dislike = 0;
    }
  }
}

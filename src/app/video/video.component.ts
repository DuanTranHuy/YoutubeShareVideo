import { Component, OnInit, SecurityContext } from '@angular/core';
import { Video, Vote, VoteCollection } from '../share-video/video';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { firestore } from 'firebase/app';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  videosCollection: Observable<Video[]>;
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
    this.videosCollection = this.afs.collection<Video>('video', ref => ref.orderBy('time', 'desc').limit(15)).snapshotChanges().pipe(
      map(
        changes => {
          return changes.map(change => {
            const data = change.payload.doc.data();
            const id = change.payload.doc.id;
            data.url = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${data.videoId}`);
            if (this.votes) {
              const vote = this.votes.find(m => m.id === id);
              if (vote) {
                data.votes = vote.votes;
              }
            }
            if (data.votes && data.votes.length > 0) {
              let numberLike = 0;
              let numberDislike = 0;
              data.votes.forEach(n => {
                if (n.value) {
                  numberLike = numberLike + 1;
                } else {
                  numberDislike = numberDislike + 1;
                }
                if (this.user) {
                  if (n.value && n.by === this.user.uid) {
                    data.liked = true;
                  }
                  if (!n.value && n.by === this.user.uid) {
                    data.disliked = true;
                  }
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

  like(item: Video) {
    item.liked = true;
    item.like = item.like + 1;
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayUnion({ by: this.user.uid, value: true }) }).then(x =>  this.update(item) );
  }

  unlike(item: Video) {
    item.liked = false;
    item.like = item.like - 1;
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayRemove({ by: this.user.uid, value: true }) }).then(x =>  this.update(item) );
  }

  dislike(item: Video) {
    item.disliked = true;
    item.dislike = item.dislike + 1;
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayUnion({ by: this.user.uid, value: false }) }).then(x =>  this.update(item) );
  }

  undislike(item: Video) {
    item.disliked = false;
    item.dislike = item.dislike - 1;
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayRemove({ by: this.user.uid, value: false }) }).then(x =>  this.update(item) );
  }
  update(item: Video) {
    return this.voteCollection.doc(item.id).get().toPromise().then(x => {
      const data = x.data() as VoteCollection;
      if (data.votes && data.votes.length > 0) {
        let numberLike = 0;
        let numberDislike = 0;
        data.votes.forEach(n => {
          if (n.value) {
            numberLike = numberLike + 1;
          } else {
            numberDislike = numberDislike + 1;
          }
          if (this.user) {
            if (n.value && n.by === this.user.uid) {
              item.liked = true;
              item.disliked = false;

            }
            if (!n.value && n.by === this.user.uid) {
              item.disliked = true;
              item.liked = false;

            }
          }
        });
        item.like = numberLike;
        item.dislike = numberDislike;
      } else {
        item.like = 0;
        item.dislike = 0;
      }
    });
  }
}

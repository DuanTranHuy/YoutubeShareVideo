import { Component, OnInit, SecurityContext } from '@angular/core';
import { Video } from '../share-video/video';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
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
  user: firebase.User;

  constructor(
    public afs: AngularFirestore,
    public sanitizer: DomSanitizer,
    public authService: AuthService

  ) { }

  ngOnInit() {
    this.authService.userData.subscribe(x => {
      this.user = x;
    });
    this.videosCollection = this.afs.collection<Video>('video', ref => ref.orderBy('time', 'desc').limit(15)).snapshotChanges().pipe(
      map(
        changes => {
          return changes.map(change => {
            const data = change.payload.doc.data();
            const id = change.payload.doc.id;
            data.url = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${data.videoId}`);
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
                    data.liked = true;
                  }
                  if (!x.value && x.by === this.user.uid) {
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
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayUnion({ by: this.user.uid, value: true }) });
  }

  unlike(item: Video) {
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayRemove({ by: this.user.uid, value: true }) })
  }

  dislike(item: Video) {
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayUnion({ by: this.user.uid, value: false }) });
  }

  undislike(item: Video) {
    return this.afs.collection('votes').doc(item.id).update(
      { votes: firestore.FieldValue.arrayRemove({ by: this.user.uid, value: false }) });
  }

getVotes(item: Video) {
  return this.afs.collection('votes').doc(item.id).get().toPromise().then(x=> {
    return x;
  });
}

}

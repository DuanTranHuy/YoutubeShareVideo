import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestResult } from '../shared/request-result';
import { environment } from 'src/environments/environment';
import { Video } from '../share-video/video';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../shared/auth.service';
import { SocketService } from '../shared/socket.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, OnDestroy {
  video: Video[] = [];
  socket;
  auth;

  constructor(
    private http: HttpClient,
    public sanitizer: DomSanitizer,
    public authService: AuthService,
    private socketService: SocketService,

  ) { }

  ngOnInit() {
    this.socketService.voteChange();
    this.socket = this.socketService.data.asObservable().subscribe(data => {
      console.log('data');
    });
    this.auth = this.authService.loggedIn.subscribe(m => {
      if (m) {
        const userId = Number(this.authService.id());
        this.video.forEach(item => {
          if (item.vote && item.vote.length > 0) {
            item.vote.forEach(x => {
              const likes = item.vote.filter(z => z.action);
              const dislikes = item.vote.filter(z => !z.action);
              item.liked = likes.find(z => z.userCredentialId === userId) ? true : false;
              item.disliked = dislikes.find(z => z.userCredentialId === userId) ? true : false;
              item.like = likes.length;
              item.dislike = dislikes.length;
            });
          } else {
            item.liked = false;
            item.disliked = false;
            item.like = 0;
            item.dislike = 0;
          }
        });
      }
    });
    this.VideoList();
  }

  VideoList() {
    this.http.get<RequestResult>(environment.apiUrl + '/Videos/List').toPromise().then(res => {
      const data = res.data as Video[];
      const userId = Number(this.authService.id());
      data.forEach(item => {
        item.url = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${item.code}`);
        if (item.vote && item.vote.length > 0) {
          let numberLike = 0;
          let numberDislike = 0;
          item.vote.forEach(x => {
            if (x.action) {
              numberLike = numberLike + 1;
            } else {
              numberDislike = numberDislike + 1;
            }
            if (userId > 0) {
              if (x.action && x.userCredentialId === userId) {
                item.liked = true;

              } else if (!x.action && x.userCredentialId === userId) {
                item.disliked = true;
              }
            }
            item.like = numberLike;
            item.dislike = numberDislike;
          });
        } else {
          item.liked = false;
          item.disliked = false;
          item.like = 0;
          item.dislike = 0;
        }
        console.log('123', item);
        this.video.push(item);
      });
      return res;
    });
  }

  like(item: Video) {
    item.liked = true;
    item.like = item.like + 1;
    this.vote(item, true);

  }

  unlike(item: Video) {
    item.liked = false;
    item.like = item.like - 1;
    this.unvote(item);

  }

  dislike(item: Video) {
    item.disliked = true;
    item.dislike = item.dislike + 1;
    this.vote(item, false);

  }

  undislike(item: Video) {
    item.disliked = false;
    item.dislike = item.dislike - 1;
    this.unvote(item);
  }

  vote(item: Video, type: boolean) {
    try {
      return this.http.post<RequestResult>(environment.apiUrl + '/videos/vote', { videoId: item.id, type }).toPromise().then(
        x => x);
    } catch (error) {
      return error;
    }
  }

  unvote(item: Video) {
    try {
      return this.http.post<RequestResult>(environment.apiUrl + '/videos/unvote', { videoId: item.id, type: false }).toPromise().then(
        x => x);
    } catch (error) {
      return error;
    }
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.unsubscribe();
    }
    if (this.auth) {
      this.auth.unsubscribe();
    }
  }
}

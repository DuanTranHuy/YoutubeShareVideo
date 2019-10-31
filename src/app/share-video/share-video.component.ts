import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { RequestResult } from '../shared/request-result';

@Component({
  selector: 'app-share-video',
  templateUrl: './share-video.component.html',
  styleUrls: ['./share-video.component.css']
})
export class ShareVideoComponent implements OnInit {
  url: string;
  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit() {

  }

  share() {
    const videoId = this.extractVideoID();
    if (!videoId) {
      alert('Cant not exact url');
      return;
    }
    return this.shareVideo(videoId);
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

  async shareVideo(code: string) {
    try {
      const res = await this.http.post<RequestResult>(environment.apiUrl + '/Videos/share', { code }).toPromise();
      if (res.state === 1) {
        alert(res.message);
      }
      return res;
    } catch (error) {
      return error;
    }
  }
}

import { SafeResourceUrl } from '@angular/platform-browser';

export class Video {
  id: string;
  videoId: number;
  videoName: string;
  videoDescription: string;
  sharedBy: string;
  votes?: Vote[];
  like?: number;
  dislike?: number;
  liked = false;
  disliked = false;
  time: Date;
  url: SafeResourceUrl;
}
export class Vote {
  by: string;
  value: boolean;
}

import { SafeResourceUrl } from '@angular/platform-browser';

export class Video {
  id: number;
  code: string;
  name: string;
  description: string;
  sharedBy: string;
  vote?: Vote[];
  like?: number;
  dislike?: number;
  liked = false;
  disliked = false;
  url: SafeResourceUrl;
  shareDate: Date;
  editDate: Date;
}
export class Vote {
  id: number;
  userCredentialId: number;
  videoId: number;
  action: boolean;
}


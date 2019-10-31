import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public auth: AuthService, public router: Router) { }
  canActivate(): Observable<boolean> | boolean {
    return this.auth.loggedIn.pipe(map(x => {
      if (x) {
        return true;
      } else {
        return false;
      }
    }));
  }
}

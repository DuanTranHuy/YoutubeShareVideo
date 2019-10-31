import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { RequestResult } from './request-result';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public loggedIn = new BehaviorSubject<boolean>(false);


  constructor(
    private http: HttpClient, private jwtHelper: JwtHelperService) {
    if (!!localStorage.getItem(environment.token)) {
      if (this.jwtHelper.isTokenExpired(this.jwtHelper.tokenGetter())) {
        localStorage.removeItem(environment.token);
        this.loggedIn.next(false);
      } else {
        this.loggedIn.next(true);
      }
    } else {
      localStorage.removeItem(environment.token);
      this.loggedIn.next(false);
    }

    setInterval(() => {
      if (!!localStorage.getItem(environment.token)) {
        if (this.jwtHelper.isTokenExpired(this.jwtHelper.tokenGetter())) {
          localStorage.removeItem(environment.token);
          this.loggedIn.next(false);
        }
      } else {
        localStorage.removeItem(environment.token);
        this.loggedIn.next(false);
      }
    }, 5000);
  }

  /* Sign in */
  SignIn(email: string, password: string) {
    return this.http.post<RequestResult>(environment.apiUrl + '/UserCredentials/Login',
      { email, password }).toPromise().then(res => {
        if (res.state === 1) {
          localStorage.setItem(environment.token, res.data);
          this.loggedIn.next(true);
        }
        return res;
      },
        error => {
          return error;
        });
  }

  isValidToken(): boolean {
    if (localStorage.getItem(environment.token)) {
      return true;
    }
    return false;
  }

  getToken(): string {
    return localStorage.getItem(environment.token);
  }

  email(): string {
    if (localStorage.getItem(environment.token)) {
      return this.jwtHelper.decodeToken(this.getToken()).nameid;
    }
  }

  id() {
    if (localStorage.getItem(environment.token)) {
      return this.jwtHelper.decodeToken(this.getToken()).unique_name as number;
    }
    return 0;
  }

  /* Sign out */
  SignOut() {
    localStorage.removeItem(environment.token);
    this.loggedIn.next(false);
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userData: Observable<firebase.User>;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private router: Router) {
    this.userData = angularFireAuth.authState;
  }

  /* Sign up */
  SignUp(email: string, password: string) {
    this.angularFireAuth
      .auth
      .createUserWithEmailAndPassword(email, password)
      .then(res => {
        this.router.navigate(['/']);
      })
      .catch(error => {
        console.log('Something is wrong:', error.message);
      });
  }

  /* Sign in */
  SignIn(email: string, password: string) {
    this.angularFireAuth
      .auth
      .signInWithEmailAndPassword(email, password)
      .then(res => {
        this.router.navigate(['/']);
      })
      .catch(err => {
        if (err.code === 'auth/user-not-found') {
          this.SignUp(email, password);
        }
      });
  }

  /* Sign out */
  SignOut() {
    this.angularFireAuth.auth.signOut();
    this.router.navigateByUrl('/');
  }
}

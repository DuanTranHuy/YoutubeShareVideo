import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  email: string;
  password: string;

  constructor(private router: Router, public authService: AuthService) { }

  ngOnInit() {
  }

  signOut() {
    this.authService.SignOut();
  }
  redirectTohome() {
    this.router.navigateByUrl('/');
  }
  loginRegister() {
    return this.authService.SignIn(this.email, this.password);
  }
}

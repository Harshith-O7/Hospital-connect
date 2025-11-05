import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authStorageKey = 'isAuthenticated';
  private readonly adminStorageKey = 'isAdmin';
  
  isAuthenticated = signal<boolean>(false);
  isAdmin = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedAuth = sessionStorage.getItem(this.authStorageKey);
      if (storedAuth === 'true') {
        this.isAuthenticated.set(true);
      }
      const storedAdmin = sessionStorage.getItem(this.adminStorageKey);
      if (storedAdmin === 'true') {
        this.isAdmin.set(true);
      }
    }

    effect(() => {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(this.authStorageKey, this.isAuthenticated().toString());
        sessionStorage.setItem(this.adminStorageKey, this.isAdmin().toString());
      }
    });
  }

  login(username: string, password: string):boolean {
    if (username === 'admin' && password === '123456') {
      this.isAuthenticated.set(true);
      this.isAdmin.set(true);
      return true;
    }
    if (username === 'username' && password === 'password') {
      this.isAuthenticated.set(true);
      this.isAdmin.set(false);
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.isAdmin.set(false);
  }
}
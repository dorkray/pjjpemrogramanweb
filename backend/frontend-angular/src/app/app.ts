import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html' 
})
export class App implements OnInit {
  isAuthPage: boolean = true; 
  
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        this.isAuthPage = event.url.includes('/auth/login') || event.url === '/';
      });
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token'); // Hapus token
      
      // JANGAN gunakan this.router.navigate di sini.
      // Gunakan Vanilla JS window.location.href untuk HARD RELOAD.
      // Ini akan menghancurkan cache memori Angular dan riwayat (history) halaman sebelumnya.
      window.location.href = '/auth/login'; 
    }
  }

}
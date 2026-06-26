import { Component, inject } from '@angular/core';
import { Router } from '@angular/router'; 


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [], 
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'] 
})
export class Landing {
  private router = inject(Router); 

  // Fungsi untuk pindah halaman secara paksa
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
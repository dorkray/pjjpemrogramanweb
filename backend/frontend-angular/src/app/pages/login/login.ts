import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Wajib untuk form input
import { Router } from '@angular/router';
import { ApiService } from '../../services/api'; // Sesuaikan path jika error

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // Daftarkan FormsModule
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private api: ApiService, private router: Router) {}

  onLogin() {
    this.api.login(this.email, this.password).subscribe({
      next: (response: any) => {
        // Jika sukses, simpan token JWT ke localStorage
        localStorage.setItem('token', response.token);
        
        // Simpan info user (opsional)
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Arahkan ke halaman dashboard
        this.router.navigate(['/customers']);
      },
      error: (err: any) => {
        // Jika gagal, tampilkan pesan error dari backend
        this.errorMessage = err.error.message || 'Login gagal. Periksa kembali email dan password Anda.';
      }
    });
  }
}
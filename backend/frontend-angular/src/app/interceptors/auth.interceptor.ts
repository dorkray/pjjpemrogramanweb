import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router'; // 1. Import Router
import { catchError } from 'rxjs/operators'; // 2. Import catchError
import { throwError } from 'rxjs'; // 3. Import throwError

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router); // Inject router agar bisa pindah halaman
  
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }
  }

  // 4. Tangani Response dari Backend
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Jika Token Basi / Ditolak Server
      if (error.status === 401) {
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('token');
        }
        window.location.href = '/auth/login'; // Hard reload ke login
      } 
      // 2. JIKA SERVER MATI / KONEKSI TERPUTUS
      else if (error.status === 0) {
        alert("Koneksi ke Server terputus! Pastikan backend sedang berjalan.");
      }

      return throwError(() => error);
    })
  );
};
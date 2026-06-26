import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router'; 
import { catchError } from 'rxjs/operators'; 
import { throwError } from 'rxjs'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router); 
  
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }
  }

  // Tangani Response dari Backend
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Jika Token Basi / Ditolak Server
      if (error.status === 401) {
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('token');
          // AMAN: Gunakan router bawaan Angular, bukan window.location!
          router.navigate(['/auth/login']); 
        }
      } 
      // 2. JIKA SERVER MATI / KONEKSI TERPUTUS
      else if (error.status === 0) {
        if (isPlatformBrowser(platformId)) {
          // AMAN: alert hanya akan dipanggil jika ini benar-benar di layar browser
          alert("Koneksi ke Server terputus! Pastikan backend sedang berjalan.");
        }
      }

      return throwError(() => error);
    })
  );
};
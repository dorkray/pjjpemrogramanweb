import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // ===================================================================
  // PERBAIKAN: Jika sedang di SERVER (Node.js), loloskan saja dulu!
  // Biarkan Browser nanti yang melakukan pengecekan token yang sesungguhnya.
  // ===================================================================
  if (!isPlatformBrowser(platformId)) {
    return true; 
  }

  // Kode di bawah ini hanya akan dieksekusi jika sudah berada di BROWSER
  const token = localStorage.getItem('token');
  
  if (token) {
    return true; // Punya token? Silakan masuk halaman customers/dashboard
  }

  // Benar-benar tidak punya token di browser? Baru tendang ke login!
  router.navigate(['/auth/login']); 
  return false;
};
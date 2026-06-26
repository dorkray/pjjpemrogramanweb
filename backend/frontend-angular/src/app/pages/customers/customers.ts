import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core'; // Tambahkan Inject & PLATFORM_ID
import { isPlatformBrowser, CommonModule } from '@angular/common'; // Tambahkan isPlatformBrowser
import { ApiService } from '../../services/api';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customers',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
})
export class Customers implements OnInit {
  customers: any[] = [];
  usersList: any[] = [];
  isLoading: boolean = true; 
  errorMessage: string = ''; 

  newCustomer = { name: '', email: '', phone: '', company: '', status: '', created_by: 1 }; // Set default created_by sementara
  isSaving: boolean = false;

  constructor(
    private api: ApiService, 
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // <--- 1. Inject detektor Platform
  ) {}

  userRole: string = '';
  ngOnInit() {
    this.userRole = this.api.getUserRole();
    if (isPlatformBrowser(this.platformId)) {
      // Jika di browser, ambil data dari backend
      this.loadCustomers();
      this.loadUsersList();
    } else {
      // Jika di server, biarkan saja (jangan panggil API agar tidak error 401 di terminal)
      this.isLoading = false; 
    }
  }

  loadCustomers() {
    this.isLoading = true;
    this.api.getCustomers().subscribe({
      next: (res) => {
        let rawData = Array.isArray(res) ? res : (res.data || []);
        this.customers = rawData.sort((a: any, b: any) => a.id - b.id); // Sorting ID
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Gagal ambil data:", err);
        this.errorMessage = "Gagal memuat data pelanggan. Coba login ulang.";
        this.customers = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Fungsi untuk menarik data Users dari API
  loadUsersList() {
    this.api.getUsers().subscribe({
      next: (res: any) => {
        this.usersList = Array.isArray(res) ? res : (res.data || []);
        
        // Bangunkan Angular dan suruh gambar ulang tabel setelah nama-nama User didapatkan!
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Gagal memuat daftar user', err)
    });
  }

  // Fungsi untuk mengekstrak ID dari Token JWT
  getCurrentUserId(): number {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // JWT terdiri dari 3 bagian dipisah titik. Bagian ke-2 adalah payload (data diri)
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.id || payload.userId || 1; // Ambil ID, jika gagal fallback ke 1
        } catch (e) {
          console.error("Gagal membaca token", e);
        }
      }
    }
    return 1; // Fallback jika tidak login
  }

  saveCustomer() {
    // 1. Validasi Nomor Telepon (Hanya Angka)
    const phoneRegex = /^[0-9]+$/;
    if (this.newCustomer.phone && !phoneRegex.test(this.newCustomer.phone)) {
      Swal.fire({ icon: 'error', title: 'Format Salah', text: 'Nomor telepon HANYA boleh berisi angka!' });
      return;
    }

    // 2. Validasi Email (Harus mengandung @ dan . )
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.newCustomer.email && !emailRegex.test(this.newCustomer.email)) {
      Swal.fire({ icon: 'error', title: 'Format Salah', text: 'Format email tidak valid (contoh: budi@gmail.com)!' });
      return;
    }

    if (!this.newCustomer.name) { 
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Nama Customer wajib diisi!' });
      return; 
    }

    this.newCustomer.created_by = this.getCurrentUserId(); // Auto-fill ID Login

    this.isSaving = true;
    this.api.createCustomer(this.newCustomer).subscribe({
      next: () => {
        this.loadCustomers();
        this.isSaving = false;
        this.closeModal('addCustomerModal');
        
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Customer baru telah ditambahkan.', timer: 1500, showConfirmButton: false });
        
        // Reset Form
        this.newCustomer = { name: '', email: '', phone: '', company: '', status: '', created_by: this.getCurrentUserId() };
      },
      error: () => { 
        this.isSaving = false; this.cdr.detectChanges(); 
        Swal.fire('Gagal', 'Gagal menyimpan data customer.', 'error'); 
      }
    });
  }

// 1. Wadah untuk data yang sedang diedit
  editCustomerData: any = { id: null, name: '', email: '', phone: '', company: '', status: '', created_by: 1 };
  isUpdating: boolean = false; // Status loading untuk tombol update

  // 2. Fungsi saat tombol Edit warna biru di tabel diklik
  openEditModal(customer: any) {
    // Kita gunakan teknik "Spread Operator" {...customer} agar data di tabel 
    // tidak ikut berubah saat kita baru ngetik di form (sebelum klik simpan)
    this.editCustomerData = { ...customer }; 

    // Munculkan modal edit menggunakan Vanilla JS Bootstrap
    const modalElement = document.getElementById('editCustomerModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // 3. Fungsi untuk mengirim perubahan ke Backend
  saveEditCustomer() {
    // 1. Validasi Nomor Telepon (Hanya Angka)
    const phoneRegex = /^[0-9]+$/;
    if (this.editCustomerData.phone && !phoneRegex.test(this.editCustomerData.phone)) {
      Swal.fire({ icon: 'error', title: 'Format Salah', text: 'Nomor telepon HANYA boleh berisi angka!' });
      return;
    }

    // 2. Validasi Email (Harus mengandung @ dan . )
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.editCustomerData.email && !emailRegex.test(this.editCustomerData.email)) {
      Swal.fire({ icon: 'error', title: 'Format Salah', text: 'Format email tidak valid (contoh: budi@gmail.com)!' });
      return;
    }

    if (!this.editCustomerData.name) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Nama Customer tidak boleh kosong!' });
      return;
    }

    const payload = {
      id: this.editCustomerData.id,
      name: this.editCustomerData.name,
      email: this.editCustomerData.email,
      phone: this.editCustomerData.phone,
      company: this.editCustomerData.company,
      status: this.editCustomerData.status
    };

    this.isUpdating = true;
    this.api.updateCustomer(this.editCustomerData.id, payload).subscribe({
      next: () => {
        this.loadCustomers();
        this.isUpdating = false;
        this.closeModal('editCustomerModal');
        Swal.fire({ icon: 'success', title: 'Diperbarui!', text: 'Profil customer berhasil diubah.', timer: 1500, showConfirmButton: false });
      },
      error: () => { 
        this.isUpdating = false; this.cdr.detectChanges(); 
        Swal.fire('Gagal', 'Gagal memperbarui profil customer.', 'error'); 
      }
    });
  }

  deleteCustomer(id: number, name: string) {
    Swal.fire({
      title: 'Hapus Customer?',
      text: `Semua data relasi untuk "${name}" juga bisa ikut terhapus!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus permanen!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteCustomer(id).subscribe({
          next: () => { 
            this.loadCustomers(); 
            Swal.fire('Terhapus!', 'Data customer telah dihapus dari sistem.', 'success'); 
          },
          error: () => Swal.fire('Gagal!', 'Gagal menghapus data. Pastikan tidak ada relasi yang terkunci.', 'error')
        });
      }
    });
  }

// Fungsi penerjemah ID User menjadi Nama User
  getUserName(id: any): string {
    if (!this.usersList || !id) return '-';
    const found = this.usersList.find((u: any) => u.id == id);
    return found ? found.name : 'Unknown';
  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
}
import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core'; // Tambahkan Inject & PLATFORM_ID
import { isPlatformBrowser, CommonModule } from '@angular/common'; // Tambahkan isPlatformBrowser
import { ApiService } from '../../services/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
})
export class Customers implements OnInit {
  customers: any[] = [];
  isLoading: boolean = true; 
  errorMessage: string = ''; 

  newCustomer = { name: '', email: '', phone: '', company: '', status: '', created_by: 1 }; // Set default created_by sementara
  isSaving: boolean = false;

  constructor(
    private api: ApiService, 
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // <--- 1. Inject detektor Platform
  ) {}

  ngOnInit() {
    // 2. CEK: Apakah ini berjalan di Browser?
    if (isPlatformBrowser(this.platformId)) {
      // Jika di browser, ambil data dari backend
      this.loadCustomers();
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

  saveCustomer() {
    if (!this.newCustomer.name || !this.newCustomer.email) {
      alert("Nama dan Email wajib diisi!");
      return;
    }

    this.isSaving = true;
    this.api.createCustomer(this.newCustomer).subscribe({
      next: (res) => {
        // Jika sukses, reload tabel agar data baru muncul
        this.loadCustomers();
        // Reset form
        this.newCustomer = { name: '', email: '', phone: '', company: '', status: '', created_by: 1 };
        this.isSaving = false;
        
        // Tutup modal menggunakan Vanilla JS (Cara paling aman di Angular tanpa jQuery)
        const modalElement = document.getElementById('addCustomerModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
      },
      error: (err) => {
        console.error("Gagal simpan data:", err);
        alert("Gagal menyimpan data pelanggan!");
        this.isSaving = false;
        this.cdr.detectChanges();
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
    if (!this.editCustomerData.name || !this.editCustomerData.email) {
      alert("Nama dan Email wajib diisi!");
      return;
    }

    this.isUpdating = true;
    this.api.updateCustomer(this.editCustomerData.id, this.editCustomerData).subscribe({
      next: (res) => {
        // Refresh tabel agar data baru muncul
        this.loadCustomers();
        this.isUpdating = false;
        
        // Tutup modal
        const modalElement = document.getElementById('editCustomerModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
      },
      error: (err) => {
        console.error("Gagal update data:", err);
        alert("Gagal mengubah data pelanggan!");
        this.isUpdating = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteCustomer(id: number, name: string) {
    // 1. Munculkan konfirmasi sebelum menghapus
    const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus pelanggan "${name}"?`);
    
    if (confirmDelete) {
      // 2. Tampilkan efek loading (opsional)
      this.isLoading = true;
      
      // 3. Panggil API untuk menghapus
      this.api.deleteCustomer(id).subscribe({
        next: (res) => {
          alert('Data pelanggan berhasil dihapus!');
          this.loadCustomers(); // Reload tabel agar data langsung hilang
        },
        error: (err) => {
          console.error("Gagal menghapus data:", err);
          alert('Gagal menghapus data. Silakan coba lagi.');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activities.html'
})
export class Activities implements OnInit {
  activities: any[] = [];
  customersList: any[] = [];
  usersList: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  newActivity: any = { customer_id: null, type: 'Call', description: '', activity_date: ''};
  editActivityData: any = { id: null, customer_id: null, type: '', description: '', activity_date: ''};
  
  isSaving: boolean = false;
  isUpdating: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  userRole: string = '';
  ngOnInit() {
    this.userRole = this.api.getUserRole();
    if (isPlatformBrowser(this.platformId)) {
      this.loadActivities();
      this.loadCustomersList();
      this.loadUsersList();
    } else {
      this.isLoading = false;
    }
  }

  loadCustomersList() {
    this.api.getCustomers().subscribe({
      next: (res) => {
        this.customersList = Array.isArray(res) ? res : (res.data || []);
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Gagal memuat list customer", err)
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

  loadActivities() {
    this.isLoading = true;
    this.api.getActivities().subscribe({
      next: (res) => {
        let rawData = Array.isArray(res) ? res : (res.data || []);
        
        // TRIK 1: Gunakan kurung siku dan titik tiga [...] (Spread Operator)
        // Ini memaksa Angular membuat "Array Baru", sehingga tabel otomatis di-refresh!
        this.activities = [...rawData.sort((a: any, b: any) => a.id - b.id)];
        
        this.isLoading = false;
        this.cdr.detectChanges(); // Bangunkan HTML
      },
      error: (err) => {
        this.errorMessage = "Gagal memuat data Activities.";
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
      },
      error: (err) => console.error('Gagal memuat daftar user', err)
    });
  }

 saveActivity() {
    if (!this.newActivity.type || !this.newActivity.customer_id) { 
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Tipe Aktivitas dan Customer wajib diisi!' });
      return; 
    }

    this.newActivity.customer_id = Number(this.newActivity.customer_id);
    this.newActivity.created_by = this.getCurrentUserId(); // Auto-fill ID Login

    this.isSaving = true;
    this.api.createActivity(this.newActivity).subscribe({
      next: () => {
        this.loadActivities();
        this.isSaving = false;
        this.closeModal('addActivityModal');
        
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Aktivitas baru telah dicatat.', timer: 1500, showConfirmButton: false });
        
        // Reset Form
        this.newActivity = { customer_id: null, type: 'Call', description: '', activity_date: '', created_by: this.getCurrentUserId() };
      },
      error: () => { 
        this.isSaving = false; this.cdr.detectChanges(); 
        Swal.fire('Gagal', 'Gagal menyimpan data aktivitas.', 'error'); 
      }
    });
  }

  openEditModal(item: any) {
    // TAMBAHKAN BARIS INI UNTUK NGETES:
    console.log("TOMBOL EDIT BERHASIL DIKLIK! Data yang dibawa:", item);

    this.editActivityData = { ...item };
    if (this.editActivityData.activity_date) {
      this.editActivityData.activity_date = this.editActivityData.activity_date.slice(0, 16);
    }
    this.openModal('editActivityModal');
  }

  saveEditActivity() {
    if (!this.editActivityData.type || !this.editActivityData.customer_id) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Tipe Aktivitas dan Customer tidak boleh kosong!' });
      return;
    }

    const payload = {
      id: this.editActivityData.id,
      customer_id: Number(this.editActivityData.customer_id),
      type: this.editActivityData.type,
      description: this.editActivityData.description,
      activity_date: this.editActivityData.activity_date,
      created_by: Number(this.editActivityData.created_by || 1)
    };

    this.isUpdating = true;
    this.api.updateActivity(this.editActivityData.id, payload).subscribe({
      next: () => {
        // 1. Matikan loading & tutup modal
        this.isUpdating = false;
        this.closeModal('editActivityModal');
        
        // 2. Panggil ulang data dari database
        this.loadActivities();
        
        // TRIK 2: Beritahu Angular bahwa form loading sudah selesai SEKARANG
        this.cdr.detectChanges(); 
        
        // 3. Munculkan SweetAlert
        Swal.fire({ 
          icon: 'success', 
          title: 'Diperbarui!', 
          text: 'Data aktivitas berhasil diubah.', 
          timer: 1500, 
          showConfirmButton: false 
        });
      },
      error: () => { 
        this.isUpdating = false; 
        this.cdr.detectChanges(); 
        Swal.fire('Gagal', 'Gagal memperbarui aktivitas.', 'error'); 
      }
    });
  }

  deleteActivity(id: number, desc: string) {
    Swal.fire({
      title: 'Hapus Aktivitas?',
      text: `Aktivitas "${desc}" akan dihapus permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteActivity(id).subscribe({
          next: () => { 
            this.loadActivities(); 
            Swal.fire('Terhapus!', 'Catatan aktivitas telah dihapus.', 'success'); 
          },
          error: () => Swal.fire('Gagal!', 'Gagal menghapus data.', 'error')
        });
      }
    });
  }

  // Fungsi untuk memunculkan pop-up Bootstrap via TypeScript
 openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    
    if (modalElement) {
      let modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (!modal) {
        modal = new (window as any).bootstrap.Modal(modalElement);
      }
      modal.show();
    } else {
      // INI ALARM JIKA HTML TIDAK COCOK
      console.error(`GAWAT! Modal dengan id="${modalId}" tidak ditemukan di HTML!`);
      alert(`Error: ID Modal "${modalId}" tidak ada di file HTML Anda.`);
    }
  }

// Fungsi penerjemah ID User menjadi Nama User
  getUserName(id: any): string {
    if (!this.usersList || !id) return '-';
    const found = this.usersList.find((u: any) => u.id == id);
    return found ? found.name : 'Unknown';
  }

// Fungsi penerjemah ID Customer menjadi Nama Customer
  getCustomerName(id: any): string {
    if (!this.customersList || !id) return '-';
    const found = this.customersList.find((c: any) => c.id == id);
    return found ? found.name : 'Unknown';
  }

  // Helper penutup modal
  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
}
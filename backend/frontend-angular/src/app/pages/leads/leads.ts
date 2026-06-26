import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leads.html'
})
export class Leads implements OnInit {
  leads: any[] = [];
  customersList: any[] = [];
  usersList: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  newLead = { customer_id: null, title: '', source: '', notes: '', status: 'New', assigned_to: null };
  editLeadData: any = { id: null, customer_id: null, title: '', source: '', notes: '', status: '', assigned_to: null };
  
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
      this.loadLeads();
      this.loadCustomersList();
      if (this.userRole === 'admin' || this.userRole === 'sales') {
      this.loadUsersList();
      }
    } else {
      this.isLoading = false;
    }
  }

  loadCustomersList() {
    this.api.getCustomers().subscribe({
      next: (res) => {
        let rawData = Array.isArray(res) ? res : (res.data || []);
        this.customersList = rawData;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Gagal memuat list customer untuk dropdown", err)
    });
  }

  loadUsersList() {
    this.api.getUsers().subscribe({
      next: (res) => {
        this.usersList = Array.isArray(res) ? res : (res.data || []);
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Gagal memuat list users", err)
    });
  }

  loadLeads() {
    this.isLoading = true;
    this.api.getLeads().subscribe({
      next: (res) => {
        let rawData = Array.isArray(res) ? res : (res.data || []);
        this.leads = rawData.sort((a: any, b: any) => a.id - b.id);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "Gagal memuat data leads.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveLead() {
    if (!this.newLead.title) { 
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Judul Lead wajib diisi!' });
      return; 
    }

    this.isSaving = true;
    this.api.createLead(this.newLead).subscribe({
      next: () => {
        this.loadLeads(); // Refresh tabel
        this.isSaving = false;
        this.closeModal('addLeadModal');

        // POP-UP BERHASIL ADD
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data baru telah sukses disimpan ke database.',
          timer: 1500,
          showConfirmButton: false
        });
        
        // Reset form
        this.newLead = { customer_id: null, title: '', source: '', notes: '', status: 'New', assigned_to: null };
      },
      error: (err) => {
        this.isSaving = false;
        this.cdr.detectChanges();
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: 'Pastikan data yang Anda masukkan valid!' });
      }
    });
  }

  openEditModal(lead: any) {
    this.editLeadData = { ...lead };
    const modalElement = document.getElementById('editLeadModal');
    if (modalElement) new (window as any).bootstrap.Modal(modalElement).show();
  }

  saveEditLead() {
    if (!this.editLeadData.title) { 
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Judul Lead tidak boleh kosong!' });
      return; 
    }

    this.isUpdating = true;
    this.api.updateLead(this.editLeadData.id, this.editLeadData).subscribe({
      next: () => {
        this.loadLeads(); // Refresh tabel
        this.isUpdating = false;
        this.closeModal('editLeadModal');

        // POP-UP BERHASIL EDIT
        Swal.fire({
          icon: 'success',
          title: 'Diperbarui!',
          text: 'Perubahan data berhasil disimpan dengan aman.',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.isUpdating = false;
        this.cdr.detectChanges();
        Swal.fire({ icon: 'error', title: 'Gagal Mengubah', text: 'Koneksi database terputus atau data tidak valid.' });
      }
    });
  }

  deleteLead(id: number, title: string) {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Data "${title}" akan dihapus secara permanen dari server!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus saja!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      // Jika pengguna menekan tombol "Ya, Hapus saja!"
      if (result.isConfirmed) {
        this.api.deleteLead(id).subscribe({
          next: () => {
            this.loadLeads(); // Refresh tabel
            
            // POP-UP BERHASIL DELETE
            Swal.fire({
              icon: 'success',
              title: 'Terhapus!',
              text: 'Data tersebut telah sukses dieliminasi.',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal menghapus data dari sistem.' });
          }
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
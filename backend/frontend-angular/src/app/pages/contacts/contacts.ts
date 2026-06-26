import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.html'
})
export class Contacts implements OnInit {
  contacts: any[] = [];
  customersList: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  newContact: any = { customer_id: null, name: '', email: '', phone: '', position: '' };
  editContactData: any = { id: null, customer_id: null, name: '', email: '', phone: '', position: '' };
  
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
      this.loadContacts();
      this.loadCustomersList();
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

  loadContacts() {
    this.isLoading = true;
    this.api.getContacts().subscribe({
      next: (res) => {
        let rawData = Array.isArray(res) ? res : (res.data || []);
        this.contacts = rawData.sort((a: any, b: any) => a.id - b.id);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "Gagal memuat data contacts.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveContact() {
    // 1. Validasi Nomor Telepon (Hanya Angka)
    const phoneRegex = /^[0-9]+$/;
    if (this.newContact.phone && !phoneRegex.test(this.newContact.phone)) {
      Swal.fire({ icon: 'error', title: 'Format Salah', text: 'Nomor telepon Kontak HANYA boleh berisi angka!' });
      return;
    }

    // 2. Validasi Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.newContact.email && !emailRegex.test(this.newContact.email)) {
      Swal.fire({ icon: 'error', title: 'Format Salah', text: 'Format email tidak valid!' });
      return;
    }

    if (!this.newContact.name) { 
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Nama Kontak wajib diisi!' });
      return; 
    }
    this.newContact.customer_id = Number(this.newContact.customer_id);
    this.isSaving = true;
    this.api.createContact(this.newContact).subscribe({
      next: () => {
        this.loadContacts();
        this.isSaving = false;
        this.closeModal('addContactModal');
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Kontak baru berhasil disimpan.', timer: 1500, showConfirmButton: false });
        this.newContact = { customer_id: null, name: '', email: '', phone: '', position: '' };
      },
      error: () => { this.isSaving = false; this.cdr.detectChanges(); Swal.fire('Gagal', 'Gagal menyimpan data kontak.', 'error'); }
    });
  }

  openEditModal(contact: any) {
    this.editContactData = { ...contact };
    const modalElement = document.getElementById('editContactModal');
    if (modalElement) new (window as any).bootstrap.Modal(modalElement).show();
  }

  saveEditContact() {
    // 1. Validasi Nomor Telepon (Hanya Angka)
    const phoneRegex = /^[0-9]+$/;
    if (this.editContactData.phone && !phoneRegex.test(this.editContactData.phone)) {
      Swal.fire({ icon: 'error', title: 'Format Salah', text: 'Nomor telepon Kontak HANYA boleh berisi angka!' });
      return;
    }

    // 2. Validasi Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.editContactData.email && !emailRegex.test(this.editContactData.email)) {
      Swal.fire({ icon: 'error', title: 'Format Salah', text: 'Format email tidak valid!' });
      return;
    }

    if (!this.editContactData.name) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Nama tidak boleh kosong!' });
      return;
    }
    const payload = {
      id: this.editContactData.id,
      customer_id: Number(this.editContactData.customer_id),
      name: this.editContactData.name,
      email: this.editContactData.email,
      phone: this.editContactData.phone,
      position: this.editContactData.position
    };
    this.isUpdating = true;
    this.api.updateContact(this.editContactData.id, payload).subscribe({
      next: () => {
        this.loadContacts();
        this.isUpdating = false;
        this.closeModal('editContactModal');
        Swal.fire({ icon: 'success', title: 'Diperbarui!', text: 'Data kontak berhasil diubah.', timer: 1500, showConfirmButton: false });
      },
      error: () => { this.isUpdating = false; this.cdr.detectChanges(); Swal.fire('Gagal', 'Gagal memperbarui kontak.', 'error'); }
    });
  }

  deleteContact(id: number, name: string) {
    Swal.fire({
      title: 'Yakin hapus?',
      text: `Kontak "${name}" akan dihapus permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteContact(id).subscribe({
          next: () => { this.loadContacts(); Swal.fire('Terhapus!', 'Kontak telah dihapus.', 'success'); },
          error: () => Swal.fire('Gagal!', 'Gagal menghapus data.', 'error')
        });
      }
    });
  }

// Fungsi penerjemah ID Customer menjadi Nama Customer
  getCustomerName(id: any): string {
    if (!this.customersList || !id) return '-';
    const found = this.customersList.find((c: any) => c.id == id);
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
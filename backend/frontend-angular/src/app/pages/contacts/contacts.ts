import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.html'
})
export class Contacts implements OnInit {
  // 1. PASTIKAN ARRAY INI ADA
  contacts: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  newContact = { customer_id: null, name: '', email: '', phone: '', position: '' };
  editContactData: any = { id: null, customer_id: null, name: '', email: '', phone: '', position: '' };
  
  isSaving: boolean = false;
  isUpdating: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadContacts();
    } else {
      this.isLoading = false;
    }
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
    if (!this.newContact.name) { alert("Nama wajib diisi!"); return; }
    this.isSaving = true;
    this.api.createContact(this.newContact).subscribe({
      next: () => {
        this.loadContacts();
        this.newContact = { customer_id: null, name: '', email: '', phone: '', position: '' };
        this.isSaving = false;
        this.closeModal('addContactModal');
      },
      error: () => { alert("Gagal menyimpan data!"); this.isSaving = false; this.cdr.detectChanges(); }
    });
  }

  openEditModal(contact: any) {
    this.editContactData = { ...contact };
    const modalElement = document.getElementById('editContactModal');
    if (modalElement) new (window as any).bootstrap.Modal(modalElement).show();
  }

  saveEditContact() {
    if (!this.editContactData.name) { alert("Nama wajib diisi!"); return; }
    this.isUpdating = true;
    this.api.updateContact(this.editContactData.id, this.editContactData).subscribe({
      next: () => {
        this.loadContacts();
        this.isUpdating = false;
        this.closeModal('editContactModal');
      },
      error: () => { alert("Gagal mengubah data!"); this.isUpdating = false; this.cdr.detectChanges(); }
    });
  }

  deleteContact(id: number, name: string) {
    if (confirm(`Hapus kontak "${name}"?`)) {
      this.api.deleteContact(id).subscribe({
        next: () => this.loadContacts(),
        error: () => alert('Gagal menghapus data.')
      });
    }
  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
}
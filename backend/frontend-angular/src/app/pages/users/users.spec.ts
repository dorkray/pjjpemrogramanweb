import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html'
})
export class users implements OnInit {
  users: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  newuser = { name: '', email: '', phone: '', status: 'Baru' };
  edituserData: any = { id: null, name: '', email: '', phone: '', status: '' };
  
  isSaving: boolean = false;
  isUpdating: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadusers();
    } else {
      this.isLoading = false;
    }
  }

  loadusers() {
    this.isLoading = true;
    this.api.getUsers().subscribe({
      next: (res) => {
        let rawData = Array.isArray(res) ? res : (res.data || []);
        this.users = rawData.sort((a: any, b: any) => a.id - b.id);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "Gagal memuat data users.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveuser() {
    if (!this.newuser.name) { alert("Nama wajib diisi!"); return; }
    this.isSaving = true;
    this.api.createUser(this.newuser).subscribe({
      next: () => {
        this.loadusers();
        this.newuser = { name: '', email: '', phone: '', status: 'Baru' };
        this.isSaving = false;
        this.closeModal('adduserModal');
      },
      error: () => { alert("Gagal menyimpan data!"); this.isSaving = false; this.cdr.detectChanges(); }
    });
  }

  openEditModal(user: any) {
    this.edituserData = { ...user };
    const modalElement = document.getElementById('edituserModal');
    if (modalElement) new (window as any).bootstrap.Modal(modalElement).show();
  }

  saveEdituser() {
    if (!this.edituserData.name) { alert("Nama wajib diisi!"); return; }
    this.isUpdating = true;
    this.api.updateUser(this.edituserData.id, this.edituserData).subscribe({
      next: () => {
        this.loadusers();
        this.isUpdating = false;
        this.closeModal('edituserModal');
      },
      error: () => { alert("Gagal mengubah data!"); this.isUpdating = false; this.cdr.detectChanges(); }
    });
  }

  deleteuser(id: number, name: string) {
    if (confirm(`Hapus user "${name}"?`)) {
      this.api.deleteUser(id).subscribe({
        next: () => this.loadusers(),
        error: () => alert('Gagal menghapus data.')
      });
    }
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
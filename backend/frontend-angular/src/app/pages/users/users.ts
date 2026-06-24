import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-Users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html'
})
export class Users implements OnInit {
  users: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  newUser = { name: '', email: '', password: '', role: 'staff' };
  editUserData: any = { id: null, name: '', email: '', password: '', role: '' };
  
  isSaving: boolean = false;
  isUpdating: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
    } else {
      this.isLoading = false;
    }
  }

  loadUsers() {
    this.isLoading = true;
    this.api.getUsers().subscribe({
      next: (res) => {
        let rawData = Array.isArray(res) ? res : (res.data || []);
        this.users = rawData.sort((a: any, b: any) => a.id - b.id);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "Gagal memuat data Users.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveUser() {
    if (!this.newUser.name) { alert("Nama wajib diisi!"); return; }
    this.isSaving = true;
    this.api.createUser(this.newUser).subscribe({
      next: () => {
        this.loadUsers();
        // Ubah reset form:
        this.newUser = { name: '', email: '', password: '', role: 'staff' };
        this.isSaving = false;
        this.closeModal('addUserModal');
      },
      error: () => { alert("Gagal menyimpan data!"); this.isSaving = false; this.cdr.detectChanges(); }
    });
  }

  openEditModal(User: any) {
    this.editUserData = { ...User };
    const modalElement = document.getElementById('editUserModal');
    if (modalElement) new (window as any).bootstrap.Modal(modalElement).show();
  }

  saveEditUser() {
    if (!this.editUserData.name) { alert("Nama wajib diisi!"); return; }
    this.isUpdating = true;
    this.api.updateUser(this.editUserData.id, this.editUserData).subscribe({
      next: () => {
        this.loadUsers();
        this.isUpdating = false;
        this.closeModal('editUserModal');
      },
      error: () => { alert("Gagal mengubah data!"); this.isUpdating = false; this.cdr.detectChanges(); }
    });
  }

  deleteUser(id: number, name: string) {
    if (confirm(`Hapus User "${name}"?`)) {
      this.api.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
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
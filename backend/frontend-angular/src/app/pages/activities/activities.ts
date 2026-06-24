import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-Activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activities.html'
})
export class Activities implements OnInit {
  activities: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  newActivity = { customer_id: null, type: 'Call', description: '', activity_date: '', created_by: 1 };
  editActivityData: any = { id: null, customer_id: null, type: '', description: '', activity_date: '', created_by: 1 };
  
  isSaving: boolean = false;
  isUpdating: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadActivities();
    } else {
      this.isLoading = false;
    }
  }

  loadActivities() {
    this.isLoading = true;
    this.api.getActivities().subscribe({
      next: (res) => {
        let rawData = Array.isArray(res) ? res : (res.data || []);
        this.activities = rawData.sort((a: any, b: any) => a.id - b.id);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "Gagal memuat data Activities.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

 saveActivity() {
    // Ubah validasi: karena Activity tidak punya name, kita cek type atau hapus saja validasinya
    if (!this.newActivity.type) { alert("Tipe aktivitas wajib diisi!"); return; }
    
    this.isSaving = true;
    this.api.createActivity(this.newActivity).subscribe({
      next: () => {
        this.loadActivities(); // Pastikan namanya loadActivities
        // Ubah reset form: pastikan isinya sesuai dengan struktur Activity
        this.newActivity = { customer_id: null, type: 'Call', description: '', activity_date: '', created_by: 1 };
        this.isSaving = false;
        this.closeModal('addActivityModal');
      },
      error: () => { alert("Gagal menyimpan data!"); this.isSaving = false; this.cdr.detectChanges(); }
    });
  }

  openEditModal(Activity: any) {
    this.editActivityData = { ...Activity };
    const modalElement = document.getElementById('editActivityModal');
    if (modalElement) new (window as any).bootstrap.Modal(modalElement).show();
  }

  saveEditActivity() {
    if (!this.editActivityData.type) { alert("Tipe aktivitas wajib diisi!"); return; }
    this.isUpdating = true;
    this.api.updateActivity(this.editActivityData.id, this.editActivityData).subscribe({
      next: () => {
        this.loadActivities();
        this.isUpdating = false;
        this.closeModal('editActivityModal');
      },
      error: () => { alert("Gagal mengubah data!"); this.isUpdating = false; this.cdr.detectChanges(); }
    });
  }

  deleteActivity(id: number, name: string) {
    if (confirm(`Hapus Activity "${name}"?`)) {
      this.api.deleteActivity(id).subscribe({
        next: () => this.loadActivities(),
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
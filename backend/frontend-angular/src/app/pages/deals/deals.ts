import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-Deals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deals.html'
})
export class Deals implements OnInit {
  deals: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  newDeal = { lead_id: null, title: '', value: null, stage: 'Proposal', closed_at: '' };
  editDealData: any = { id: null, lead_id: null, title: '', value: null, stage: '', closed_at: '' };
  
  isSaving: boolean = false;
  isUpdating: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDeals();
    } else {
      this.isLoading = false;
    }
  }

  loadDeals() {
    this.isLoading = true;
    this.api.getDeals().subscribe({
      next: (res) => {
        let rawData = Array.isArray(res) ? res : (res.data || []);
        this.deals = rawData.sort((a: any, b: any) => a.id - b.id);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "Gagal memuat data Deals.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveDeal() {
    // Ubah dari newDeal.name menjadi newDeal.title
    if (!this.newDeal.title) { alert("Judul Deal wajib diisi!"); return; }
    
    this.isSaving = true;
    this.api.createDeal(this.newDeal).subscribe({
      next: () => {
        this.loadDeals();
        // Ubah reset form:
        this.newDeal = { lead_id: null, title: '', value: null, stage: 'Proposal', closed_at: '' };
        this.isSaving = false;
        this.closeModal('addDealModal');
      },
      error: () => { alert("Gagal menyimpan data!"); this.isSaving = false; this.cdr.detectChanges(); }
    });
  }

  openEditModal(Deal: any) {
    this.editDealData = { ...Deal };
    const modalElement = document.getElementById('editDealModal');
    if (modalElement) new (window as any).bootstrap.Modal(modalElement).show();
  }

  saveEditDeal() {
    if (!this.editDealData.title) { alert("Judul Deal wajib diisi!"); return; }
    this.isUpdating = true;
    this.api.updateDeal(this.editDealData.id, this.editDealData).subscribe({
      next: () => {
        this.loadDeals();
        this.isUpdating = false;
        this.closeModal('editDealModal');
      },
      error: () => { alert("Gagal mengubah data!"); this.isUpdating = false; this.cdr.detectChanges(); }
    });
  }

  deleteDeal(id: number, name: string) {
    if (confirm(`Hapus Deal "${name}"?`)) {
      this.api.deleteDeal(id).subscribe({
        next: () => this.loadDeals(),
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
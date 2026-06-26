import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Deals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deals.html'
})
export class Deals implements OnInit {
  deals: any[] = [];
  leadsList: any[] = [];
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

  userRole: string = '';
  ngOnInit() {
    this.userRole = this.api.getUserRole();
    if (isPlatformBrowser(this.platformId)) {
      this.loadDeals();
      this.loadLeadsList(); 
    } else {
      this.isLoading = false;
    }
  }

  loadLeadsList() {
    this.api.getLeads().subscribe({
      next: (res) => {
        this.leadsList = Array.isArray(res) ? res : (res.data || []);
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Gagal memuat list leads", err)
    });
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
    if (!this.newDeal.title || !this.newDeal.lead_id) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Title dan Lead wajib diisi/dipilih!' });
      return;
    }
    const payload = {
      lead_id: Number(this.newDeal.lead_id),
      title: this.newDeal.title,
      value: this.newDeal.value ? Number(this.newDeal.value) : null,
      stage: this.newDeal.stage,
      closed_at: this.newDeal.closed_at || null
    };
    this.isSaving = true;
    this.api.createDeal(payload).subscribe({
      next: () => {
        this.loadDeals();
        this.isSaving = false;
        this.closeModal('addDealModal');
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Deal baru berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
        this.newDeal = { lead_id: null, title: '', value: null, stage: 'Proposal', closed_at: '' };
      },
      error: () => { this.isSaving = false; this.cdr.detectChanges(); Swal.fire('Gagal', 'Gagal menambah deal.', 'error'); }
    });
  }

  openEditModal(Deal: any) {
    this.editDealData = { ...Deal };
    const modalElement = document.getElementById('editDealModal');
    if (modalElement) new (window as any).bootstrap.Modal(modalElement).show();
  }

  saveEditDeal() {
    const payload = {
      id: this.editDealData.id,
      lead_id: Number(this.editDealData.lead_id),
      title: this.editDealData.title,
      value: this.editDealData.value ? Number(this.editDealData.value) : null,
      stage: this.editDealData.stage,
      closed_at: this.editDealData.closed_at
    };
    this.isUpdating = true;
    this.api.updateDeal(this.editDealData.id, payload).subscribe({
      next: () => {
        this.loadDeals();
        this.isUpdating = false;
        this.closeModal('editDealModal');
        Swal.fire({ icon: 'success', title: 'Diperbarui!', text: 'Data deal berhasil diperbarui.', timer: 1500, showConfirmButton: false });
      },
      error: () => { this.isUpdating = false; this.cdr.detectChanges(); Swal.fire('Gagal', 'Gagal mengupdate deal.', 'error'); }
    });
  }

  deleteDeal(id: number, title: string) {
    Swal.fire({
      title: 'Hapus Deal?',
      text: `Deal "${title}" akan dihapus permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteDeal(id).subscribe({
          next: () => { this.loadDeals(); Swal.fire('Terhapus!', 'Deal telah dihapus.', 'success'); },
          error: () => Swal.fire('Gagal!', 'Gagal menghapus deal.', 'error')
        });
      }
    });
  }

// Fungsi penerjemah ID Lead menjadi Judul/Nama Lead
  getLeadName(id: any): string {
    if (!this.leadsList || !id) return '-';
    // Sesuaikan found.title dengan nama field di tabel Leads Anda (bisa found.name atau found.title)
    const found = this.leadsList.find((l: any) => l.id == id);
    return found ? found.title : 'Unknown'; 
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
import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leads.html'
})
export class Leads implements OnInit {
  leads: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  newLead = { customer_id: null, title: '', source: '', notes: '', status: 'New', assigned_to: 1 };
  editLeadData: any = { id: null, customer_id: null, title: '', source: '', notes: '', status: '', assigned_to: 1 };
  
  isSaving: boolean = false;
  isUpdating: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeads();
    } else {
      this.isLoading = false;
    }
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
    if (!this.newLead.title) { alert("Judul Lead wajib diisi!"); return; }
    this.isSaving = true;
    this.api.createLead(this.newLead).subscribe({
      next: () => {
        this.loadLeads();
        // Ubah reset form:
        this.newLead = { customer_id: null, title: '', source: '', notes: '', status: 'New', assigned_to: 1 };
        this.isSaving = false;
        this.closeModal('addLeadModal');
      },
      error: () => { alert("Gagal menyimpan data!"); this.isSaving = false; this.cdr.detectChanges(); }
    });
  }

  openEditModal(lead: any) {
    this.editLeadData = { ...lead };
    const modalElement = document.getElementById('editLeadModal');
    if (modalElement) new (window as any).bootstrap.Modal(modalElement).show();
  }

  saveEditLead() {
    if (!this.editLeadData.title) { alert("Judul Lead wajib diisi!"); return; }
    this.isUpdating = true;
    this.api.updateLead(this.editLeadData.id, this.editLeadData).subscribe({
      next: () => {
        this.loadLeads();
        this.isUpdating = false;
        this.closeModal('editLeadModal');
      },
      error: () => { alert("Gagal mengubah data!"); this.isUpdating = false; this.cdr.detectChanges(); }
    });
  }

  deleteLead(id: number, name: string) {
    if (confirm(`Hapus lead "${name}"?`)) {
      this.api.deleteLead(id).subscribe({
        next: () => this.loadLeads(),
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
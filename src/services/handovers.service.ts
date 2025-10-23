import { supabase } from './supabase';
import { Handover, CreateHandoverInput, HandoverStatus } from '../types';

export const handoversService = {
  async createHandover(input: CreateHandoverInput): Promise<Handover> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Générer un QR code unique
    const qrCode = this.generateQRCode(input.reservation_id, input.type);

    const { data, error } = await supabase
      .from('handovers')
      .insert({
        ...input,
        qr_code: qrCode,
        status: 'pending'
      })
      .select(`
        *,
        reservation:reservations(
          *,
          object:objects(*),
          renter:profiles!reservations_renter_id_fkey(*),
          owner:profiles!reservations_owner_id_fkey(*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getHandoversByReservation(reservationId: string): Promise<Handover[]> {
    const { data, error } = await supabase
      .from('handovers')
      .select(`
        *,
        reservation:reservations(
          *,
          object:objects(*),
          renter:profiles!reservations_renter_id_fkey(*),
          owner:profiles!reservations_owner_id_fkey(*)
        )
      `)
      .eq('reservation_id', reservationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getHandoversByUser(): Promise<Handover[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('handovers')
      .select(`
        *,
        reservation:reservations(
          *,
          object:objects(*),
          renter:profiles!reservations_renter_id_fkey(*),
          owner:profiles!reservations_owner_id_fkey(*)
        )
      `)
      .or(`reservation.renter_id.eq.${user.id},reservation.owner_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateHandoverStatus(
    handoverId: string, 
    status: HandoverStatus,
    notes?: string
  ): Promise<Handover> {
    const { data, error } = await supabase
      .from('handovers')
      .update({
        status,
        actual_date: new Date().toISOString(),
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', handoverId)
      .select(`
        *,
        reservation:reservations(
          *,
          object:objects(*),
          renter:profiles!reservations_renter_id_fkey(*),
          owner:profiles!reservations_owner_id_fkey(*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async scanQRCode(qrCode: string): Promise<Handover | null> {
    const { data, error } = await supabase
      .from('handovers')
      .select(`
        *,
        reservation:reservations(
          *,
          object:objects(*),
          renter:profiles!reservations_renter_id_fkey(*),
          owner:profiles!reservations_owner_id_fkey(*)
        )
      `)
      .eq('qr_code', qrCode)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  generateQRCode(reservationId: string, type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${type}_${reservationId}_${timestamp}_${random}`;
  },

  async getHandoverById(id: string): Promise<Handover | null> {
    const { data, error } = await supabase
      .from('handovers')
      .select(`
        *,
        reservation:reservations(
          *,
          object:objects(*),
          renter:profiles!reservations_renter_id_fkey(*),
          owner:profiles!reservations_owner_id_fkey(*)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteHandover(id: string): Promise<void> {
    const { error } = await supabase
      .from('handovers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getHandoversByStatus(status: HandoverStatus): Promise<Handover[]> {
    const { data, error } = await supabase
      .from('handovers')
      .select(`
        *,
        reservation:reservations(
          *,
          object:objects(*),
          renter:profiles!reservations_renter_id_fkey(*),
          owner:profiles!reservations_owner_id_fkey(*)
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getHandoversByType(type: 'pickup' | 'return'): Promise<Handover[]> {
    const { data, error } = await supabase
      .from('handovers')
      .select(`
        *,
        reservation:reservations(
          *,
          object:objects(*),
          renter:profiles!reservations_renter_id_fkey(*),
          owner:profiles!reservations_owner_id_fkey(*)
        )
      `)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
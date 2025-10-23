import { supabase } from './supabase';
import { Reservation, CreateReservationInput } from '../types';

export const reservationsService = {
  async getReservations(): Promise<Reservation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        object:objects(*),
        renter:profiles!reservations_renter_id_fkey(*),
        owner:profiles!reservations_owner_id_fkey(*)
      `)
      .or(`renter_id.eq.${user.id},owner_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getReservationById(id: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        object:objects(*),
        renter:profiles!reservations_renter_id_fkey(*),
        owner:profiles!reservations_owner_id_fkey(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getReservationsAsRenter(): Promise<Reservation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        object:objects(*),
        owner:profiles!reservations_owner_id_fkey(*),
        handovers:handovers(*)
      `)
      .eq('renter_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getReservationsAsOwner(): Promise<Reservation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        object:objects(*),
        renter:profiles!reservations_renter_id_fkey(*),
        handovers:handovers(*)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createReservation(input: CreateReservationInput): Promise<Reservation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        ...input,
        renter_id: user.id,
        status: 'pending'
      })
      .select(`
        *,
        object:objects(*),
        renter:profiles!reservations_renter_id_fkey(*),
        owner:profiles!reservations_owner_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateReservation(
    id: string,
    updates: Partial<Reservation>
  ): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        object:objects(*),
        renter:profiles!reservations_renter_id_fkey(*),
        owner:profiles!reservations_owner_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async cancelReservation(id: string): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async acceptReservation(id: string): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        object:objects(*),
        renter:profiles!reservations_renter_id_fkey(*),
        owner:profiles!reservations_owner_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async rejectReservation(id: string): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        object:objects(*),
        renter:profiles!reservations_renter_id_fkey(*),
        owner:profiles!reservations_owner_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async confirmReservation(id: string, stripePaymentIntent: string): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'confirmed',
        stripe_payment_intent: stripePaymentIntent,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        object:objects(*),
        renter:profiles!reservations_renter_id_fkey(*),
        owner:profiles!reservations_owner_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  calculateTotalPrice(pricePerDay: number, startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return pricePerDay * days;
  }
};

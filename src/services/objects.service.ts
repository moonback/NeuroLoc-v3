import { supabase } from './supabase';
import { RentalObject, CreateObjectInput, UpdateObjectInput, SearchFilters } from '../types';

export const objectsService = {
  async getObjects(filters?: SearchFilters): Promise<RentalObject[]> {
    let query = supabase
      .from('objects')
      .select(`
        *,
        owner:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'available');
    }

    if (filters?.min_price !== undefined) {
      query = query.gte('price_per_day', filters.min_price);
    }

    if (filters?.max_price !== undefined) {
      query = query.lte('price_per_day', filters.max_price);
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getObjectById(id: string): Promise<RentalObject | null> {
    const { data, error } = await supabase
      .from('objects')
      .select(`
        *,
        owner:profiles(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getObjectsByOwner(ownerId: string): Promise<RentalObject[]> {
    const { data, error } = await supabase
      .from('objects')
      .select(`
        *,
        owner:profiles(*)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createObject(input: CreateObjectInput): Promise<RentalObject> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('objects')
      .insert({
        ...input,
        owner_id: user.id
      })
      .select(`
        *,
        owner:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateObject(id: string, updates: UpdateObjectInput): Promise<RentalObject> {
    const { data, error } = await supabase
      .from('objects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        owner:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteObject(id: string): Promise<void> {
    const { error } = await supabase
      .from('objects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadObjectImages(objectId: string, files: File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${objectId}-${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `objects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('objects')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('objects')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  },

  async checkAvailability(
    objectId: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('reservations')
      .select('id')
      .eq('object_id', objectId)
      .in('status', ['confirmed', 'ongoing'])
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (error) throw error;
    return !data || data.length === 0;
  }
};

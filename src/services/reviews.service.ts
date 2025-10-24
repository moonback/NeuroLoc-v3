import { supabase } from './supabase';
import { Review, CreateReviewInput } from '../types';

export const reviewsService = {
  async getReviewsByUserId(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(*),
        reviewed:profiles!reviews_reviewed_id_fkey(*),
        reservation:reservations(*, object:objects(*))
      `)
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getReviewsByReservationId(reservationId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(*),
        reviewed:profiles!reviews_reviewed_id_fkey(*),
        reservation:reservations(*, object:objects(*))
      `)
      .eq('reservation_id', reservationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createReview(input: CreateReviewInput): Promise<Review> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        reservation_id: input.reservation_id,
        reviewer_id: user.id,
        reviewed_id: input.reviewed_id,
        rating: input.rating,
        comment: input.comment || null
      })
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(*),
        reviewed:profiles!reviews_reviewed_id_fkey(*),
        reservation:reservations(*, object:objects(*))
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateReview(reviewId: string, updates: Partial<CreateReviewInput>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(*),
        reviewed:profiles!reviews_reviewed_id_fkey(*),
        reservation:reservations(*, object:objects(*))
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReview(reviewId: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  async getAverageRating(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    return sum / data.length;
  },

  async getRatingStats(userId: string): Promise<{
    average: number;
    total: number;
    distribution: { [key: number]: number };
  }> {
    const reviews = await this.getReviewsByUserId(userId);
    
    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;

    const distribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });

    // S'assurer que toutes les notes de 1 à 5 sont présentes
    for (let i = 1; i <= 5; i++) {
      if (!distribution[i]) {
        distribution[i] = 0;
      }
    }

    return {
      average,
      total: reviews.length,
      distribution
    };
  }
};

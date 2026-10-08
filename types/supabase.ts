/**
 * Mirrors supabase/migrations/20261008110600_add_friends_and_duels.sql.
 * Replace this file after the project is linked:
 * npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          momentum_score: number;
          current_streak: number;
          leaderboard_visibility: 'private' | 'friends' | 'public';
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          momentum_score?: number;
          current_streak?: number;
          leaderboard_visibility?: 'private' | 'friends' | 'public';
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          momentum_score?: number;
          current_streak?: number;
          leaderboard_visibility?: 'private' | 'friends' | 'public';
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: 'pending' | 'accepted' | 'blocked';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: 'pending' | 'accepted' | 'blocked';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: 'pending' | 'accepted' | 'blocked';
          created_at?: string;
        };
        Relationships: [];
      };
      duels: {
        Row: {
          id: string;
          challenger_id: string;
          opponent_id: string;
          status: 'pending' | 'active' | 'completed';
          start_date: string;
          end_date: string;
          winner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenger_id: string;
          opponent_id: string;
          status?: 'pending' | 'active' | 'completed';
          start_date: string;
          end_date: string;
          winner_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenger_id?: string;
          opponent_id?: string;
          status?: 'pending' | 'active' | 'completed';
          start_date?: string;
          end_date?: string;
          winner_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

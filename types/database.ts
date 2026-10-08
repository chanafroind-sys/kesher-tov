export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CompanyCategory =
  | "hitech"
  | "government"
  | "banking"
  | "health"
  | "education"
  | "other";

export type HelperRelation =
  | "current_employee"
  | "past_employee"
  | "close_connection";

export type TaskStatus =
  | "open"
  | "in_progress"
  | "closed"
  | "cancelled"
  | "expired";

export type ClaimStatus = "claimed" | "marked_done" | "cancelled";

export type ThanksStatus =
  | "pending_first_salary"
  | "ready_to_pay"
  | "paid"
  | "waived";

export type RatingType =
  | "match_accuracy"
  | "reply_responsiveness"
  | "fair_closing";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          city: string | null;
          field: string | null;
          years_of_experience: number;
          cv_storage_path: string | null;
          payment_preference: Json;
          invited_by: string | null;
          is_blocked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          city?: string | null;
          field?: string | null;
          years_of_experience?: number;
          cv_storage_path?: string | null;
          payment_preference?: Json;
          invited_by?: string | null;
          is_blocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          city?: string | null;
          field?: string | null;
          years_of_experience?: number;
          cv_storage_path?: string | null;
          payment_preference?: Json;
          invited_by?: string | null;
          is_blocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      invites: {
        Row: {
          id: string;
          code: string;
          inviter_id: string;
          max_uses: number;
          used_count: number;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          inviter_id: string;
          max_uses?: number;
          used_count?: number;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          inviter_id?: string;
          max_uses?: number;
          used_count?: number;
          expires_at?: string;
          created_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name_he: string;
          name_en: string | null;
          website_domain: string | null;
          category: CompanyCategory;
          parent_company_id: string | null;
          helper_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_he: string;
          name_en?: string | null;
          website_domain?: string | null;
          category?: CompanyCategory;
          parent_company_id?: string | null;
          helper_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_he?: string;
          name_en?: string | null;
          website_domain?: string | null;
          category?: CompanyCategory;
          parent_company_id?: string | null;
          helper_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_aliases: {
        Row: {
          id: string;
          company_id: string;
          alias: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          alias: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          alias?: string;
          created_at?: string;
        };
      };
      helper_links: {
        Row: {
          id: string;
          helper_id: string;
          company_id: string;
          relation: HelperRelation;
          help_types: string[];
          is_muted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          helper_id: string;
          company_id: string;
          relation: HelperRelation;
          help_types?: string[];
          is_muted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          helper_id?: string;
          company_id?: string;
          relation?: HelperRelation;
          help_types?: string[];
          is_muted?: boolean;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          seeker_id: string;
          company_id: string;
          help_types: string[];
          job_url: string | null;
          free_text: string | null;
          thanks_amount: number;
          status: TaskStatus;
          closed_helper_id: string | null;
          closed_at: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seeker_id: string;
          company_id: string;
          help_types?: string[];
          job_url?: string | null;
          free_text?: string | null;
          thanks_amount?: number;
          status?: TaskStatus;
          closed_helper_id?: string | null;
          closed_at?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seeker_id?: string;
          company_id?: string;
          help_types?: string[];
          job_url?: string | null;
          free_text?: string | null;
          thanks_amount?: number;
          status?: TaskStatus;
          closed_helper_id?: string | null;
          closed_at?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_matches: {
        Row: {
          id: string;
          task_id: string;
          requirements: Json;
          score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          requirements?: Json;
          score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          requirements?: Json;
          score?: number;
          created_at?: string;
        };
      };
      task_claims: {
        Row: {
          id: string;
          task_id: string;
          helper_id: string;
          status: ClaimStatus;
          claimed_at: string;
          done_at: string | null;
        };
        Insert: {
          id?: string;
          task_id: string;
          helper_id: string;
          status?: ClaimStatus;
          claimed_at?: string;
          done_at?: string | null;
        };
        Update: {
          id?: string;
          task_id?: string;
          helper_id?: string;
          status?: ClaimStatus;
          claimed_at?: string;
          done_at?: string | null;
        };
      };
      thanks: {
        Row: {
          id: string;
          task_id: string;
          seeker_id: string;
          helper_id: string;
          amount: number;
          status: ThanksStatus;
          paid_at: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          seeker_id: string;
          helper_id: string;
          amount?: number;
          status?: ThanksStatus;
          paid_at?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          seeker_id?: string;
          helper_id?: string;
          amount?: number;
          status?: ThanksStatus;
          paid_at?: string | null;
          note?: string | null;
          created_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          task_id: string;
          rater_id: string;
          rated_id: string;
          type: RatingType;
          score: number;
          flag_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          rater_id: string;
          rated_id: string;
          type: RatingType;
          score: number;
          flag_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          rater_id?: string;
          rated_id?: string;
          type?: RatingType;
          score?: number;
          flag_reason?: string | null;
          created_at?: string;
        };
      };
      email_action_tokens: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          payload: Json;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          payload?: Json;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          payload?: Json;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
      };
      notifications_outbox: {
        Row: {
          id: string;
          event_type: string;
          task_id: string | null;
          actor_id: string | null;
          payload: Json;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          event_type: string;
          task_id?: string | null;
          actor_id?: string | null;
          payload?: Json;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          event_type?: string;
          task_id?: string | null;
          actor_id?: string | null;
          payload?: Json;
          created_at?: string;
          processed_at?: string | null;
        };
      };
    };
    Functions: {
      claim_task: {
        Args: { p_task_id: string };
        Returns: { ok: boolean; data?: { task_id: string; status: string }; error?: string };
      };
      close_task: {
        Args: { p_task_id: string; p_helper_id?: string | null };
        Returns: { ok: boolean; data?: { task_id: string; status: string }; error?: string };
      };
      search_companies: {
        Args: { p_query: string; p_limit?: number };
        Returns: {
          id: string;
          name_he: string;
          name_en: string | null;
          website_domain: string | null;
          category: CompanyCategory;
          helper_count: number;
          similarity: number;
        }[];
      };
      redeem_invite: {
        Args: { p_code: string; p_full_name?: string | null };
        Returns: { ok: boolean; data?: { profile_id: string; invited_by: string }; error?: string };
      };
    };
  };
}

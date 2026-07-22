export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          plan: string;
          profile_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          plan?: string;
          profile_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          plan?: string;
          profile_key?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      workspace_members: {
        Row: {
          workspace_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          workspace_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          workspace_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      invitations: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          role: string;
          token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          role?: string;
          token?: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string;
          role?: string;
          token?: string;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          }
        ];
      };
      social_accounts: {
        Row: {
          id: string;
          workspace_id: string;
          provider: string;
          platform: string;
          account_name: string | null;
          external_id: string | null;
          access_token_enc: string | null;
          refresh_token_enc: string | null;
          token_expires_at: string | null;
          status: string;
          connected_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          provider?: string;
          platform: string;
          account_name?: string | null;
          external_id?: string | null;
          access_token_enc?: string | null;
          refresh_token_enc?: string | null;
          token_expires_at?: string | null;
          status?: string;
          connected_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          provider?: string;
          platform?: string;
          account_name?: string | null;
          external_id?: string | null;
          access_token_enc?: string | null;
          refresh_token_enc?: string | null;
          token_expires_at?: string | null;
          status?: string;
          connected_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_accounts_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_accounts_connected_by_fkey";
            columns: ["connected_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          id: string;
          workspace_id: string;
          author_id: string | null;
          caption: string | null;
          platform_captions: Json;
          status: string;
          approval_comment: string | null;
          scheduled_at: string | null;
          published_at: string | null;
          repeat_interval: number | null;
          brief_json: Json | null;
          visual_prompts: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          author_id?: string | null;
          caption?: string | null;
          platform_captions?: Json;
          status?: string;
          approval_comment?: string | null;
          scheduled_at?: string | null;
          published_at?: string | null;
          repeat_interval?: number | null;
          brief_json?: Json | null;
          visual_prompts?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          author_id?: string | null;
          caption?: string | null;
          platform_captions?: Json;
          status?: string;
          approval_comment?: string | null;
          scheduled_at?: string | null;
          published_at?: string | null;
          repeat_interval?: number | null;
          brief_json?: Json | null;
          visual_prompts?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      post_targets: {
        Row: {
          id: string;
          post_id: string;
          social_account_id: string | null;
          platform: string;
          external_post_id: string | null;
          publish_status: string;
          error_message: string | null;
          retry_count: number | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          social_account_id?: string | null;
          platform: string;
          external_post_id?: string | null;
          publish_status?: string;
          error_message?: string | null;
          retry_count?: number | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          social_account_id?: string | null;
          platform?: string;
          external_post_id?: string | null;
          publish_status?: string;
          error_message?: string | null;
          retry_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "post_targets_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_targets_social_account_id_fkey";
            columns: ["social_account_id"];
            isOneToOne: false;
            referencedRelation: "social_accounts";
            referencedColumns: ["id"];
          }
        ];
      };
      post_media: {
        Row: {
          id: string;
          post_id: string;
          storage_path: string;
          media_type: string;
          order_index: number | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          storage_path: string;
          media_type: string;
          order_index?: number | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          storage_path?: string;
          media_type?: string;
          order_index?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          workspace_id: string;
          provider: string | null;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          plan: string;
          status: string;
          current_period_end: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          provider?: string | null;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          plan?: string;
          status?: string;
          current_period_end?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          provider?: string | null;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          plan?: string;
          status?: string;
          current_period_end?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: true;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_member: {
        Args: { w: string };
        Returns: boolean;
      };
      member_role: {
        Args: { w: string };
        Returns: string;
      };
      create_workspace: {
        Args: { ws_name: string; ws_slug: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ads: {
        Row: {
          created_at: string;
          cta: string | null;
          eyebrow: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          placement: string;
          sort_order: number;
          sponsor: string | null;
          subtitle: string | null;
          title: string;
          variant: string;
        };
        Insert: {
          created_at?: string;
          cta?: string | null;
          eyebrow?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          placement?: string;
          sort_order?: number;
          sponsor?: string | null;
          subtitle?: string | null;
          title: string;
          variant?: string;
        };
        Update: {
          created_at?: string;
          cta?: string | null;
          eyebrow?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          placement?: string;
          sort_order?: number;
          sponsor?: string | null;
          subtitle?: string | null;
          title?: string;
          variant?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          author: string | null;
          author_id: string | null;
          body: string | null;
          category: string | null;
          category_id: string | null;
          category_slug: string | null;
          created_at: string;
          dek: string | null;
          district_id: string | null;
          excerpt: string | null;
          id: string;
          image_url: string | null;
          is_impact: boolean;
          publish_at: string | null;
          slug: string;
          status: string;
          title: string;
          updated_at: string;
          video_url: string | null;
          sub_district_id: string | null;
          reporter_id: string | null;
          approval_status: string;
          approved_by: string | null;
          approved_at: string | null;
        };
        Insert: {
          author_id?: string | null;
          category_id?: string | null;
          content?: string | null;
          created_at?: string;
          district_id?: string | null;
          excerpt?: string | null;
          id?: string;
          image_url?: string | null;
          is_impact?: boolean;
          publish_at?: string | null;
          slug: string;
          status?: string;
          title: string;
          updated_at?: string;
          video_url?: string | null;
          sub_district_id?: string | null;
          reporter_id?: string | null;
          approval_status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
        };
        Update: {
          author_id?: string | null;
          category_id?: string | null;
          content?: string | null;
          created_at?: string;
          district_id?: string | null;
          excerpt?: string | null;
          id?: string;
          image_url?: string | null;
          is_impact?: boolean;
          publish_at?: string | null;
          slug?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          video_url?: string | null;
          sub_district_id?: string | null;
          reporter_id?: string | null;
          approval_status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_sub_district_id_fkey";
            columns: ["sub_district_id"];
            isOneToOne: false;
            referencedRelation: "sub_districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "reporters";
            referencedColumns: ["id"];
          },
        ];
      };
      reporters: {
        Row: {
          id: string;
          name: string;
          email: string;
          mobile_number: string | null;
          aadhaar_number: string | null;
          pan_number: string | null;
          youtube_link: string | null;
          linkedin_link: string | null;
          instagram_link: string | null;
          profile_image: string | null;
          status: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          mobile_number?: string | null;
          aadhaar_number?: string | null;
          pan_number?: string | null;
          youtube_link?: string | null;
          linkedin_link?: string | null;
          instagram_link?: string | null;
          profile_image?: string | null;
          status?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          mobile_number?: string | null;
          aadhaar_number?: string | null;
          pan_number?: string | null;
          youtube_link?: string | null;
          linkedin_link?: string | null;
          instagram_link?: string | null;
          profile_image?: string | null;
          status?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reporters_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      homepage_hero: {
        Row: {
          id: string;
          article_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "homepage_hero_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
      homepage_breaking: {
        Row: {
          id: string;
          article_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "homepage_breaking_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
      homepage_top10: {
        Row: {
          id: string;
          article_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "homepage_top10_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          icon: string | null;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          status: boolean;
        };
        Insert: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          status?: boolean;
        };
        Update: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          status?: boolean;
        };
        Relationships: [];
      };
      district_categories: {
        Row: {
          category_id: string;
          district_id: string;
          id: string;
        };
        Insert: {
          category_id: string;
          district_id: string;
          id?: string;
        };
        Update: {
          category_id?: string;
          district_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "district_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "district_categories_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
        ];
      };
      districts: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          name: string;
          slug: string;
          sort_order: number;
          status: boolean;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          name: string;
          slug: string;
          sort_order?: number;
          status?: boolean;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          name?: string;
          slug?: string;
          sort_order?: number;
          status?: boolean;
        };
        Relationships: [];
      };
      sub_districts: {
        Row: {
          created_at: string;
          id: string;
          jila_id: string;
          name: string;
          slug: string;
          status: boolean;
        };
        Insert: {
          created_at?: string;
          id?: string;
          jila_id: string;
          name: string;
          slug: string;
          status?: boolean;
        };
        Update: {
          created_at?: string;
          id?: string;
          jila_id?: string;
          name?: string;
          slug?: string;
          status?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "sub_districts_jila_id_fkey";
            columns: ["jila_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
        ];
      };
      homepage_sections: {
        Row: {
          article_limit: number;
          category_id: string | null;
          created_at: string;
          id: string;
          sort_order: number;
          status: boolean;
          title_english: string;
          title_hindi: string;
        };
        Insert: {
          article_limit?: number;
          category_id?: string | null;
          created_at?: string;
          id?: string;
          sort_order?: number;
          status?: boolean;
          title_english: string;
          title_hindi: string;
        };
        Update: {
          article_limit?: number;
          category_id?: string | null;
          created_at?: string;
          id?: string;
          sort_order?: number;
          status?: boolean;
          title_english?: string;
          title_hindi?: string;
        };
        Relationships: [
          {
            foreignKeyName: "homepage_sections_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      shakhsiyat: {
        Row: {
          created_at: string;
          description: string | null;
          designation: string;
          id: string;
          image: string;
          name: string;
          quote: string;
          sort_order: number;
          status: boolean;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          designation: string;
          id?: string;
          image: string;
          name: string;
          quote: string;
          sort_order?: number;
          status?: boolean;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          designation?: string;
          id?: string;
          image?: string;
          name?: string;
          quote?: string;
          sort_order?: number;
          status?: boolean;
        };
        Relationships: [];
      };
      impact_items: {
        Row: {
          color: string | null;
          created_at: string;
          id: string;
          image_url: string | null;
          is_done: boolean;
          sort_order: number;
          tag: string;
          title: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_done?: boolean;
          sort_order?: number;
          tag: string;
          title: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_done?: boolean;
          sort_order?: number;
          tag?: string;
          title?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      reels: {
        Row: {
          created_at: string;
          duration: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          platform: string | null;
          sort_order: number;
          title: string;
          video_url: string | null;
          views: string | null;
        };
        Insert: {
          created_at?: string;
          duration?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          platform?: string | null;
          sort_order?: number;
          title: string;
          video_url?: string | null;
          views?: string | null;
        };
        Update: {
          created_at?: string;
          duration?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          platform?: string | null;
          sort_order?: number;
          title?: string;
          video_url?: string | null;
          views?: string | null;
        };
        Relationships: [];
      };
      show_episodes: {
        Row: {
          created_at: string;
          description: string | null;
          episode_number: number | null;
          id: string;
          image_url: string | null;
          is_featured: boolean;
          publish_at: string | null;
          schedule: string | null;
          season_number: number | null;
          sort_order: number;
          status: boolean;
          subtitle: string | null;
          title: string;
          youtube_url: string | null;
          youtube_video_id: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          episode_number?: number | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean;
          publish_at?: string | null;
          schedule?: string | null;
          season_number?: number | null;
          sort_order?: number;
          status?: boolean;
          subtitle?: string | null;
          title: string;
          youtube_url?: string | null;
          youtube_video_id?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          episode_number?: number | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean;
          publish_at?: string | null;
          schedule?: string | null;
          season_number?: number | null;
          sort_order?: number;
          status?: boolean;
          subtitle?: string | null;
          title?: string;
          youtube_url?: string | null;
          youtube_video_id?: string | null;
        };
        Relationships: [];
      };
      ticker_items: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          sort_order: number;
          text: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          sort_order?: number;
          text: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          sort_order?: number;
          text?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "editor" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
    },
  },
} as const;

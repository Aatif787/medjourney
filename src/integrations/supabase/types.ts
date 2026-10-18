export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          is_sample: boolean;
          kind: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_sample?: boolean;
          kind?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_sample?: boolean;
          kind?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      doctor_hospitals: {
        Row: {
          doctor_id: string;
          hospital_id: string;
        };
        Insert: {
          doctor_id: string;
          hospital_id: string;
        };
        Update: {
          doctor_id?: string;
          hospital_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_hospitals_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "doctor_hospitals_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      doctor_specialties: {
        Row: {
          category_id: string;
          doctor_id: string;
        };
        Insert: {
          category_id: string;
          doctor_id: string;
        };
        Update: {
          category_id?: string;
          doctor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_specialties_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "doctor_specialties_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
        ];
      };
      doctor_treatments: {
        Row: {
          doctor_id: string;
          treatment_id: string;
        };
        Insert: {
          doctor_id: string;
          treatment_id: string;
        };
        Update: {
          doctor_id?: string;
          treatment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_treatments_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "doctor_treatments_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      doctors: {
        Row: {
          consultation_details: string | null;
          created_at: string;
          experience_years: number | null;
          id: string;
          is_featured: boolean;
          is_sample: boolean;
          languages: string[];
          name: string;
          photo_url: string | null;
          profile: string | null;
          qualifications: string[];
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: Database["public"]["Enums"]["pub_status"];
          title: string | null;
          updated_at: string;
          verification_status: Database["public"]["Enums"]["verification_status"];
        };
        Insert: {
          consultation_details?: string | null;
          created_at?: string;
          experience_years?: number | null;
          id?: string;
          is_featured?: boolean;
          is_sample?: boolean;
          languages?: string[];
          name: string;
          photo_url?: string | null;
          profile?: string | null;
          qualifications?: string[];
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["pub_status"];
          title?: string | null;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Update: {
          consultation_details?: string | null;
          created_at?: string;
          experience_years?: number | null;
          id?: string;
          is_featured?: boolean;
          is_sample?: boolean;
          languages?: string[];
          name?: string;
          photo_url?: string | null;
          profile?: string | null;
          qualifications?: string[];
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["pub_status"];
          title?: string | null;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          assigned_coordinator: string | null;
          consent: boolean;
          country: string;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          internal_notes: string | null;
          is_sample: boolean;
          message: string | null;
          next_follow_up: string | null;
          phone: string | null;
          preferred_contact: string;
          source: string;
          status: Database["public"]["Enums"]["enquiry_status"];
          treatment_id: string | null;
          treatment_interest: string | null;
          updated_at: string;
        };
        Insert: {
          assigned_coordinator?: string | null;
          consent?: boolean;
          country: string;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          internal_notes?: string | null;
          is_sample?: boolean;
          message?: string | null;
          next_follow_up?: string | null;
          phone?: string | null;
          preferred_contact?: string;
          source?: string;
          status?: Database["public"]["Enums"]["enquiry_status"];
          treatment_id?: string | null;
          treatment_interest?: string | null;
          updated_at?: string;
        };
        Update: {
          assigned_coordinator?: string | null;
          consent?: boolean;
          country?: string;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          internal_notes?: string | null;
          is_sample?: boolean;
          message?: string | null;
          next_follow_up?: string | null;
          phone?: string | null;
          preferred_contact?: string;
          source?: string;
          status?: Database["public"]["Enums"]["enquiry_status"];
          treatment_id?: string | null;
          treatment_interest?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enquiries_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      hospital_specialties: {
        Row: {
          category_id: string;
          hospital_id: string;
        };
        Insert: {
          category_id: string;
          hospital_id: string;
        };
        Update: {
          category_id?: string;
          hospital_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hospital_specialties_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hospital_specialties_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
        ];
      };
      hospital_treatments: {
        Row: {
          hospital_id: string;
          treatment_id: string;
        };
        Insert: {
          hospital_id: string;
          treatment_id: string;
        };
        Update: {
          hospital_id?: string;
          treatment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hospital_treatments_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hospital_treatments_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      hospitals: {
        Row: {
          accreditations: Json;
          address: string | null;
          city: string | null;
          country: string | null;
          cover_url: string | null;
          created_at: string;
          email: string | null;
          facilities: string[];
          gallery: string[];
          id: string;
          international_services: string[];
          is_featured: boolean;
          is_sample: boolean;
          logo_url: string | null;
          name: string;
          overview: string | null;
          phone: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: Database["public"]["Enums"]["pub_status"];
          updated_at: string;
          website: string | null;
        };
        Insert: {
          accreditations?: Json;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          cover_url?: string | null;
          created_at?: string;
          email?: string | null;
          facilities?: string[];
          gallery?: string[];
          id?: string;
          international_services?: string[];
          is_featured?: boolean;
          is_sample?: boolean;
          logo_url?: string | null;
          name: string;
          overview?: string | null;
          phone?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["pub_status"];
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          accreditations?: Json;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          cover_url?: string | null;
          created_at?: string;
          email?: string | null;
          facilities?: string[];
          gallery?: string[];
          id?: string;
          international_services?: string[];
          is_featured?: boolean;
          is_sample?: boolean;
          logo_url?: string | null;
          name?: string;
          overview?: string | null;
          phone?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["pub_status"];
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      media: {
        Row: {
          alt: string | null;
          created_at: string;
          file_name: string | null;
          id: string;
          storage_path: string | null;
          updated_at: string;
          url: string;
        };
        Insert: {
          alt?: string | null;
          created_at?: string;
          file_name?: string | null;
          id?: string;
          storage_path?: string | null;
          updated_at?: string;
          url: string;
        };
        Update: {
          alt?: string | null;
          created_at?: string;
          file_name?: string | null;
          id?: string;
          storage_path?: string | null;
          updated_at?: string;
          url?: string;
        };
        Relationships: [];
      };
      post_hospitals: {
        Row: {
          hospital_id: string;
          post_id: string;
        };
        Insert: {
          hospital_id: string;
          post_id: string;
        };
        Update: {
          hospital_id?: string;
          post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_hospitals_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_hospitals_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_treatments: {
        Row: {
          post_id: string;
          treatment_id: string;
        };
        Insert: {
          post_id: string;
          treatment_id: string;
        };
        Update: {
          post_id?: string;
          treatment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_treatments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_treatments_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          author_name: string | null;
          category_id: string | null;
          content: string;
          created_at: string;
          excerpt: string | null;
          featured_image: string | null;
          featured_image_alt: string | null;
          id: string;
          is_sample: boolean;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: Database["public"]["Enums"]["pub_status"];
          tags: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          author_name?: string | null;
          category_id?: string | null;
          content?: string;
          created_at?: string;
          excerpt?: string | null;
          featured_image?: string | null;
          featured_image_alt?: string | null;
          id?: string;
          is_sample?: boolean;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["pub_status"];
          tags?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          author_name?: string | null;
          category_id?: string | null;
          content?: string;
          created_at?: string;
          excerpt?: string | null;
          featured_image?: string | null;
          featured_image_alt?: string | null;
          id?: string;
          is_sample?: boolean;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["pub_status"];
          tags?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          address: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          footer_note: string | null;
          id: number;
          logo_url: string | null;
          site_name: string;
          tagline: string | null;
          updated_at: string;
          whatsapp: string | null;
        };
        Insert: {
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          footer_note?: string | null;
          id?: number;
          logo_url?: string | null;
          site_name?: string;
          tagline?: string | null;
          updated_at?: string;
          whatsapp?: string | null;
        };
        Update: {
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          footer_note?: string | null;
          id?: number;
          logo_url?: string | null;
          site_name?: string;
          tagline?: string | null;
          updated_at?: string;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      treatments: {
        Row: {
          category_id: string | null;
          created_at: string;
          disclaimer: string | null;
          faqs: Json;
          id: string;
          is_sample: boolean;
          name: string;
          overview: string | null;
          price_currency: string | null;
          price_from: number | null;
          price_note: string | null;
          procedures: string[];
          seo_description: string | null;
          seo_title: string | null;
          show_price: boolean;
          slug: string;
          status: Database["public"]["Enums"]["pub_status"];
          summary: string | null;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          disclaimer?: string | null;
          faqs?: Json;
          id?: string;
          is_sample?: boolean;
          name: string;
          overview?: string | null;
          price_currency?: string | null;
          price_from?: number | null;
          price_note?: string | null;
          procedures?: string[];
          seo_description?: string | null;
          seo_title?: string | null;
          show_price?: boolean;
          slug: string;
          status?: Database["public"]["Enums"]["pub_status"];
          summary?: string | null;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          disclaimer?: string | null;
          faqs?: Json;
          id?: string;
          is_sample?: boolean;
          name?: string;
          overview?: string | null;
          price_currency?: string | null;
          price_from?: number | null;
          price_note?: string | null;
          procedures?: string[];
          seo_description?: string | null;
          seo_title?: string | null;
          show_price?: boolean;
          slug?: string;
          status?: Database["public"]["Enums"]["pub_status"];
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treatments_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
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
      grant_staff_role: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] };
        Returns: undefined;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
      list_staff: {
        Args: never;
        Returns: {
          created_at: string;
          email: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        }[];
      };
      revoke_staff_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: "admin" | "coordinator";
      enquiry_status:
        | "new"
        | "contacted"
        | "awaiting_information"
        | "under_review"
        | "quotation_ready"
        | "follow_up"
        | "closed";
      pub_status: "draft" | "published";
      verification_status: "unverified" | "pending" | "verified";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "coordinator"],
      enquiry_status: [
        "new",
        "contacted",
        "awaiting_information",
        "under_review",
        "quotation_ready",
        "follow_up",
        "closed",
      ],
      pub_status: ["draft", "published"],
      verification_status: ["unverified", "pending", "verified"],
    },
  },
} as const;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PatientStatus = "active" | "inactive" | "archived";
export type TransactionType = "medical" | "aesthetic" | "cosmetic";
export type PaymentMethod = "cash" | "card" | "transfer";
export type ExpenseCategory = "supplies" | "equipment" | "rent" | "utilities" | "marketing" | "other";
export type TreatmentType = "medical" | "aesthetic" | "cosmetic";

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          first_visit_date: string;
          status: PatientStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          first_visit_date?: string;
          status?: PatientStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          first_visit_date?: string;
          status?: PatientStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          type: TreatmentType;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: TreatmentType;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: TreatmentType;
          description?: string | null;
          created_at?: string;
        };
      };
      treatments: {
        Row: {
          id: string;
          name: string;
          code: string;
          category_id: string;
          type: TreatmentType;
          base_price: number;
          base_time_mins: number;
          complexity_score: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          category_id: string;
          type: TreatmentType;
          base_price: number;
          base_time_mins?: number;
          complexity_score?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          category_id?: string;
          type?: TreatmentType;
          base_price?: number;
          base_time_mins?: number;
          complexity_score?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          date: string;
          patient_id: string;
          total_amount: number;
          cash_amount: number;
          card_amount: number;
          transfer_amount: number;
          medical_amount: number;
          aesthetic_amount: number;
          cosmetic_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          patient_id: string;
          total_amount: number;
          cash_amount?: number;
          card_amount?: number;
          transfer_amount?: number;
          medical_amount?: number;
          aesthetic_amount?: number;
          cosmetic_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          patient_id?: string;
          total_amount?: number;
          cash_amount?: number;
          card_amount?: number;
          transfer_amount?: number;
          medical_amount?: number;
          aesthetic_amount?: number;
          cosmetic_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          treatment_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          treatment_id: string;
          quantity?: number;
          unit_price: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          treatment_id?: string;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
          created_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_name: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          supplier_id: string;
          cost_price: number;
          sale_price: number;
          margin_pct: number;
          stock: number;
          min_stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          supplier_id: string;
          cost_price: number;
          sale_price: number;
          margin_pct?: number;
          stock?: number;
          min_stock?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          supplier_id?: string;
          cost_price?: number;
          sale_price?: number;
          margin_pct?: number;
          stock?: number;
          min_stock?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          date: string;
          supplier_id: string | null;
          category: ExpenseCategory;
          description: string;
          amount: number;
          iva_amount: number;
          total_amount: number;
          invoice_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          supplier_id?: string | null;
          category: ExpenseCategory;
          description: string;
          amount: number;
          iva_amount?: number;
          total_amount?: number;
          invoice_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          supplier_id?: string | null;
          category?: ExpenseCategory;
          description?: string;
          amount?: number;
          iva_amount?: number;
          total_amount?: number;
          invoice_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      patient_status: PatientStatus;
      transaction_type: TransactionType;
      payment_method: PaymentMethod;
      expense_category: ExpenseCategory;
      treatment_type: TreatmentType;
    };
  };
}

// Utility types
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Treatment = Database["public"]["Tables"]["treatments"]["Row"];
export type TreatmentInsert = Database["public"]["Tables"]["treatments"]["Insert"];

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

export type TransactionItem = Database["public"]["Tables"]["transaction_items"]["Row"];
export type TransactionItemInsert = Database["public"]["Tables"]["transaction_items"]["Insert"];

export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];

// Extended types with relations
export interface TransactionWithDetails extends Transaction {
  patient: Patient;
  items: Array<TransactionItem & { treatment: Treatment }>;
}

export interface TreatmentWithCategory extends Treatment {
  category: Category;
}

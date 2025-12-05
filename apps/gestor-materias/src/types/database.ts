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
      materias: {
        Row: {
          id: string;
          nombre: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      logs: {
        Row: {
          id?: string;
          modulo: string;
          log: string;
          Code: '' | 'CREATE' | 'UPDATE' | 'DELETE';
          fecha: string;
        };
        Insert: {
          id?: string;
          modulo: string;
          log: string;
          Code: '' | 'CREATE' | 'UPDATE' | 'DELETE';
          fecha: string;
        };
        Update: {
          id?: string;
          modulo?: string;
          log?: string;
          Code?: '' | 'CREATE' | 'UPDATE' | 'DELETE';
          fecha?: string;
        };
      };
    };
  };
}

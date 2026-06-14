import type { Models } from 'appwrite';

declare module 'appwrite' {
  export interface Databases {
    listRows<T = any>(databaseId: string, tableId: string, queries?: string[]): Promise<{ total: number; rows: T[] }>;
    getRow<T = any>(databaseId: string, tableId: string, rowId: string, queries?: string[]): Promise<T>;
    createRow<T = any>(databaseId: string, tableId: string, rowId: string, data: any, permissions?: string[]): Promise<T>;
    updateRow<T = any>(databaseId: string, tableId: string, rowId: string, data: any, permissions?: string[]): Promise<T>;
    deleteRow(databaseId: string, tableId: string, rowId: string): Promise<{}>;
  }

  export namespace Models {
    export interface Row {
      $id: string;
      $createdAt: string;
      $updatedAt: string;
      $permissions: string[];
      [key: string]: any;
    }
  }
}

declare module 'node-appwrite' {
  export interface Databases {
    listRows<T = any>(databaseId: string, tableId: string, queries?: any[]): Promise<{ total: number; rows: T[] }>;
    getRow<T = any>(databaseId: string, tableId: string, rowId: string, queries?: any[]): Promise<T>;
    createRow<T = any>(databaseId: string, tableId: string, rowId: string, data: any, permissions?: string[]): Promise<T>;
    updateRow<T = any>(databaseId: string, tableId: string, rowId: string, data: any, permissions?: string[]): Promise<T>;
    deleteRow(databaseId: string, tableId: string, rowId: string): Promise<{}>;
  }

  export namespace Models {
    export interface Row {
      $id: string;
      $createdAt: string;
      $updatedAt: string;
      $permissions: string[];
      [key: string]: any;
    }
  }
}

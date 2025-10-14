
// user 
export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  gender: boolean | null;
  status: boolean | null;
}

// category 
export type Category = {
  id: number;
  name: string;
  imageUrl?: string;
  status: boolean;
};


//regitstter
export interface AuthState {
  user: any;
  loading: boolean;
  successMessage: string;
  errorMessage: string 
}

// admin manager user 
export interface UserManagerState {
  users: User[];
  totalPages: number;
  loading: boolean;
  error: string | null;
}   

export interface ITransaction {
  amount: any;
  note: string;
  monthId: number | undefined;
  id: number;
  createdDate: string;
  total: number;
  description: string;
  categoryId: number;
  monthlycategoryId: number;
}

export interface IMonthlyCategory {
  id: number;
  month: string;
  totalBudget: number;
  categories?: { id: number; categoryId: number; budget: number }[];
}

export interface FinanceState {
  monthlycategories: IMonthlyCategory[];
  transactions: ITransaction[];
  selectedMonth: string;
  currentMonthData: IMonthlyCategory | null;
  remaining: number;
  warningMessage: string;
  loading: boolean;
  error: string | null;
}






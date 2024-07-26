export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface RegisterData extends LoginData {
    firstName: string;
    lastName: string;
  }
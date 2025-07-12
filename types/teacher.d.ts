export interface Qualification {
  name: string;
  rate: number;
}

export interface Teacher {
  name: string;
  role: string;
  birthDate?: string;
  email: string;
  phone: string;
  address: string;
  privateQualifications: Qualification[];
  groupQualifications: Qualification[];
}

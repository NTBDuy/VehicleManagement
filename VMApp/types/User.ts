export enum role {
  Administrator = 0,
  Employee = 1,
  Manager = 2,
}

export default interface User {
  userId: number;
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: role;
  status: boolean;
  createdAt?: string;
  lastUpdateAt?: string;
}
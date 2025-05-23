export enum role {
  Administrator = 0,
  Employee = 1,
  Manager = 2,
}

export default interface User {
  UserId: number;
  Username: string;
  PasswordHash: string;
  FullName: string;
  Email: string;
  Phone: string;
  Role: role;
  Status: boolean;
  CreateAt?: string;
  LastUpdateAt?: string;
}
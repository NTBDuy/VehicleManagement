import UserLogged from "./UserLogged";

export interface LoginResponse {
  token: string;
  user: UserLogged
}
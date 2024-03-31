export interface ICreateUserData {
  firstname: string;
  surname: string;
  email: string;
  hashedPassword: string;
  attributes: {};
}

export interface IUser {
  _id: string;
  firstname: string;
  surname: string;
  email: string;
  password: string;
}

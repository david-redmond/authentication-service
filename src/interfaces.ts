// Base user properties that are common across all user interfaces
export interface IUser {
    email: string;
    phone: string;  
    firstName: string;
    surname: string;
    companies: string[];
    image: string;
    attributes: IUserAttributes;
  }
  
  // User attributes for extended functionality
  export interface IUserAttributes {
    [key: string]: any;
  }

  export interface IUserRegister extends IUser {
    password: string;
  }

  export interface IUserLogin {
    email: string;
    password: string;
  }

  export interface IUserLoginFacebook {
    email: string;
    provider: string;
    providerId: string;
  }
  
  

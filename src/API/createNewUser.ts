import axios from "axios";
import { ICreateUserData } from "./interfaces";

async function createNewUser({
  firstname,
  surname,
  email,
  hashedPassword,
}: ICreateUserData) {
  try {
    const userService = process.env.USER_SERVICE || "missing";
    const url = `${userService}/`;
    const data: ICreateUserData = {
      firstname,
      surname,
      email,
      hashedPassword,
      attributes: {}
    };
    const response = await axios.post(url, data);
    console.log("Success createNewUser:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error createNewUser:",
      error.code,
      error.message,
      error.config,
    );
    throw error;
  }
}

export default createNewUser;

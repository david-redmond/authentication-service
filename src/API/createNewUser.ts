import axios from "axios";
import {ICreateUserData} from "./interfaces";

async function createNewUser({firstname, surname, email, hashedPassword}: ICreateUserData) {
    try {
        const userService = process.env.USER_SERVICE || "missing";

        const url = `${userService}/create`;

        const data: ICreateUserData= {
            firstname,
            surname,
            email,
            hashedPassword
        };

        const response = await axios.post(url, data);

        console.log('Success createNewUser:', response.data);
        return response.data
    } catch (error) {
        // Log any errors
        console.error('Error createNewUser:', error);
        return null;
    }
};

export default createNewUser;
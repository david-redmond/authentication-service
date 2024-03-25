import axios from "axios";
import {IUser} from "./interfaces";

async function checkUserByEmail(email: string): Promise<IUser> {
    try {
        const userService = process.env.USER_SERVICE || "missing";

        const url = `${userService}/check`;

        const data = {
            email: email
        };

        // Send POST request using Axios with async/await
        const response = await axios.post(url, data);

        console.log('Success checkUserByEmail:', response.data);
        return response.data
    } catch (error) {
        // Log any errors
        console.error('Error checkUserByEmail:', error.code, error.message);
        return null;
    }
};

export default checkUserByEmail;
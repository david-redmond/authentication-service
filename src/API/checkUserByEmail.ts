import axios from "axios";

async function checkUserByEmail(email: string) {
    try {
        const userService = process.env.USER_SERVICE || "missing";

        const url = `${userService}/`;

        const data = {
            email: email
        };

        // Send POST request using Axios with async/await
        const response = await axios.post(url, data);

        console.log('Success checkUserByEmail:', response.data);
        return response.data
    } catch (error) {
        // Log any errors
        console.error('Error checkUserByEmail:', error);
        return null;
    }
};

export default checkUserByEmail;
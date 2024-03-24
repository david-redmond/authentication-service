import * as express from "express";
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as dotenv from "dotenv";
import * as bodyParser from 'body-parser';
import createNewUser from "./API/createNewUser";
import checkUserByEmail from "./API/checkUserByEmail";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY || "---";

app.use(bodyParser.json());

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const { firstname, surname, email, password } = req.body;
        // Check if user already exists
        const existingUser = await checkUserByEmail(email);
        if (!!existingUser) return res.status(400).send('User already exists.');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await createNewUser({
            firstname,
            surname,
            email,
            hashedPassword
        });

        res.status(201).send('User registered successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error.');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await checkUserByEmail(email);
        if (!user) return res.status(400).send('Invalid email or password.');

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).send('Invalid email or password.');

        // Generate JWT token
        const token = jwt.sign({ _id: user._id }, secretKey);
        res.header('Authorization', token).send('Login successful.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error.');
    }
});

app.listen(port, () => {
    console.log(`Server running on PORT: ${port}`);
});

import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import createNewUser from "./API/createNewUser";
import checkUserByEmail from "./API/checkUserByEmail";
import { IUser } from "./API/interfaces";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY || "---";

app.use(bodyParser.json());
app.use(cors());

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    const { firstname, surname, email, password } = req.body;
    // Check if user already exists
    const existingUser: IUser | null = await checkUserByEmail(email);
    if (!!existingUser) {
      return res.status(400).send("User already exists.");
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create new user
      await createNewUser({
        firstname,
        surname,
        email,
        hashedPassword,
      });
      return res.status(201).send("User registered successfully.");
    }
  } catch (error) {
    console.error("Error POST /register :", error.code, error.message);
    res.status(500).send("Server error.");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user: IUser = await checkUserByEmail(email);
    if (!user) {
      console.log("POST /login: user doesn't exist.");
      return res.status(400).send("Invalid email or password.");
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("POST /login: Invalid password.");
      return res.status(400).send("Invalid email or password.");
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, secretKey);
    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .json({ message: "Login successful.", user });
  } catch (error) {
    console.error(
      "Error POST /login :",
      error.code,
      error.message,
      error.config,
    );
    res.status(500).send("Server error.");
  }
});

app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});

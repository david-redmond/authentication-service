import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { IUser } from "./models/User";
import { mongoConnection } from "./database/connection";
import { User } from "./models/User";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
mongoConnection();

// Register endpoint
app.post("/auth/register", async (req, res) => {
  try {

    const user: IUser | null = await User.findOne({ email: req.body.email });
    if (!!user) {
      console.error(
        "Error POST /register : user already exists",
        req.body.email,
      );
      return res.status(403).send("Forbidden");
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      // Create new user
      const newUser = new User({
        firstname: req.body.firstname,
        surname: req.body.surname,
        email: req.body.email,
        provider: "native",
        password: hashedPassword,
        attributes: {},
      });
      await newUser.save();
      const { _id, firstname, surname, provider, email } = newUser;
      const token = jwt.sign(
        { _id, firstname, surname, email, provider },
        process.env.SECRET_KEY,
      );

      // Send the token to the client
      return res
        .header("x-auth-token", token)
        .header("access-control-expose-headers", "x-auth-token")
        .status(201)
        .send("User registered successfully.");
    }
  } catch (error) {
    console.error("Error POST /register :", error);
    res.status(500).send("Server error.");
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      console.error("POST /auth/login : user doesn't exist", req.body.email);
      return res.status(400).send("Invalid email or password.");
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("POST /auth/login: Invalid password.");
      return res.status(400).send("Invalid email or password.");
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .status(202)
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

app.post("/auth/facebook", async (req, res) => {
  const { email, name, picture } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new user
      const splitname = name.split(" ");
      const newUser = {
        firstname: splitname[0] || "Firstname",
        surname: splitname[1] || "Surname",
        email,
        provider: "facebook",
        attributes: {
          picture,
        },
      };
      user = new User(newUser);
      await user.save();
    } else {
      await user.save();
    }

    // Generate JWT token
    const { _id, firstname, surname, provider } = user;
    const token = jwt.sign(
      { _id, firstname, surname, email, provider },
      process.env.SECRET_KEY,
    );

    // Send the token to the client
    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .status(201)
      .json({ message: "Login successful.", user });
  } catch (error) {
    console.error("Error during Facebook login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});

import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { IUserRegister, IUserLogin } from "./interfaces";
import { mongoConnection } from "./database/connection";
import { User } from "./models/User";
import * as process from "process";

config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
if (process.env.LOCAL) {
  app.use(cors({
    origin: 'http://localhost:8000', // Replace with your frontend origin
    credentials: true
  }));

// Set Content Security Policy (CSP) header
  app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; connect-src 'self' http://localhost:4200; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://cdn.jsdelivr.net"
    );
    next();
  });
} else {
  app.use(cors());
}

mongoConnection();

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self' http://localhost:4200");
  next();
});

// Register endpoint
app.post("/auth/register", async (req, res) => {
  try {
    const userData: IUserRegister = req.body;
    
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.error("Error POST /register : user already exists", userData.email);
      return res.status(403).send("Forbidden");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user
    const newUser = new User({
      email: userData.email,
      phone: userData.phone,
      firstName: userData.firstName,
      surname: userData.surname,
      companies: userData.companies || [],
      image: userData.image,
      provider: "native",
      password: hashedPassword,
      attributes: userData.attributes || {},
    });

    await newUser.save();
    
    const { _id, firstName, surname, provider, email, phone, image, companies, attributes } = newUser;
    const token = jwt.sign(
      { id: _id, firstName, surname, email, provider, phone, image, companies, attributes },
      process.env.SECRET_KEY,
    );

    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .status(201)
      .send("User registered successfully.");
  } catch (error) {
    console.error("Error POST /register :", error);
    res.status(500).send("Server error.");
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const loginData: IUserLogin = req.body;
    const { email, password } = loginData;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.error("POST /auth/login : user doesn't exist", email);
      return res.status(400).send("Invalid email or password.");
    }

    if (user.provider === "facebook") {
      console.error("POST /auth/login : user is a facebook user", email);
      return res.status(403).send("Invalid email, password or provider.");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("POST /auth/login: Invalid password.");
      return res.status(400).send("Invalid email or password.");
    }

    const token = jwt.sign(
      { 
        id: user._id,
        firstName: user.firstName,
        surname: user.surname,
        email: user.email,
        provider: user.provider,
        phone: user.phone,
        image: user.image,
        companies: user.companies,
        attributes: user.attributes
      }, 
      process.env.SECRET_KEY
    );

    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .status(202)
      .json({ 
        message: "Login successful."
      });
  } catch (error) {
    console.error("Error POST /login :", error);
    res.status(500).send("Server error.");
  }
});

app.post("/auth/facebook", async (req, res) => {
  try {
    const { email, name, picture } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      const splitname = name.split(" ");
      const newUser = new User({
        email,
        phone: "", // Required field, set empty for now
        firstName: splitname[0] || "Firstname",
        surname: splitname[1] || "Surname",
        companies: [], // Required field, set empty array
        image: picture,
        provider: "facebook",
        attributes: {
          picture,
        },
      });
      user = await newUser.save();
    }

    const { _id, firstName, surname, provider, phone, image, companies, attributes  } = user;
    const token = jwt.sign(
      { id: _id, firstName, surname, email, provider, phone, image, companies, attributes  },
      process.env.SECRET_KEY,
    );

    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .status(201)
      .json({ 
        message: "Login successful."
      });
  } catch (error) {
    console.error("Error during Facebook login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});

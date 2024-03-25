import axios from "axios";
import createNewUser from "./createNewUser";

// Mocking Axios
jest.mock("axios");

describe("createNewUser function", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new user successfully", async () => {
    // Mocking Axios.post to return a successful response
    (
      axios.post as jest.MockedFunction<typeof axios.post>
    ).mockResolvedValueOnce({ data: { id: 1 } });

    const userData = {
      firstname: "John",
      surname: "Doe",
      email: "john@example.com",
      hashedPassword: "hashedPassword",
    };

    const response = await createNewUser(userData);

    expect(response).toEqual({ id: 1 });
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/"),
      userData,
    );
  });

  it("should throw an error when creating a new user fails", async () => {
    // Mocking Axios.post to return a rejected promise
    (
      axios.post as jest.MockedFunction<typeof axios.post>
    ).mockRejectedValueOnce(new Error("Failed to create user"));

    const userData = {
      firstname: "John",
      surname: "Doe",
      email: "john@example.com",
      hashedPassword: "hashedPassword",
    };

    await expect(createNewUser(userData)).rejects.toThrow(
      "Failed to create user",
    );

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/"),
      userData,
    );
  });
});

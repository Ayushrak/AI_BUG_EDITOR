import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

// Simple in-memory user store (replace with database in production)
const users: Map<
  string,
  { email: string; password: string; name: string; id: string }
> = new Map();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signup(payload: AuthPayload): Promise<{ user: User; token: string }> {
    const { email, password, name } = payload;

    // Check if user exists
    const existingUser = Array.from(users.values()).find(
      (u) => u.email === email,
    );
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create new user (in production, hash password with bcrypt)
    const userId = `user_${Date.now()}`;
    users.set(userId, {
      id: userId,
      email,
      password, // In production: hash this
      name: name || email.split("@")[0],
    });

    const token = this.jwtService.sign({ sub: userId, email });
    return {
      user: { id: userId, email, name: name || email.split("@")[0] },
      token,
    };
  }

  async login(payload: AuthPayload): Promise<{ user: User; token: string }> {
    const { email, password } = payload;

    // Find user
    const user = Array.from(users.values()).find((u) => u.email === email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check password (in production: use bcrypt.compare)
    if (user.password !== password) {
      throw new Error("Invalid credentials");
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      const user = users.get(payload.sub);
      if (!user) {
        throw new Error("User not found");
      }
      return { id: user.id, email: user.email, name: user.name };
    } catch (e) {
      throw new Error("Invalid token");
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const user = users.get(id);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  }
}

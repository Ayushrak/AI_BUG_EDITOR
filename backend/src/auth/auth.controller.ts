import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Headers,
} from "@nestjs/common";
import { AuthService, type User } from "./auth.service";

@Controller("api/v1/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  async signup(
    @Body() body: { email: string; password: string; name?: string },
  ): Promise<{ user: User; token: string }> {
    try {
      if (!body.email || !body.password) {
        throw new BadRequestException("Email and password are required");
      }
      return await this.authService.signup(body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post("login")
  async login(
    @Body() body: { email: string; password: string },
  ): Promise<{ user: User; token: string }> {
    try {
      if (!body.email || !body.password) {
        throw new BadRequestException("Email and password are required");
      }
      return await this.authService.login(body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post("verify")
  async verify(@Body() body: { token: string }): Promise<{ user: User }> {
    try {
      if (!body.token) {
        throw new BadRequestException("Token is required");
      }
      const user = await this.authService.verifyToken(body.token);
      return { user };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get("me")
  async getMe(
    @Headers("authorization") authHeader: string,
  ): Promise<{ user: User }> {
    try {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new BadRequestException("Authorization header required");
      }
      const token = authHeader.substring(7);
      const user = await this.authService.verifyToken(token);
      return { user };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}

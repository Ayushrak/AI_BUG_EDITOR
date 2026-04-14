import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateDeveloperDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsIn(["junior", "mid", "senior", "lead"])
  role!: "junior" | "mid" | "senior" | "lead";

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

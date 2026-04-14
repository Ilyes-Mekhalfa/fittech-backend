/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
export class loginDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}

export class forgetPasswordDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

export class resetPasswordDTO {
  @IsNotEmpty()
  readonly resetToken: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly confirmPassword: string;
}

/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsString,
  IsEnum,
} from 'class-validator';
export class loginDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}

export class registerDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  @IsNotEmpty()
  @Matches(/ANX-[0-9]{4}/, {
    message: 'Annex code must follow the format',
  })
  readonly annexCode: string;

  @IsNotEmpty()
  @IsString()
  readonly annexName: string;

  @IsNotEmpty()
  @IsString()
  readonly annexLocation: string;

  @Matches(/^\+?[1-9]\d{1,10}$/, {
    message: 'phone number must be valid',
  })
  readonly phone: string;

  @IsNotEmpty()
  @IsEnum(['ADMIN', 'MANAGER'])
  readonly role: string;
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

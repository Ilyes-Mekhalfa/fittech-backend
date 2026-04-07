/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, MinLength } from 'class-validator';
export class loginDTO {
  @IsNotEmpty()
  @MinLength(4)
  readonly code: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}

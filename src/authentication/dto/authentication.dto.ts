/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, MinLength } from 'class-validator';
export class loginDTO {
  @IsNotEmpty()
  @MinLength(4)
  readonly annexId: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly annexName: string;
}

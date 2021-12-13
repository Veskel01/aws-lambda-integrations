import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

// types
import { AccessKeysType } from '../../UserAccess/UserAccess.types';

import { OneOfAccessKey } from '../../CustomValidators/OneOfAccessKeys.validator';

export class UserAccessDto {
  @IsNotEmpty()
  @IsString()
  githubName: string;
  @IsArray()
  @OneOfAccessKey()
  accessKeys: AccessKeysType[];
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;
}

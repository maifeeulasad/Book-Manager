import { IsString, IsOptional, IsDateString } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";

export class CreateAuthorDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}

export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {}

import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The surname of the user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty({
    description: 'The username chosen by the user',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The birthdate of the user',
    example: '1990-01-01',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsNotEmpty()
  birthdate: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

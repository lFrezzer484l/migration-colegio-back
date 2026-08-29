import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {

    @IsEmail()
    @IsNotEmpty()
    institutionalEmail!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

}
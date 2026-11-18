import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'Giới thiệu không được để trống' })
  instroduction: string;

  @IsString()
  status: string = "WAITING";

  @IsOptional()
  @IsString()
  cvUrl?: string;

}

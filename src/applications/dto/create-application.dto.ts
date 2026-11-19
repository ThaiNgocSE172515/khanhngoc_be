import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên ứng viên' })
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @ApiProperty({ example: '0901234567', description: 'Số điện thoại' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @ApiProperty({ example: 'ungvien@example.com', description: 'Email ứng viên' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ example: 'Quận 1, TP. Hồ Chí Minh', description: 'Địa chỉ' })
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @ApiProperty({
    example: 'Có 2 năm kinh nghiệm làm việc với BIM / Revit...',
    description: 'Giới thiệu bản thân',
  })
  @IsString()
  @IsNotEmpty({ message: 'Giới thiệu không được để trống' })
  instroduction: string;

  @ApiPropertyOptional({
    example: 'WAITING',
    default: 'WAITING',
    description: 'Trạng thái hồ sơ',
  })
  @IsString()
  @IsOptional()
  status: string = 'WAITING';

  @ApiPropertyOptional({
    example: 'cvs/1700000000-cv.pdf',
    description: 'Đường dẫn hoặc key file CV (nếu không upload file trực tiếp)',
  })
  @IsOptional()
  @IsString()
  cvUrl?: string;
}
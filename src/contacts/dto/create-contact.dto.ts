import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ContactTypeEnum {
  CONTACT = 'CONTACT',
  PROFILE = 'PROFILE',
}

export class CreateContactDto {
  @ApiPropertyOptional({ enum: ContactTypeEnum, default: ContactTypeEnum.CONTACT })
  @IsEnum(ContactTypeEnum)
  @IsOptional()
  type?: ContactTypeEnum = ContactTypeEnum.CONTACT;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên người gửi' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  name: string;

  @ApiProperty({ example: '0901234567', description: 'Số điện thoại' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  phone: string;

  @ApiProperty({ example: 'nguyenvana@example.com', description: 'Email' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  email: string;

  @ApiPropertyOptional({ example: '123 Đường Mẫu, TP.HCM', description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Tôi muốn tư vấn dịch vụ Revit...', description: 'Nội dung liên hệ' })
  @IsOptional()
  @IsString()
  message?: string;

  // Profile-specific fields
  @ApiPropertyOptional({ example: 'Công ty Cổ phần XYZ', description: 'Tên công ty' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: '0312345678', description: 'Mã số thuế' })
  @IsOptional()
  @IsString()
  mst?: string;

  @ApiPropertyOptional({ example: 'Thi công xây dựng', description: 'Lĩnh vực hoạt động' })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional({ example: 'Thiết kế kết cấu, MEP', description: 'Năng lực cốt lõi' })
  @IsOptional()
  @IsString()
  strength?: string;

  @ApiPropertyOptional({ example: '50.000.000.000', description: 'Doanh thu năm trước' })
  @IsOptional()
  @IsString()
  revenuePrev?: string;

  @ApiPropertyOptional({ example: '80.000.000.000', description: 'Kế hoạch doanh thu' })
  @IsOptional()
  @IsString()
  revenuePlan?: string;

  @ApiPropertyOptional({ example: 'https://example.com/ho-so-nang-luc.pdf', description: 'Link hồ sơ năng lực' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ example: 'Mong muốn hợp tác thầu phụ', description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 'pending', default: 'pending', description: 'Trạng thái xử lý' })
  @IsOptional()
  @IsString()
  status?: string = 'pending';
}


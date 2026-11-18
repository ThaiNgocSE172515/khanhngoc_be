import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tên thành viên' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Vui lòng nhập chức vụ' })
  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  story?: string;
}
import { IsOptional, IsString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { config } from 'dotenv';
config();

class EnvClass {
  @IsString({ message: 'Thiếu  DIRECT_URL TRONG FILE .ENV' })
  DIRECT_URL: string;
  @IsString({ message: 'Thiếu DATABASE_URL TRONG FILE .ENV' })
  DATABASE_URL: string;
  @IsString({ message: 'Thiếu SUPABASE_KEY TRONG FILE .ENV' })
  SUPABASE_KEY: string;
  @IsString({ message: 'Thiếu SUPABASE_URL TRONG FILE .ENV' })
  SUPABASE_URL: string;
  @IsString({ message: 'Thiếu CONTACT_RECEIVER_EMAIL TRONG FILE .ENV' })
  CONTACT_RECEIVER_EMAIL: string;
  @IsString({ message: 'Thiếu RESEND_API_KEY TRONG FILE .ENV' })
  RESEND_API_KEY: string;

}

const envInstance = plainToInstance(EnvClass, process.env);

const error = validateSync(envInstance);

if (error.length > 0) {
  const e = error.map((e: any) => {
    return {
      constraints: e.constraints,
      property: e.property,
      value: e.value,
    };
  });
  throw e;
}

export default envInstance;
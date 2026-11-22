export class SendContactDto {
  type?: 'contact' | 'profile';
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
}
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class SMTPService {
  private transporter;
  constructor() {
    const { MY_EMAIL, CONSUMER_SECRET } = process.env;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: MY_EMAIL,
        pass: CONSUMER_SECRET,
      },
    });
  }
  sendEmail = async (
    email: string,
    subject: string,
    text: string,
    html: string,
  ) => {
    try {
      const info = await this.transporter.sendMail({
        from: `"Ahmed Sayed" <${process.env.MY_EMAIL}>`,
        to: email,
        subject: subject,
        text: text,
        html: html,
      });
      return info;
    } catch {
      throw new InternalServerErrorException('Failed to send email');
    }
  };
  sendOTP = async (email: string, subject: string, otp: number) => {
    await this.sendEmail(email, subject, 'No-reply', `<h1>${otp}</h1>`);
  };
}

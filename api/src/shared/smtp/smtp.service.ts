import { ConfigService } from '@platform/config';
import { LoggerService } from '@platform/logger/logger.service';
import nodemailer, { type Transporter } from 'nodemailer';

export class SmtpService {
    private static instance: SmtpService | null = null;
    private readonly transporter: Transporter;

    private constructor(
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
    ) {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // hostname
            port: 587,
            secure: false, // upgrade later with STARTTLS
            auth: {
                user: config.smtpUser,
                pass: config.smtpPass,
            },
        });
    }

    static getInstance(config: ConfigService, logger: LoggerService): SmtpService {
        if (!SmtpService.instance) {
            SmtpService.instance = new SmtpService(config, logger);
        }
        return SmtpService.instance;
    }

    static resetInstance(): void {
        SmtpService.instance = null;
    }

    async sendOtpMail(user: { name: string; email: string; otp: string }): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: `Team Zerra <${this.config.smtpUser}>`,
                to: `${user.email}`,
                subject: 'Your One-Time Password (OTP)',
                text: `Hello ${user.name},
                Your OTP for logging in is: ${user.otp}
                This OTP is valid for 5 minutes. Do not share it with anyone.
                If you did not request this, ignore this email.
                Thanks,
                Solo Leveling Team`,
                html: `
                    <div style="font-family: sans-serif; line-height: 1.5; max-width: 600px;">
                        <p>Hello <strong>${user.name}</strong>,</p>
                        <p>Your OTP for logging in is:</p>
                        <p style="font-size: 24px; font-weight: bold; color: #1a73e8;">${user.otp}</p>
                        <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
                        <p>If you did not request this, ignore this email.</p>
                        <p>Thanks,<br>Team Zerra</p>
                    </div>
                    `,
            });
            this.logger.debug('Message sent: %s', info.messageId);
            this.logger.debug('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            this.logger.debug(user.otp);
            return;
        } catch (error: any) {
            this.logger.error('Failed to send OTP email', { email: user.email, error });
            throw new Error(`Failed to send OTP email: ${error.message}`);
        }
    }

    async sendMail(to: string, subject: string, message: string): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: `Team Zerra <${this.config.smtpUser}>`,
                to: to,
                subject: subject,
                text: message,
            });
            this.logger.debug('Message sent: %s', info.messageId);
        } catch (error: any) {
            this.logger.error('Failed to send email', { to, subject, error });
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}

import nodemailer from 'nodemailer';
import config from '../config';

const sendEmail = async (to: string, subject: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: Number(config.mailPort),
        secure: config.nodeEnv === 'production',
        auth: {
            user: config.mailUser,
            pass: config.mailPassword,
        },
    });

    await transporter.sendMail({
        from: `${config.companyName} <${config.mailUser}>`,
        to,
        subject,
        text: '',
        html,
    });
};

export default sendEmail;

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Define email options
    const mailOptions = {
        from: 'Appointment Platform <noreply@appointment.com>',
        to: options.to,
        subject: options.subject,
        text: options.text
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
import Mailgen from "mailgen";
import { google } from "googleapis";

const createGmailClient = () => {
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    oAuth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    return google.gmail({ version: 'v1', auth: oAuth2Client });
};

const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to our app. We are excited to have you on board.',
            action: {
                instructions: "To verify your email , please click on the following button.",
                button: {
                    color: '#22bc66',
                    text: 'Verify your email',
                    link: verificationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: 'We got a request to reset the password of our account',
            action: {
                instructions: "To reset your password click on the following button or link:",
                button: {
                    color: '#22bc66',
                    text: 'Reset password',
                    link: passwordResetUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "WeCode",
            link: 'https://wecode.com'
        },
    });

    const emailHtml = mailGenerator.generate(options.mailgenContent);

    try {
        const gmail = createGmailClient();
        
        const senderAddress = process.env.GMAIL_USER;
        
        // Construct raw MIME email
        const messageParts = [
            `To: ${options.email}`,
            `From: WeCode <${senderAddress}>`,
            `Subject: ${options.subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            emailHtml
        ];

        const message = messageParts.join('\n');
        
        // Encode to base64url format required by Gmail API
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });
        
        console.log("Gmail API email sent successfully:", res.data);
    } catch (error) {
        console.error("Email service failed via Gmail API.");
        console.error(error);
    }
}

export { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail };
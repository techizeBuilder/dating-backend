const emailVerification = (name, verificationLink) => {
    return (`  <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Verify Your Email</title>
            <style>
                /* Global Styles */
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                h2 {
                    color: #333;
                    font-size: 24px;
                }
                p {
                    color: #666;
                    font-size: 16px;
                    line-height: 1.5;
                }
                .button {
                display: inline-block;
                padding: 12px 20px;
                margin-top: 20px;
                color: white !important;
                background-color: #4B0082; /* Indigo */
                text-decoration: none;
                font-size: 18px;
                font-weight: bold;
                border-radius: 5px;
                transition: 0.3s;
            }
            .button:hover {
                background-color: #36006A; /* Darker Indigo */
            }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #888;
                }
                .link {
                    word-wrap: break-word;
                    font-size: 14px;
                    color: #007BFF;
                }

                /* Responsive Design */
                @media screen and (max-width: 600px) {
                    .container {
                        width: 90%;
                        padding: 15px;
                    }
                    h2 {
                        font-size: 20px;
                    }
                    p {
                        font-size: 14px;
                    }
                    .button {
                        font-size: 16px;
                        padding: 10px 18px;
                    }
                    .footer {
                        font-size: 12px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to BioBridgeX Platform!</h2>
                <p>Hi ${name},</p>
                <p>Thank you for signing up. Please verify your email to activate your account.</p>
                <a href="${verificationLink}" class="button">Verify My Email</a>
                <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
                <p class="link">${verificationLink}</p>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Your Company. All Rights Reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `)
}

export default emailVerification
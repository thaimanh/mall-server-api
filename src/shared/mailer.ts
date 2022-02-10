import mailer from 'nodemailer'

export const sendMail = async (mail: string) => {
    const transporter = mailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'thaikhacmanh1998@gmail.com',
            pass: 'manhprox30'
        },
        tls: {
            rejectUnauthorized: false,
        }
    })
    let content = ''
    content += ``
}
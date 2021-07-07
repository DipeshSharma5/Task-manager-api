const sendGM = require('@sendgrid/mail')

sendGM.setApiKey(process.env.sendgridAPIkey)

const sendWelcomeEmail = (to, name) =>{
    sendGM.send({
        to: to,
        from: "dipeshpack5@gmail.com",
        subject: "Welcome to task APP",
        text: `Thanks for joining our Task App ${name}`
    })
}

const sendDeleteEmail = (to, name) =>{
    sendGM.send({
        to: to,
        from: "dipeshpack5@gmail.com",
        subject: "Sorry to see you go!!!",
        text: `We saw that you deleted your account. Please let us know that how we can improve. Feel free to reply here. Thank you ${name}`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail
}
var nodemailer = require('nodemailer');

var mailTransport = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: "panet20200121@hotmail.com",
        pass: "*******************************************"
    }
  })

function sendActivation(recipient,content_url) {
    mailTransport.sendMail({
        from: 'panet20200121@hotmail.com',
        to: recipient,
        subject: 'Hi , please activate your account. :)',
        html: `<p>please click following link to activate your account : </p> 
                <p><a href="${content_url}">${content_url}</a></p> `
      }, function(err){
        if(err) {
          console.log('Unable to send email: ' + err);
        }
      });
}
function sendResetPassword(recipient,temp_password,url) {
    mailTransport.sendMail({
        from: 'panet20200121@hotmail.com',
        to: recipient,
        subject: 'please resetPassword :)',
        html: `<p>please click following link to reset your password : </p> 
                <p> here is your temp password, effect in 5 min. </p>
                <p> ${temp_password} </p>
                <p><a href="${url}">${url}</a></p> `
      }, function(err){
        if(err) {
          console.log('Unable to send email: ' + err);
        }
      });
}

module.exports.sendActivation = sendActivation;
module.exports.sendResetPassword = sendResetPassword;
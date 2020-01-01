//Set some environmental variables 
const fs = require('fs')
const env = {
    //The port for the server to listen to
    port: 3030,
    //Specify the hostname
    hostname: 'localhost',
    //request types
    requestList: ['get', 'post', 'put', 'delete'],
    //Secret string to hash the passwords
    hashSecret: 'askd8275hfgr3280',
    //Extend token's validity
    tokenExtend: 3600000, //One hour
    //Interval to check the orders and remove those
    //which are completed and more than a week old
    checkOrdersInterval: 3600000 * 168, // One week
    //Interval to check for invalid tokens
    checkTokensInterval: 3600000, //One hour
    //Base URL for the payment API
    stripeBaseURL: 'api.stripe.com',
    //Stripe public key
    stripePublic: 'STRIPE PUBLIC KEY',
    //Stripe secret key 
    stripeSecret: 'STRIPE SECRET KEY',
    //Stripe charge URL
    charge: '/v1/charges',
    //Base mailgun API URL
    mailgunURL: 'api.mailgun.net',
    //Mailgun sender email
    mailgunSender: 'MAILGUN SENDER',
    //Mailgun message URL
    messageURL: `/v3/MAILGUN SENDER/messages`,
    //Mailgun API key
    mailgunKey: 'MAILGUN KEY',
    //read the key
    key: fs.readFileSync('./cert/localhost-privkey.pem'),
    //read the certificate
    cert: fs.readFileSync('./cert/localhost-cert.pem')
}
//Export env object
module.exports = env

const bcrypt = require('bcrypt');
const db = require('./database');
const nodemailer = require('nodemailer');

let USER_MODELPACK = {
    collection: 'users',
    update: 'updatedOn',
    create: 'createdOn'
};

let NEW_USER = {
    username: '',
    token: '',
    score: 0,
    email: '',
    password: '',
    createdOn: new Date(),
    updatedOn: new Date(),
    verificationCode: -1

};

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'onslaught.arena@gmail.com',
        pass: ';g5?P-@4R8bsa42V'
    }
});


function filterUser(user) {
    delete user.password;
    delete user.createdOn;
    delete user.updatedOn
    return user;
}

const login = async (data, cb) => {
    if(!data.email || !data.password){
        cb({
            success: false,
            status: 400,
            data: "Missing email or password"
        });
        return;
    }

    db.getItem(USER_MODELPACK, {email: data.email}, async res =>{
        if(res.success && await bcrypt.compare(data.password, res.data.password)){

            cb({
                success: true,
                status: 200,
                data: filterUser(res.data)
            });
        }
        else{
            cb({
                success: false,
                status:301,
                data: "Email or password does not match"
            });
        }
    });


};

function verifySignupCode(data, cb) {
    let {email, username, verificationCode, password } = data;

    db.getItem(USER_MODELPACK, {email}, async res => {
        if (res.data) { //Email exists in database
            if (res.data.verificationCode === verificationCode) { //Signup successful

                let hashedPassword = await bcrypt.hash(data.password, 10);
                let newUpdate = {
                    verificationCode: 0,
                    password: hashedPassword,
                    username
                };
                db.updateOne(USER_MODELPACK, {_id: res.data._id}, newUpdate, res2 => {
                    if (res2.success) {
                        return cb({
                            success: true,
                            status: 200,
                            data: filterUser(res2.data)
                        });
                    }
                });
            } else {
                cb({
                    success: false,
                    status: 304,
                    data: "Verification code doesn't match"
                });
            }
        }
        else {
            cb({
                success: false,
                status: 300,
                data: "Internal server error! Please refresh the page"
            });
        }
    });
}

const signup = async (data, cb) => {
    let {email, username, verificationCode, password } = data;

    if(!email || !password || !username || !verificationCode){
        cb({
            success: false,
            status: 400,
            data: "Bad Request! Missing parameters"
        });
        return;
    }

    // Check if the username already exists
    db.getItem(USER_MODELPACK, {username}, res => {
        if (res.success) {
            cb({
                success: false,
                status: 303,
                data: "Username exists! Please use a different username"
            });
        }
        else {
            verifySignupCode(data, cb);
        }
    });
};

function generateRandomCode(n=6) {
    let add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

    if ( n > max ) {
        return generateRandomCode(max) + generateRandomCode(n - max);
    }

    max        = Math.pow(10, n+add);
    const min    = max/10; // Math.pow(10, n) basically
    const number = Math.floor( Math.random() * (max - min + 1) ) + min;

    return ("" + number).substring(add);
}

function sendVerifyEmail(email, verifyCode) {
    let message = `Dear User,<br><br>
	Thanks for signing up at Onslaught Arena.<br><br>
	Your verification code: ${verifyCode}.<br><br>
	Enjoy!<br>Onslaught Arena Team`



    let mailOptions = {
        from: '"Onslaught Arena Team" <onslaught.arena@gmail.com>',
        to: email,
        subject: "Verify your email",
        html: message,
        replyTo: 'no-reply@gmail.com'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error)
            console.error(error);
    });
}

const verify = async (data, cb) => {
    if(!data.email){
        cb({
            success: false,
            status: 400,
            data: "Missing email"
        });
        return;
    }

    db.getItem(USER_MODELPACK, {email: data.email}, async res =>{
        if(!res.success){ // Create new user
            let newUser = {...NEW_USER};
            newUser.email = data.email;
            let verifyCode = generateRandomCode();
            console.log('Verification Code:', verifyCode);
            newUser.verificationCode = verifyCode;
            sendVerifyEmail(data.email, verifyCode);
            db.insertOne(USER_MODELPACK, newUser);
            cb({
                success: true,
                status:200,
                data: null
            });
        }
        else{
            if(res.data.verificationCode === 0){ //User verified
                return cb({
                    success: false,
                    status: 302,
                    data: "The email already exists. Please Login"
                });
            }
            else{ //User created but not verified
                let verificationCode = generateRandomCode();
                sendVerifyEmail(data.email, verificationCode);
                db.updateOne(USER_MODELPACK, {_id: res.data._id}, {verificationCode});
                cb({
                    success: true,
                    status:201,
                    data: null
                });
            }

        }
    });


};



module.exports = {
    login,
    signup,
    verify
};

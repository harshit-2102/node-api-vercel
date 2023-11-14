const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const getValue = (key) => {
    try {
        const data = JSON.parse(fs.readFileSync('session.json', 'utf8'));
        return data[key];
    } catch (error) {
        console.error('Error reading data:', error.message);
        return null;
    }
};

const requireAuth = (req, res, next) => {
    const sessionCookie = req.session.token  || '';
    // const sessionCookie = getValue('session') || '';

    // admin
    //     .auth()
    //     .verifySessionCookie(sessionCookie, true)
    //     .then((decodedClaims) => {
    //         if (!decodedClaims) {
    //             res.redirect('/');
    //         } else {
    //             next();
    //         }
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //         res.redirect('/');
    //     });

    // const decodedToken = jwt.decode(sessionCookie, { complete: true });
    if (!sessionCookie) {
        res.redirect('/');
    } else {
        next();
    }
}

// const verifyToken = async (req, res, next) => {
//     const idToken = req.body.idToken;
//     res.locals.tokenAdmin = false;
//     res.locals.token = null;
//     try {
//         const decodedToken = await admin.auth().verifyIdToken(idToken);
//         res.locals.token = decodedToken;
//         // console.log("idtoken from verifyToken    " + );
//         if (res.locals.token.email === "harshit2102rathod@gmail.com") {
//             res.locals.tokenAdmin = true;
//         }
//         next();
//     } catch (error) {
//         console.error('Error verifying ID token:', error);
//         res.status(401).json({ error: 'Unauthorized' });
//     }
// };

const requireAdmin = (req, res, next) => {
    // const sessionCookie = req.cookies.session || '';
    const sessionCookie = req.session.token  || '';
    // const sessionCookie = getValue('session') || '';

    // admin
    //     .auth()
    //     .verifySessionCookie(sessionCookie, true)
    //     .then((decodedClaims) => {
    //         if(!decodedClaims){
    //             res.redirect('/');
    //         }else if(!res.locals.isAdmin){
    //             res.redirect('/dashboard');
    //         }else{
    //             next();
    //         }
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //         res.redirect('/');
    //     });
    const decodedToken = jwt.decode(sessionCookie, { complete: true });
    if (!decodedToken) {
        res.redirect('/');
    } else if (!res.locals.isAdmin) {
        res.redirect('/dashboard');
    } else {
        next();
    }

}

// check current user
const checkUser = async (req, res, next) => {
    const token = req.session.token || " ";
    // const token = " ";
    // if(req.session.token){
    //     token = req.session.token;
    // }
    // const token = getValue('session') || " ";
    console.log("TOken check user: " + token)
    res.locals.isAdmin = false;
    try {
        // const decodedClaims = await admin.auth().verifySessionCookie(token, true);
        const decodedToken = jwt.decode(token, { complete: true });
        // res.locals.user = decodedClaims;
        console.log(decodedToken.payload)
        res.locals.user = decodedToken.payload;
        if (res.locals.user.email === "harshit2102rathod@gmail.com") {
            res.locals.isAdmin = true;
        }
        next();
    } catch (error) {
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser, requireAdmin };

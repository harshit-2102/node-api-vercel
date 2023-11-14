const admin = require('firebase-admin');
const fs = require('fs');

const saveValue = (key, value) => {
    const data = { [key]: value };
    fs.writeFileSync('session.json', JSON.stringify(data));
};

const deleteValue = (key) => {
    const data = loadData();
    if (data[key]) {
        delete data[key];
        fs.writeFileSync('session.json', JSON.stringify(data));
        console.log(`Deleted value for key: ${key}`);
    } else {
        console.log(`Key not found: ${key}`);
    }
};

const loadData = () => {
    try {
      const data = JSON.parse(fs.readFileSync('session.json', 'utf8'));
      return data;
    } catch (error) {
      console.error('Error reading data:', error.message);
      return {};
    }
  };

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    if (err.message === 'Incorrect Email') {
        errors.email = 'That email is not registered';
    }

    if (err.message === 'Incorrect Password') {
        errors.password = 'Incorrect Password';
    }

    // duplicate email error
    if (err.code === 11000) {
        errors.email = 'Entered email is already registered';
        return errors;
    }

    // validation errors
    if (err.message.includes('users validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
            // console.log(properties);
        });
    }

    return errors;
}

module.exports.signup_get = (req, res) => {
    res.render('signup', {
        pageTitle: "Sign Up"
    });
}

module.exports.login_get = (req, res) => {
    console.log("You are in login page")
    const token = req.cookies.session || " ";
    console.log("session token from login get: " + token);
    res.render('login', {
        pageTitle: "Login"
    });
}

module.exports.signup_post = async (req, res) => {
    try {
        const userResponse = await admin.auth().createUser({
            email: req.body.email,
            password: req.body.password,
        })
        res.json(userResponse);
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res, next) => {

    console.log("You are in login page")
    const idToken = req.body.idToken.toString();
    console.log("idToken from LoginPost: " + idToken)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const options = { maxAge: expiresIn, httpOnly: true, secure: true };
    res.cookie('session', idToken, { maxAge: expiresIn, httpOnly: true, secure: true });
    // saveValue('session', idToken);
    req.session.token = idToken;
    console.log("session token from LoginPost: " + req.cookies.session)
    res.end(JSON.stringify({ status: 'success' }));

    // admin
    //     .auth()
    //     .createSessionCookie(idToken, { expiresIn })
    //     .then(
    //         (sessionCookie) => {
    //             const options = { maxAge: expiresIn, httpOnly: true, secure: true };
    //             saveValue('session', sessionCookie);
    //             res.cookie('session', sessionCookie, options);
    //             res.end(JSON.stringify({ status: 'success' }));
    //         },
    //         (err) => {
    //             const errors = handleErrors(err);
    //             res.status(400).json({ errors });
    //         }
    //     )
    //     .catch((err) => {
    //         const errors = handleErrors(err);
    //         res.status(400).json({ errors });
    //     })
}

module.exports.logout_get = (req, res) => {
    deleteValue('session');
    req.session.token = " ";
    res.clearCookie("session");
    res.redirect('/');
}
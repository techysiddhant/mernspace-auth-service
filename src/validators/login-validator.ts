import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is required!',
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: 'Invalid email address!',
        },
    },
    password: {
        errorMessage: 'password is required!',
        notEmpty: true,
        trim: true,
    },
});

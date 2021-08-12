import joi from 'joi';

export const loginSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required()
})

export const signUpSchema = joi.object({
    name: joi.string().min(6).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    confirmPassword: joi.ref('password')
});
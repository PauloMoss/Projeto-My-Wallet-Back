import joi from 'joi';

const loginSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required()
})

const signUpSchema = joi.object({
    name: joi.string().min(6).required(),
    email: joi.string().required(),
    password: joi.string().min(6).required(),
    confirmPassword: joi.ref('password')
})

const transferSchema = joi.object({
    value: joi.number().integer().required(),
    description: joi.string().allow('')
})

export {
    loginSchema,
    signUpSchema,
    transferSchema
}
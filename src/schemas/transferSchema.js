import joi from 'joi';

const transferSchema = joi.object({
    value: joi.number().integer().required(),
    description: joi.string().allow('')
})

export {
    transferSchema
}
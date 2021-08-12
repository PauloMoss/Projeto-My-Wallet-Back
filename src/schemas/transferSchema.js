import joi from 'joi';

export const transferSchema = joi.object({
    value: joi.number().integer().required(),
    type: joi.string(),
    description: joi.string().allow('')
});
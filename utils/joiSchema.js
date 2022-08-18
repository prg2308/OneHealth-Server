const Joi = require('joi');

module.exports.createDoctorSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().required(),
    specialization: Joi.string().required(),
    available: Joi.boolean().required(),
    qualifications: Joi.array().items(Joi.string()).required(),
    experience: Joi.number().required(),
    DOB: Joi.date()
})
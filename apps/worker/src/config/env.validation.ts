import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  LOG_LEVEL: Joi.string().valid('info', 'warn', 'error').default('info'),
  DATABASE_URL: Joi.string().uri().required(),
});

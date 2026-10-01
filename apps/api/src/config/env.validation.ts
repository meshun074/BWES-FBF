import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),

  LOG_LEVEL: Joi.string().valid('info', 'warn', 'error').default('info'),

  API_HOST: Joi.string().default('0.0.0.0'),

  API_PORT: Joi.number().port().default(4000),

  API_CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  DATABASE_URL: Joi.string().uri().required(),
});

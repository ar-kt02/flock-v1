import Joi from "joi";

function validateEnv() {
  const schema = Joi.object({
    NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
  });

  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  const { error } = schema.validate(process.env, options);

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`Environment variable error: ${error.message}`);
    }
    process.exit(1);
  }
}

export default validateEnv;

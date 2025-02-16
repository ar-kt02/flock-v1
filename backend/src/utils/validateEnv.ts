import Joi from "joi";

function validateEnv() {
   const schema = Joi.object({
      NODE_ENV: Joi.string()
         .valid("development", "production", "test")
         .default("development"),
      PORT: Joi.number().default(3000),
      JWT_SECRET: Joi.string().required(),
      DATABASE_URL: Joi.string().required(),
   }).unknown();

   const { error } = schema.validate(process.env, {
      abortEarly: false,
      allowUnknown: true,
   });

   if (error) {
      console.error(`Environment variable error: ${error.message}`);
      process.exit(1);
   }
}

export default validateEnv;

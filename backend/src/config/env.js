const dotenv = require("dotenv");
const path = require("path");
const { z } = require("zod");

// Load the environment variables
dotenv.config({ path: path.join(__dirname, "../../backend/.env") });

// Define Validation Schema for environment variables
const envSchema = z.object({
  PORT: z.preprocess((val) => parseInt(val, 10), z.number().default(5000)),
  MONGO_URI: z
    .string()
    .refine(
      (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
      {
        message:
          "Invalid MongoDB connection URI. Must start with mongodb:// or mongodb+srv://",
      },
    ),
  JWT_SECRET: z
    .string()
    .min(
      10,
      "JWT_SECRET is required and should be at least 10 characters long",
    ),
  JWT_EXPIRES_IN: z.string().default("24h"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  GROQ_API_KEY: z.string().optional().default(""),
});

// Run the validation
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment validation failed:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

module.exports = parsed.data;
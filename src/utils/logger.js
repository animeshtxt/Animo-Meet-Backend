import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const logger = {
  // Only prints in Development
  dev: (...args) => {
    if (!isProd) console.log(...args);
  },
  // Only warn in Development
  warn: (...args) => {
    if (!isProd) console.warn(...args);
  },

  // Always prints (Use for critical tracking)
  info: (...args) => {
    console.log(...args);
  },

  // Always prints errors
  error: (...args) => {
    console.error(...args);
  },
};

export default logger;

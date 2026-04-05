import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const getISTTimestamp = () => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
};

const logger = {
  // Only prints in Development
  dev: (...args) => {
    if (!isProd) console.log(`I ST[${getISTTimestamp()}] DEV:`, ...args);
  },
  // Only warn in Development
  warn: (...args) => {
    if (!isProd) console.warn(`[IST ${getISTTimestamp()}] WARN:`, ...args);
  },

  // Always prints (Use for critical tracking)
  info: (...args) => {
    console.log(`[IST ${getISTTimestamp()}] INFO:`, ...args);
  },

  // Always prints errors
  error: (...args) => {
    console.error(`[IST ${getISTTimestamp()}] ERROR:`, ...args);
  },
};

export default logger;

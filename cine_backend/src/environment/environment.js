const URL_ML = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
const URL_FE = process.env.FRONTEND_URL || "http://127.0.0.1:3000";
const URL_BE = process.env.BACKEND_URL || "http://127.0.0.1:4200";

module.exports = { URL_ML, URL_FE, URL_BE };

require("dotenv").config();

const baseConfig = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || "server_pusat",
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  dialect: process.env.DB_DIALECT || "postgres",
  logging: false,
};

module.exports = {
  development: { ...baseConfig },
  test: {
    ...baseConfig,
    database: process.env.DB_NAME_TEST || `${(process.env.DB_NAME || "veritas_pusat")}_test`,
  },
  production: { ...baseConfig },
};

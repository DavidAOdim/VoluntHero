// tests/db.test.js
jest.mock('mysql2', () => ({
  createPool: jest.fn(() => ({
    promise: () => ({
      getConnection: jest.fn(),
    }),
  })),
}));

describe('Database module', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = 'test'; // ensure guard disables connection
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'root';
    process.env.DB_PASSWORD = 'password';
    process.env.DB_NAME = 'testdb';
    process.env.DB_PORT = '3306';
  });

  test('should create a pool with env variables', () => {
    const mysql = require('mysql2');
    require('../../db'); 

    expect(mysql.createPool).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'testdb',
        port: '3306',
        charset: 'utf8mb4',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      })
    );
  });
});

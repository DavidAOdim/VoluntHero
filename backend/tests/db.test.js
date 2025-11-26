const mysql = require("mysql2");
jest.mock("mysql2");

describe("Database connection", () => {
  let mockGetConnection;
  let mockRelease;

  beforeEach(() => {
    mockRelease = jest.fn();
    mockGetConnection = jest.fn().mockResolvedValue({ release: mockRelease });

    mysql.createPool.mockReturnValue({
      promise: () => ({
        getConnection: mockGetConnection,
      }),
      getConnection: mockGetConnection,
    });

    jest.resetModules();
  });

  it("should establish a database connection successfully", async () => {
    const db = require("../../db");
    const connection = await db.getConnection();

    expect(mockRelease).not.toHaveBeenCalled();   // ✅ check the mock directly
    expect(mockGetConnection).toHaveBeenCalledTimes(1);
  });

  it("should log error if connection fails", async () => {
    const error = new Error("Connection failed");
    error.code = "ER_ACCESS_DENIED_ERROR";
    error.sqlMessage = "Access denied for user";
    mockGetConnection.mockRejectedValueOnce(error);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Import db.js AFTER spy is set
    require("../../db");

    // Flush async rejection
    await new Promise(setImmediate);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error connecting to the database:",
      error.code,
      error.sqlMessage
    );

    consoleSpy.mockRestore();
  });
});


/*jest.mock('mysql2', () => ({
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
*/

const errorHandler = (err, req, res, next) => {
  console.error("Express App Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: message,
    data: null,
    errors: [message],
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;

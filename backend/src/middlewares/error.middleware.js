export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for developers
  console.error('Error Details:', err);

  // Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with ID of ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. That ${field} already exists.`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // JWT expired/invalid Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
  }

  // Fallback to default server error
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

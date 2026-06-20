import dns from 'dns';
import app from './src/app.js';
import connectDB from './src/config/db.js';

// Force DNS lookup to prefer IPv4 (resolves querySrv ECONNREFUSED issues for MongoDB Atlas)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

import swaggerUi from 'swagger-ui-express';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'InternX AI - Auth & Auth Module API',
    version: '1.0.0',
    description: 'API Documentation for the enterprise Authentication and Authorization module of InternX AI. Supports Student, College, Recruiter, and Admin roles.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your access token as Bearer <JWT_Token>',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Invalid credentials' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'student@example.com' },
          password: { type: 'string', format: 'password', example: 'password123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
          user: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
              email: { type: 'string', example: 'student@example.com' },
              role: { type: 'string', example: 'student' },
              fullName: { type: 'string', example: 'Alex Mercer' },
              dashboardUrl: { type: 'string', example: '/dashboard/student' },
              isVerified: { type: 'boolean', example: false },
              isActive: { type: 'boolean', example: true },
            },
          },
        },
      },
      RegisterStudentRequest: {
        type: 'object',
        required: ['email', 'password', 'role', 'fullName', 'collegeName', 'course', 'year'],
        properties: {
          email: { type: 'string', format: 'email', example: 'student@example.com' },
          password: { type: 'string', minLength: 8, example: 'password123' },
          role: { type: 'string', enum: ['student'], example: 'student' },
          fullName: { type: 'string', example: 'Alex Mercer' },
          collegeName: { type: 'string', example: 'Stanford University' },
          course: { type: 'string', example: 'Computer Science' },
          year: { type: 'integer', example: 3 },
          skills: { type: 'array', items: { type: 'string' }, example: ['React', 'Node.js', 'MongoDB'] },
        },
      },
      RegisterCollegeRequest: {
        type: 'object',
        required: ['email', 'password', 'role', 'collegeName', 'collegeCode', 'contactPerson'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@college.edu' },
          password: { type: 'string', minLength: 8, example: 'collegePass123' },
          role: { type: 'string', enum: ['college'], example: 'college' },
          collegeName: { type: 'string', example: 'Stanford University' },
          collegeCode: { type: 'string', example: 'STAN-1002' },
          contactPerson: { type: 'string', example: 'Prof. John Doe' },
          website: { type: 'string', example: 'https://stanford.edu' },
        },
      },
      RegisterRecruiterRequest: {
        type: 'object',
        required: ['email', 'password', 'role', 'companyName', 'industry', 'companySize'],
        properties: {
          email: { type: 'string', format: 'email', example: 'hiring@techcorp.com' },
          password: { type: 'string', minLength: 8, example: 'recruiterPass123' },
          role: { type: 'string', enum: ['recruiter'], example: 'recruiter' },
          companyName: { type: 'string', example: 'TechCorp Solutions' },
          industry: { type: 'string', example: 'Software Engineering' },
          companySize: { type: 'string', example: '50-200' },
          website: { type: 'string', example: 'https://techcorp.com' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: { type: 'string', example: 'oldPassword123' },
          newPassword: { type: 'string', minLength: 8, example: 'newPassword123' },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'student@example.com' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
          token: { type: 'string', example: 'a1b2c3d4e5f6...' },
          newPassword: { type: 'string', minLength: 8, example: 'superNewPassword123' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        description: 'Registers a new user (Student, College, Recruiter, Admin) based on their role details.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/RegisterStudentRequest' },
                  { $ref: '#/components/schemas/RegisterCollegeRequest' },
                  { $ref: '#/components/schemas/RegisterRecruiterRequest' },
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          400: {
            description: 'Validation failed or duplicate email',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        description: 'Verify credentials, generate access and refresh tokens, and return user profile details.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          401: {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          403: {
            description: 'Account deactivated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Logout user',
        description: 'Invalidates database refresh token and clears refresh cookie.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logged out successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
        },
      },
    },
    '/api/auth/refresh-token': {
      post: {
        summary: 'Refresh access token',
        description: 'Generates a new access token using a valid refresh token from cookies or body.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1...' } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Access token refreshed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Access token refreshed successfully' },
                    data: {
                      type: 'object',
                      properties: { accessToken: { type: 'string', example: 'eyJhbGci...' } },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid/expired refresh token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        description: 'Retrieves current authenticated user data along with dashboard redirection links.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User profile retrieved successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            email: { type: 'string' },
                            role: { type: 'string' },
                            fullName: { type: 'string' },
                            dashboardUrl: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/change-password': {
      put: {
        summary: 'Change password',
        description: 'Updates password for current user after verifying old password.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } },
        },
        responses: {
          200: {
            description: 'Password updated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
          400: {
            description: 'Incorrect old password or invalid input',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Forgot password token request',
        description: 'Generates and returns (for dev/test purposes) a secure password reset token.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } },
        },
        responses: {
          200: {
            description: 'Reset token generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: { resetToken: { type: 'string', example: 'a1b2c3...' } },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Reset password using token',
        description: 'Updates user password by supplying a valid, unexpired reset token.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } },
        },
        responses: {
          200: {
            description: 'Password reset successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
          400: {
            description: 'Invalid/expired token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/admin/users': {
      get: {
        summary: 'Get all users',
        description: 'Retrieve a list of all registered users. Restricted to Admin role.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Users retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
        },
      },
    },
    '/api/admin/user/{id}': {
      get: {
        summary: 'Get user by ID',
        description: 'Retrieve detailed information of a specific user. Restricted to Admin role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User MongoDB ID' },
        ],
        responses: {
          200: {
            description: 'User retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
          404: {
            description: 'User not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      put: {
        summary: 'Update user by ID',
        description: 'Update profile properties of a user. Restricted to Admin role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User MongoDB ID' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  isVerified: { type: 'boolean' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
        },
      },
      delete: {
        summary: 'Delete user by ID',
        description: 'Completely remove a user account. Restricted to Admin role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User MongoDB ID' },
        ],
        responses: {
          200: {
            description: 'User deleted',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
        },
      },
    },
    '/api/admin/block/{id}': {
      patch: {
        summary: 'Block a user',
        description: 'Set user active status to false. Restricted to Admin role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User MongoDB ID' },
        ],
        responses: {
          200: {
            description: 'User blocked',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
        },
      },
    },
    '/api/admin/unblock/{id}': {
      patch: {
        summary: 'Unblock a user',
        description: 'Restore user active status to true. Restricted to Admin role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User MongoDB ID' },
        ],
        responses: {
          200: {
            description: 'User unblocked',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
        },
      },
    },
  },
};

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
};

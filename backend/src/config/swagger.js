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
    '/api/github/connect': {
      get: {
        summary: 'Initiate GitHub connection',
        description: 'Initiates GitHub OAuth flow. User access token must be passed as a query parameter.',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' }, description: 'User JWT Access Token' },
        ],
        responses: {
          302: { description: 'Redirect to GitHub authorize page' },
          401: { description: 'Missing or invalid token' },
        },
      },
    },
    '/api/github/disconnect': {
      delete: {
        summary: 'Disconnect GitHub connection',
        description: 'Removes cached profile, repositories, contributions, and unlinks User account.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'GitHub connection disconnected successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
        },
      },
    },
    '/api/github/profile': {
      get: {
        summary: 'Get connected GitHub profile',
        description: 'Returns connected GitHub profile metadata for the authenticated student.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile details',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
          400: { description: 'GitHub account not connected' },
        },
      },
    },
    '/api/github/repos': {
      get: {
        summary: 'Sync and list GitHub repositories',
        description: 'Fetches repositories from GitHub, updates local MongoDB cache, and returns them.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of synchronized repositories',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
        },
      },
    },
    '/api/github/repos/{repoId}': {
      get: {
        summary: 'Get repo details',
        description: 'Returns cached repository details.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'repoId', in: 'path', required: true, schema: { type: 'string' }, description: 'GitHub Repo ID' },
        ],
        responses: {
          200: { description: 'Repository metadata' },
          404: { description: 'Repository not cached' },
        },
      },
    },
    '/api/github/repos/{repoId}/languages': {
      get: {
        summary: 'Get repo language breakdown',
        description: 'Fetches language usage details from GitHub and returns percentage distributions.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'repoId', in: 'path', required: true, schema: { type: 'string' }, description: 'GitHub Repo ID' },
        ],
        responses: {
          200: { description: 'Language distribution' },
        },
      },
    },
    '/api/github/repos/{repoId}/commits': {
      get: {
        summary: 'Get repo commit analytics',
        description: 'Fetches commit history statistics and constructs a timeline chart data.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'repoId', in: 'path', required: true, schema: { type: 'string' }, description: 'GitHub Repo ID' },
        ],
        responses: {
          200: { description: 'Commit analytics details' },
        },
      },
    },
    '/api/github/repos/{repoId}/pulls': {
      get: {
        summary: 'Get repo pull request analytics',
        description: 'Calculates open/closed/merged PR counts and user contribution metrics.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'repoId', in: 'path', required: true, schema: { type: 'string' }, description: 'GitHub Repo ID' },
        ],
        responses: {
          200: { description: 'PR analytics data' },
        },
      },
    },
    '/api/github/select-repository': {
      post: {
        summary: 'Select active internship repository',
        description: 'Sets the student\'s active repository for task submissions.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['repoId', 'repositoryName', 'branch'],
                properties: {
                  repoId: { type: 'string', example: '12345678' },
                  repositoryName: { type: 'string', example: 'internship-task-tracker' },
                  branch: { type: 'string', example: 'main' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Selected repository registered' },
        },
      },
    },
    '/api/github/selected-repository': {
      get: {
        summary: 'Get active selected repository',
        description: 'Returns the student\'s currently active selected repository.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Selected repository data' },
        },
      },
    },
    '/api/github/repos/{repoId}/files': {
      get: {
        summary: 'Explore repository directory tree',
        description: 'Lists folder and files under path query. Used for repository file explorer.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'repoId', in: 'path', required: true, schema: { type: 'string' }, description: 'GitHub Repo ID' },
          { name: 'path', in: 'query', required: false, schema: { type: 'string' }, description: 'Directory sub-path' },
        ],
        responses: {
          200: { description: 'Folder directory structure' },
        },
      },
    },
    '/api/college/profile': {
      get: {
        summary: 'Get College profile details',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Profile details' } }
      },
      patch: {
        summary: 'Update College profile details',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Profile updated' } }
      }
    },
    '/api/college/dashboard': {
      get: {
        summary: 'Get College Portal dashboard metrics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dashboard stats' } }
      }
    },
    '/api/college/students': {
      get: {
        summary: 'List and search college students',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of students' } }
      }
    },
    '/api/college/students/{id}': {
      get: {
        summary: 'Get student details with GitHub & certificates',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Detailed student analytics' } }
      }
    },
    '/api/college/internships': {
      get: {
        summary: 'Get college internship completion metrics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Internship stats' } }
      }
    },
    '/api/college/skills': {
      get: {
        summary: 'Get college student skills growth and gaps',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Skills stats' } }
      }
    },
    '/api/college/placement-readiness': {
      get: {
        summary: 'Get college student placement readiness indexes',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Readiness stats' } }
      }
    },
    '/api/college/certificates': {
      get: {
        summary: 'Get certificates issued list',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Certificates stats' } }
      }
    },
    '/api/college/reports': {
      get: {
        summary: 'Compile institutional reports data',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'type', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Report data' } }
      }
    }
  },
};

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
};

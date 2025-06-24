# Studio Booking Manager

A comprehensive web application for recording studios to manage bookings, coordinate with staff, and provide clients with a seamless booking experience.

## Overview

The Studio Booking Manager helps recording studios streamline their booking process, reduce administrative overhead, and improve client satisfaction. It provides a complete solution for managing studio resources, client bookings, payments, and notifications.

## Key Features

- **User Authentication and Role-Based Access**
  - Secure login for administrators, staff, and clients
  - Different permission levels for various user roles

- **Studio Management**
  - Manage multiple studio rooms with different equipment and pricing
  - Track studio availability with customizable calendars

- **Booking System**
  - Real-time availability checking
  - Online booking with instant confirmation
  - Modification and cancellation options (subject to policy)

- **Equipment Management**
  - Track available equipment in each studio
  - Request specific equipment for sessions
  - Maintenance scheduling and tracking

- **Automated Notifications**
  - Booking confirmations via email
  - Session reminders
  - Schedule change alerts

- **Payment Processing**
  - Secure online payments
  - Track payment history
  - Flexible pricing rules (hourly rates, packages, discounts)

- **Client Portal**
  - View upcoming and past bookings
  - Access preparation materials
  - Provide session feedback

- **Reporting and Analytics**
  - Booking statistics and revenue reports
  - Studio utilization metrics
  - Data export capabilities

## Technology Stack

### Frontend
- React with TypeScript
- Redux Toolkit for state management
- Material-UI for responsive design
- React Big Calendar for scheduling views

### Backend
- Node.js with Express
- JWT authentication
- RESTful API architecture
- Email service integration (Nodemailer/SendGrid)
- Stripe integration for payments

### Database
- PostgreSQL
- Sequelize/Prisma ORM
- Redis for caching

### DevOps
- Docker containerization
- AWS deployment (EC2, RDS, S3)
- CI/CD with GitHub Actions

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL
- Redis (optional but recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dxaginfo/studio-booking-manager-app.git
cd studio-booking-manager-app
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend .env file
cp backend/.env.example backend/.env

# Frontend .env file
cp frontend/.env.example frontend/.env
```

4. Configure your environment variables with your database credentials, JWT secret, and other settings.

5. Run database migrations:
```bash
cd backend
npm run migrate
npm run seed # (optional) populate with sample data
```

6. Start the development servers:
```bash
# Backend server
cd backend
npm run dev

# Frontend server
cd frontend
npm start
```

7. Access the application at http://localhost:3000

## Deployment

### Docker Deployment

1. Build the Docker images:
```bash
docker-compose build
```

2. Run the containers:
```bash
docker-compose up -d
```

### AWS Deployment

Detailed instructions for deploying to AWS are available in the [deployment guide](docs/deployment.md).

## Project Structure

```
studio-booking-manager-app/
├── backend/               # Node.js Express backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── services/          # Business logic
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux state management
│   │   ├── services/      # API service calls
│   │   └── utils/         # Utility functions
├── docs/                  # Documentation
└── docker/                # Docker configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Calendar visualization powered by [React Big Calendar](https://github.com/jquense/react-big-calendar)
- UI components from [Material-UI](https://mui.com/)
- Payment processing via [Stripe](https://stripe.com/)
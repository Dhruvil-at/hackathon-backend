# Hackathon Backend

A production-ready Node.js backend application built with Express and TypeScript.

## Features

- TypeScript support
- Express.js framework
- Production-ready security middleware
- CORS configuration
- Request logging
- Error handling
- Swagger API documentation
- Code formatting with Prettier
- Linting with ESLint

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## MySQL Configuration

This project requires MySQL. Configure the following environment variables in your `.env` file:

```
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=hackathon
```

## Database Setup

1. Create the MySQL database using the SQL script in `src/infrastructure/database/init.sql`
2. Run the following command to initialize the database:

```bash
mysql -u root -p < src/infrastructure/database/init.sql
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The server will start on http://localhost:3000

## Building for Production

To build the project:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint-fix` - Fix ESLint errors
- `npm run prettify` - Format code with Prettier

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3000
```

## License

ISC

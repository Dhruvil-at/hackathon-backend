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

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Development

To start the development server:

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

API documentation is available at `/docs` when the server is running.

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
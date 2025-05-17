import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { TokenIndexer } from 'morgan';
import routes from './modules/index';
import { errorHandler } from './shared/middleware/error-handler';
import { sessionMiddleware } from './shared/middleware/session-middleware';

class App {
  public app: express.Application;
  public port: string | number;
  public isProductionEnv: boolean;

  constructor() {
    this.app = express();
    this.app.disable('x-powered-by');
    this.port = process.env.PORT || 3000;
    this.isProductionEnv = process.env.NODE_ENV === 'production';

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  public listen(): void {
    const server = this.app.listen(this.port, () => {
      console.log(`🚀 App listening on the port ${this.port}`);
    });

    // Set timeouts for better handling of connections
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  }

  public getServer(): express.Application {
    return this.app;
  }

  private initializeMiddlewares() {
    // Track request start time
    this.app.use((_req: Request, res: Response, next: NextFunction) => {
      res.locals.startEpoch = Date.now();
      next();
    });

    // Basic middleware
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(hpp());

    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginOpenerPolicy: false,
        referrerPolicy: {
          policy: ['strict-origin-when-cross-origin'],
        },
      }),
    );

    // CORS configuration
    const corsOptions: cors.CorsOptions = {
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
        if (!origin || process.env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        // Add your production domains here
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000',
          'https://hackthon-frontend-omega.vercel.app/',
        ];
        if (allowedOrigins.indexOf(origin) === -1) {
          return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
      },
      credentials: true,
    };
    this.app.use(cors(corsOptions));

    // Request logging
    this.app.use(
      logger((tokens: TokenIndexer<Request, Response>, req: Request, res: Response) => {
        return [
          `[${req.ip}]`,
          `[${tokens.date(req, res, 'clf')}]`,
          `["${tokens.method(req, res)}`,
          `${req.protocol}://${req.hostname}${tokens.url(req, res)}`,
          `HTTP/${tokens['http-version'](req, res)}"]`,
          `[${tokens.status(req, res)}]`,
          `[${tokens.res(req, res, 'content-length')}]`,
          '-',
          `[${tokens['response-time'](req, res)}]`,
          'ms',
          `[${tokens['user-agent'](req, res)}]`,
        ].join(' ');
      }),
    );

    this.app.use(sessionMiddleware);
  }

  private initializeRoutes() {
    // Serve static files
    this.app.use(express.static('public'));

    // Swagger documentation
    this.app.use(
      '/docs',
      swaggerUi.serve,
      swaggerUi.setup(undefined, {
        swaggerOptions: {
          url: '/swagger.json',
        },
      }),
    );

    this.app.use('/api/public', routes);
  }

  private initializeErrorHandling() {
    // Error handling middleware
    this.app.use(errorHandler);
  }
}

export default App;

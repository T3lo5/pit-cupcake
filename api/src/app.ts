import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { httpLogger } from './libs/logger.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.js';
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(httpLogger);

const openapi = {
  openapi: '3.0.0',
  info: { title: 'Cupcakes API', version: '0.1.0' },
  paths: {
    '/api/health': { get: { responses: { '200': { description: 'ok' } } } }
  }
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api', routes);

app.use(errorHandler);

export default app;

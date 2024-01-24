import express, { RequestHandler } from 'express';
import { TenantController } from '../controllers/TenantController';
import { Tenant } from '../entity/Tenant';
import { AppDataSource } from '../config/data-source';
import { TenantService } from '../services/TenantService';
import logger from '../config/logger';

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);
router.post('/', (async (req, res, next) => {
    await tenantController.create(req, res, next);
}) as RequestHandler);
export default router;

const express = require('express');
const controller = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Solo administradores (verificado en el backend, no solo en la UI)
router.use(authenticate, authorize('admin'));

router.get('/users', controller.listUsers);
router.patch('/users/:id/role', controller.changeRole);
router.patch('/users/:id/status', controller.changeStatus);
router.get('/dashboard', controller.dashboard);
router.get('/reports', controller.reports);
router.get('/reports/export', controller.exportReports);

module.exports = router;

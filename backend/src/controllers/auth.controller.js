const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ ok: true, message: 'Usuario registrado', ...result });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const result = await authService.getMe(req.user.id_usuario);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, forgotPassword, resetPassword, me };

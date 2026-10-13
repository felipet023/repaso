// Envuelve una función de validación de body:
// - recibe req.body; si devuelve un valor, se guarda en req.validatedBody
// - los errores lanzan hacia el middleware de errores de Express 5
function validate(fn) {
  return (req, res, next) => {
    try {
      const result = fn(req.body || {});
      if (result !== undefined) req.validatedBody = result;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = validate;

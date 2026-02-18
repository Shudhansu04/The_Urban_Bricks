export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      const firstError = result.error.errors[0];
      const message = firstError?.message || "Validation failed";
      return res.status(400).json({ error: message, details: result.error.flatten() });
    }
    req.validated = result.data;
    return next();
  };
}

import { ZodError } from "zod";
import fs from "fs";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next();
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error(err);
        });
      });
    }

    if (error instanceof ZodError) {
      return res.status(400).json({
        status: "Validation Error",
        errors: JSON.parse(error.message),
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

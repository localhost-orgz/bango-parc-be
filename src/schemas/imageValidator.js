import { z } from "zod";

const imageValidator = ({
  allowedTypes = ["image/jpeg", "image/png"],
  maxSize = 2,
}) => {
  return z
    .object({
      mimetype: z.string(),
      size: z.number(),
    })
    .refine((file) => allowedTypes.includes(file.mimetype), {
      message: `Allowed types: ${allowedTypes.join(", ")}`,
    })
    .refine((file) => file.size <= maxSize * 1024 * 1024, {
      message: `Max file size ${maxSize}MB`,
    });
};

export default imageValidator;

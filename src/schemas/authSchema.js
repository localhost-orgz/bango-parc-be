import { z } from "zod";

export const signinSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
});

export const signupSchema = z.object({
  body: z
    .object({
      fullName: z.string(),
      email: z.email(),
      whatsappNumber: z.string(),
      password: z.string(),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "Passwords do not match",
      path: ["passwordConfirmation"],
    }),
});

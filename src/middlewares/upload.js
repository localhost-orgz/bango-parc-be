import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format file tidak didukung! Hanya diperbolehkan JPEG, PNG, dan PDF.",
      ),
      false,
    );
  }
};

const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default uploadMiddleware;

// export function createUploadMiddleware(uploadPath = "uploads") {
//   const uploadDir = path.resolve(uploadPath);

//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, uploadDir),
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(
//         null,
//         file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
//       );
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image files are allowed"), false);
//     }
//   };

//   return multer({
//     storage,
//     fileFilter,
//     limits: {
//       fileSize: 5 * 1024 * 1025, // 5MB
//     },
//   });
// }

import multer from "multer";
import path from "node:path";
import fs from "node:fs";

export const fileValidation = {
  images: ["image/png", "image/jpg", "image/jpeg", "image/webp"],
  videos: ["video/mp4", "video/mkv", "video/avi"],
  audios: ["audio/mpeg", "audio/wav", "audio/ogg"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const localFileUpload = ({
  customPath = "general",
  validation = [],
}) => {
  const basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let userBasePath = basePath;

      if (req.user?._id) {
        userBasePath += `/${req.user._id}`;
      }

      const fullPath = path.resolve(`./src/${userBasePath}`);

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      cb(null, fullPath);
    },

    filename: (req, file, cb) => {
      const uniqueFilename =
        Date.now() +
        "_" +
        Math.round(Math.random() * 1e9) +
        "_" +
        file.originalname;

      file.finalPath = req.user?._id
        ? `${basePath}/${req.user._id}/${uniqueFilename}`
        : `${basePath}/${uniqueFilename}`;

      cb(null, uniqueFilename);
    },
  });

  const fileFilter = (req, file, cb) => {
    console.log("Mimetype:", file.mimetype);
    console.log("Validation:", validation);
    if (!validation.length || validation.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error("Invalid file type"), false);
  };
  //mime type signature validation

  return multer({
    fileFilter,
    storage,
  });
};

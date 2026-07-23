const multer = require("multer");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const Workspace = require("../models/Workspace");
const logger = require("../utils/logger");

// Create base upload directories
const uploadsDir = path.join(__dirname, "../../uploads");
const tempDir = path.join(uploadsDir, "temp");

// If both folder do not exists auto create them
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Multer storage config (save temporary ZIP files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});

// Filter files (accepts .zip only)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/zip" ||
    file.originalname.endsWith(".zip")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only ZIP files are allowed"), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size allowed
});

// Business Logic to upload the codebase
const extractAndSaveCodebase = async (workspaceId, zipFilePath) => {
  // Find the workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    // Cleanup the zip file if workspace not found
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }

    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  // Create the path where the zip file will be extracted for upload
  const targetExtractPath = path.join(uploadsDir, `workspace_${workspaceId}`);

  try {
    // Extract the ZIP file
    const zip = new AdmZip(zipFilePath);

    zip.extractAllTo(targetExtractPath, true);

    // Remove the temp file after extraction
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }

    // Update the workspace datas
    workspace.codebasePath = targetExtractPath;
    workspace.ingestionStatus = "extracted";
    workspace.ingestionError = null;
    await workspace.save();

    return workspace;
  } catch (error) {
    logger.error(
      `Failed to extract codebase ZIP for workspace ${workspaceId}: ${error.message}`,
    );

    // Cleanup temp zip
    if (fs.existsSync(zipFilePath)) fs.unlinkSync(zipFilePath);

    workspace.ingestionStatus = "failed";
    workspace.ingestionError = `Extraction failed: ${error.message}`;
    await workspace.save();

    throw error;
  }
};

module.exports = { upload, extractAndSaveCodebase };

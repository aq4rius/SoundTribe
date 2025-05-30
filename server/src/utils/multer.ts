import multer from 'multer';

// Use memory storage for direct upload to cloudinary
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
    fieldSize: 20 * 1024 * 1024, // 20MB for field data
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type validation
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`) as any, false);
    }
  }
});

export default upload;

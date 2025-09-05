import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configure multer to handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userFolder = path.join('uploads', 'users', req.body.userId.toString());
        // Ensure the user folder exists
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }
        cb(null, userFolder); // Save to user-specific folder
    },
    filename: (req, file, cb) => {
        // Use original file name
        cb(null, file.originalname);
    },
});

// Create the multer upload instance
const upload = multer({ storage });

// Export the upload instance to use in routes
export default upload;

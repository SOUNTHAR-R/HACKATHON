import express, { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import LectureSummary from '../models/LectureSummary';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  user?: any;
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadsDir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: function (req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3 and WAV files are allowed.'));
    }
  },
});

// Process audio file using transcription model
const processAudioFile = async (filePath: string): Promise<{ transcription: string; summary: any }> => {
  return new Promise((resolve, reject) => {
    const modelPath = path.join(__dirname, '..', 'transcription_model', 'transcribe.py');
    console.log('Using transcription model at:', modelPath);
    console.log('Processing file:', filePath);

    const pythonProcess = spawn('py', [modelPath, filePath]);
    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
      console.log('Transcription output:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error('Transcription error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Transcription process exited with code:', code);
        console.error('Error data:', errorData);
        reject(new Error(`Transcription failed with code ${code}: ${errorData}`));
        return;
      }

      try {
        const result = JSON.parse(outputData);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch (error) {
        console.error('Error parsing transcription output:', error);
        console.error('Raw output:', outputData);
        reject(new Error('Failed to parse transcription output'));
      }
    });
  });
};

// Upload and process lecture recording
router.post('/upload', authenticateToken, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const multerReq = req as MulterRequest;
    if (!multerReq.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    console.log('File received:', multerReq.file);
    console.log('Request body:', req.body);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, multerReq.file.filename);
    console.log('File path:', filePath);

    // Create a new lecture summary document
    const lectureSummary = new LectureSummary({
      title: req.body.title || 'Untitled Lecture',
      subject: req.body.subject || 'General',
      teacherId: multerReq.user?.id,
      audioFile: {
        url: `/uploads/${multerReq.file.filename}`,
        filename: multerReq.file.filename,
      },
      status: 'draft'
    });

    console.log('Saving lecture summary:', lectureSummary);
    await lectureSummary.save();
    console.log('Lecture summary saved successfully');

    // Process the audio file
    try {
      console.log('Starting audio processing');
      const { transcription, summary } = await processAudioFile(filePath);
      console.log('Audio processing completed');

      lectureSummary.transcription = transcription;
      lectureSummary.summary = summary;
      await lectureSummary.save();
      console.log('Updated lecture summary with transcription and summary');
    } catch (error) {
      console.error('Error processing audio:', error);
      // Don't fail the upload if processing fails
    }

    res.status(201).json(lectureSummary);
  } catch (error: any) {
    console.error('Error in upload route:', error);
    res.status(500).json({ message: 'Error uploading lecture', error: error.message });
  }
});

// Get all lecture summaries for a teacher
router.get('/teacher', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const summaries = await LectureSummary.find({ teacherId: req.user!.id })
      .sort({ createdAt: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lecture summaries' });
  }
});

// Get published lecture summaries for students
router.get('/student', authenticateToken, async (req: Request, res: Response) => {
  try {
    const summaries = await LectureSummary.find({ status: 'published' })
      .sort({ publishedAt: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lecture summaries' });
  }
});

// Publish a lecture summary
router.patch('/:id/publish', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const summary = await LectureSummary.findOne({
      _id: req.params.id,
      teacherId: req.user!.id,
    });

    if (!summary) {
      return res.status(404).json({ message: 'Lecture summary not found' });
    }

    summary.status = 'published';
    summary.publishedAt = new Date();
    await summary.save();

    res.json({ message: 'Lecture summary published successfully', summary });
  } catch (error) {
    res.status(500).json({ message: 'Error publishing lecture summary' });
  }
});

// Delete a lecture summary
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const summary = await LectureSummary.findOneAndDelete({
      _id: req.params.id,
      teacherId: req.user!.id,
    });

    if (!summary) {
      return res.status(404).json({ message: 'Lecture summary not found' });
    }

    res.json({ message: 'Lecture summary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lecture summary' });
  }
});

// Update a lecture summary
router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, subject } = req.body;
    const summary = await LectureSummary.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user?.id },
      { title, subject },
      { new: true }
    );

    if (!summary) {
      return res.status(404).json({ message: 'Lecture summary not found' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Error updating lecture summary:', error);
    res.status(500).json({ message: 'Error updating lecture summary' });
  }
});

export default router; 
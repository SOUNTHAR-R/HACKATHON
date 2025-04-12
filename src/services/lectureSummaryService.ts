import axios from 'axios';

const API_URL = 'http://localhost:5004/api';

export interface LectureSummary {
  _id: string;
  title: string;
  subject: string;
  teacherId: string;
  audioFile: {
    url: string;
    filename: string;
  };
  transcription: string;
  summary: {
    overview: string;
    keyPoints: string[];
    detailedExplanation: string;
  };
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const lectureSummaryService = {
  // Upload a new lecture recording
  uploadLecture: async (audioFile: File, title: string, subject: string) => {
    try {
      console.log('Preparing upload:', { title, subject, fileName: audioFile.name });
      
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('title', title);
      formData.append('subject', subject);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Sending request to:', `${API_URL}/lecture-summaries/upload`);
      
      const response = await axios.post(`${API_URL}/lecture-summaries/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log('Upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Upload error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload lecture');
    }
  },

  // Get all lecture summaries for a teacher
  getTeacherSummaries: async () => {
    const response = await axios.get(`${API_URL}/lecture-summaries/teacher`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      withCredentials: true,
    });

    return response.data;
  },

  // Get published lecture summaries for students
  getStudentSummaries: async () => {
    const response = await axios.get(`${API_URL}/lecture-summaries/student`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      withCredentials: true,
    });

    return response.data;
  },

  // Publish a lecture summary
  publishSummary: async (id: string) => {
    const response = await axios.patch(
      `${API_URL}/lecture-summaries/${id}/publish`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      }
    );

    return response.data;
  },

  // Delete a lecture summary
  deleteSummary: async (id: string) => {
    const response = await axios.delete(`${API_URL}/lecture-summaries/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      withCredentials: true,
    });

    return response.data;
  },

  // Update a lecture summary
  updateSummary: async (id: string, data: { title: string; subject: string }) => {
    const response = await axios.patch(
      `${API_URL}/lecture-summaries/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      }
    );

    return response.data;
  },
}; 
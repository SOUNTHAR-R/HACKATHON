import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { lectureSummaryService, LectureSummary } from '../../services/lectureSummaryService';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lectureSummaries, setLectureSummaries] = useState<LectureSummary[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingLecture, setEditingLecture] = useState<LectureSummary | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');

  useEffect(() => {
    loadLectureSummaries();
  }, []);

  const loadLectureSummaries = async () => {
    try {
      const summaries = await lectureSummaryService.getTeacherSummaries();
      setLectureSummaries(summaries);
    } catch (error) {
      console.error('Error loading lecture summaries:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }

    setUploading(true);
    try {
      const titleInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      const subjectSelect = document.querySelector('select') as HTMLSelectElement;
      
      if (!titleInput || !subjectSelect) {
        throw new Error('Form elements not found');
      }

      const title = titleInput.value || 'New Lecture Recording';
      const subject = subjectSelect.value || 'Physics';

      console.log('Uploading lecture:', { title, subject, fileName: selectedFile.name });
      
      const result = await lectureSummaryService.uploadLecture(selectedFile, title, subject);
      console.log('Upload successful:', result);
      
      await loadLectureSummaries();
      setSelectedFile(null);
      
      // Clear the form
      titleInput.value = '';
      subjectSelect.value = 'Physics';
    } catch (error: any) {
      console.error('Error uploading lecture:', error);
      alert(`Error uploading lecture: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (summaryId: string) => {
    try {
      await lectureSummaryService.publishSummary(summaryId);
      await loadLectureSummaries();
    } catch (error) {
      console.error('Error publishing summary:', error);
    }
  };

  const handleDelete = async (summaryId: string) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await lectureSummaryService.deleteSummary(summaryId);
        await loadLectureSummaries();
      } catch (error) {
        console.error('Error deleting lecture:', error);
        alert('Failed to delete lecture');
      }
    }
  };

  const handleEdit = (summary: LectureSummary) => {
    setEditingLecture(summary);
    setEditTitle(summary.title);
    setEditSubject(summary.subject);
  };

  const handleUpdate = async () => {
    if (!editingLecture) return;

    try {
      await lectureSummaryService.updateSummary(editingLecture._id, {
        title: editTitle,
        subject: editSubject
      });
      await loadLectureSummaries();
      setEditingLecture(null);
    } catch (error) {
      console.error('Error updating lecture:', error);
      alert('Failed to update lecture');
    }
  };

  // Mock data for class performance
  const performanceData = {
    labels: ['Class A', 'Class B', 'Class C', 'Class D', 'Class E'],
    datasets: [
      {
        label: 'Average Marks',
        data: [75, 82, 68, 90, 85],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Students</h3>
              <p className="text-3xl font-bold text-blue-600">150</p>
              <p className="text-sm text-gray-500">Across 5 classes</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Attendance</h3>
              <p className="text-3xl font-bold text-green-600">92%</p>
              <p className="text-sm text-gray-500">Last month</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Assignments</h3>
              <p className="text-3xl font-bold text-yellow-600">8</p>
              <p className="text-sm text-gray-500">To be reviewed</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Lecture Notes</h3>
              <p className="text-3xl font-bold text-purple-600">15</p>
              <p className="text-sm text-gray-500">Published summaries</p>
            </div>
          </div>
        );

      case 'lecture-management':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upload New Lecture</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lecture Title</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter lecture title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Audio Recording</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Lecture'}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Lecture Summaries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lectureSummaries.map((summary) => (
                  <div key={summary._id} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                    {editingLecture?._id === summary._id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Subject</label>
                          <select
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option>Physics</option>
                            <option>Chemistry</option>
                            <option>Mathematics</option>
                          </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingLecture(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold text-gray-800">{summary.title}</h3>
                        <p className="text-gray-600">{summary.subject}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {new Date(summary.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              summary.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {summary.status}
                            </span>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Transcription</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{summary.transcription}</p>
                          </div>

                          {summary.summary && (
                            <>
                              <div className="mt-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Overview</h4>
                                <p className="text-gray-600 text-sm">{summary.summary.overview}</p>
                              </div>

                              <div className="mt-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Key Points</h4>
                                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                  {summary.summary.keyPoints.map((point, index) => (
                                    <li key={index}>{point}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="mt-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Detailed Explanation</h4>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{summary.summary.detailedExplanation}</p>
                              </div>
                            </>
                          )}

                          <div className="flex justify-end space-x-2 mt-4">
                            <button
                              onClick={() => handleEdit(summary)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(summary._id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                              Delete
                            </button>
                            {summary.status === 'draft' && (
                              <button
                                onClick={() => handlePublish(summary._id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                              >
                                Publish
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Attendance Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Class-wise Attendance</h3>
                <div className="h-[300px]">
                  <Bar data={performanceData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Attendance Distribution</h3>
                <div className="h-[300px]">
                  <Pie
                    data={{
                      labels: ['Present', 'Absent', 'Late'],
                      datasets: [
                        {
                          data: [85, 10, 5],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.5)',
                            'rgba(239, 68, 68, 0.5)',
                            'rgba(234, 179, 8, 0.5)',
                          ],
                          borderColor: [
                            'rgb(59, 130, 246)',
                            'rgb(239, 68, 68)',
                            'rgb(234, 179, 8)',
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right' as const,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'marks':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Marks & Performance Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Class Performance</h3>
                <div className="h-[300px]">
                  <Bar data={performanceData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">A Grade (90-100)</span>
                      <span className="text-sm font-medium text-gray-700">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">B Grade (80-89)</span>
                      <span className="text-sm font-medium text-gray-700">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">C Grade (70-79)</span>
                      <span className="text-sm font-medium text-gray-700">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">D Grade (60-69)</span>
                      <span className="text-sm font-medium text-gray-700">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'assignments':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Assignment Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Create New Assignment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assignment Title</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter assignment title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Physics</option>
                      <option>Chemistry</option>
                      <option>Mathematics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="datetime-local"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={4}
                      placeholder="Enter assignment description"
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Create Assignment
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Pending Assignments</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-800">Physics Lab Report</h4>
                    <p className="text-sm text-gray-600">Due: Tomorrow</p>
                    <p className="text-sm text-gray-600 mt-2">Submitted: 15/20 students</p>
                    <div className="mt-4 flex space-x-2">
                      <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        Review Submissions
                      </button>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Send Reminder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-quizzes':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">AI Quiz Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Create AI Quiz</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quiz Title</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter quiz title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Physics</option>
                      <option>Chemistry</option>
                      <option>Mathematics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Questions</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Generate Quiz
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Active Quizzes</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-800">Quantum Mechanics Quiz</h4>
                    <p className="text-sm text-gray-600">Duration: 30 minutes</p>
                    <p className="text-sm text-gray-600">Questions: 10</p>
                    <p className="text-sm text-gray-600 mt-2">Active Students: 18/20</p>
                    <div className="mt-4 flex space-x-2">
                      <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        View Results
                      </button>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                        End Quiz
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Announcements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Create Announcement</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter announcement title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={4}
                      placeholder="Enter announcement message"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Classes</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>All Classes</option>
                      <option>Class A</option>
                      <option>Class B</option>
                      <option>Class C</option>
                    </select>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Post Announcement
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Recent Announcements</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-800">Mid-term Exam Schedule</h4>
                    <p className="text-sm text-gray-600">Posted: 2 hours ago</p>
                    <p className="text-sm text-gray-600 mt-2">Target: All Classes</p>
                    <div className="mt-4 flex space-x-2">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Edit
                      </button>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default TeacherDashboard; 
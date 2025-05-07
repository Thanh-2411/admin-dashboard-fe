import React, { useState, useEffect, useMemo, useRef   } from 'react';  
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { TrashIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon, ArrowUpIcon, UsersIcon, BookOpenIcon, PencilIcon, FolderIcon, Bars3Icon, EyeIcon, BellIcon, PaperAirplaneIcon, ArrowPathIcon, ArrowLeftIcon, CurrencyDollarIcon, ChartBarIcon, AcademicCapIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './index.css';
import { useLocation } from 'react-router-dom';
import debounce from 'lodash/debounce';



// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// Hàm tính thời gian tương đối
const getRelativeTime = (date) => {
  const now = new Date(); 
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
};

// API để lấy danh sách tất cả người dùng
const fetchUsersFromAPI = async () => {
  try {
    const response = await fetch(`http://localhost:8080/getAll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi lấy danh sách người dùng: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API fetchUsersFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error('Dữ liệu từ API không phải là mảng');
    }
  } catch (error) {
    console.error('Lỗi fetchUsersFromAPI:', error.message, error.stack);
    throw new Error(`Không thể lấy danh sách người dùng: ${error.message}`);
  }
};

// API để lấy thông tin người dùng theo ID
const fetchUserByIdFromAPI = async (userId) => {
  try {
    const response = await fetch(`http://localhost:8080/get/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi lấy thông tin người dùng: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API fetchUserByIdFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (data === null) {
      return null; // Không tìm thấy người dùng
    } else if (data && typeof data === 'object') {
      return data;
    } else {
      throw new Error('Dữ liệu từ API không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi fetchUserByIdFromAPI:', error.message, error.stack);
    throw new Error(`Không thể lấy thông tin người dùng: ${error.message}`);
  }
};

// API để lấy thông tin người dùng theo email
const fetchUserByEmailFromAPI = async (email) => {
  try {
    const response = await fetch(`http://localhost:8080/getByEmail?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi lấy thông tin người dùng: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API fetchUserByEmailFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (data.status === 'success' && data.data) {
      return data.data;
    } else if (data.status === 'error') {
      throw new Error(data.data || 'Không tìm thấy người dùng');
    } else {
      throw new Error('Dữ liệu từ API không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi fetchUserByEmailFromAPI:', error.message, error.stack);
    throw new Error(`Không thể lấy thông tin người dùng: ${error.message}`);
  }
};

// API để thêm người dùng mới
const addUserFromAPI = async (userData) => {
  try {
    const response = await fetch(`http://localhost:8080/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi thêm người dùng: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API addUserFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (data.status === 'success' && data.data) {
      return data.data; // Trả về ID người dùng
    } else if (data.status === 'error') {
      throw new Error(data.data || 'Không thể thêm người dùng');
    } else {
      throw new Error('Dữ liệu từ API không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi addUserFromAPI:', error.message, error.stack);
    throw new Error(`Không thể thêm người dùng: ${error.message}`);
  }
};

// API để cập nhật thông tin người dùng
const updateUserFromAPI = async (userData) => {
  try {
    const response = await fetch(`http://localhost:8080/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
      body: JSON.stringify({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi cập nhật người dùng: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API updateUserFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (data.status === 'success' && data.data) {
      return data.data; // Trả về UserDTO
    } else if (data.status === 'error') {
      throw new Error(data.data || 'Không thể cập nhật người dùng');
    } else {
      throw new Error('Dữ liệu từ API không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi updateUserFromAPI:', error.message, error.stack);
    throw new Error(`Không thể cập nhật người dùng: ${error.message}`);
  }
};

// API để cập nhật avatar người dùng
const updateUserAvatarFromAPI = async (userData) => {
  try {
    const response = await fetch(`http://localhost:8080/update/avatar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
      body: JSON.stringify({
        id: userData.id,
        avatar: userData.avatar,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi cập nhật avatar: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API updateUserAvatarFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (data.status === 'success' && data.data) {
      return data.data; // Trả về message
    } else if (data.status === 'error') {
      throw new Error(data.data || 'Không thể cập nhật avatar');
    } else {
      throw new Error('Dữ liệu từ API không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi updateUserAvatarFromAPI:', error.message, error.stack);
    throw new Error(`Không thể cập nhật avatar: ${error.message}`);
  }
};

// API để xóa người dùng
const deleteUserFromAPI = async (userId) => {
  try {
    const response = await fetch(`http://localhost:8080/delete/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi xóa người dùng: ${response.status} ${response.statusText}`);
    }

    const data = await response.text();
    console.log('Dữ liệu từ API deleteUserFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (typeof data === 'string') {
      return data; // Trả về message
    } else {
      throw new Error('Dữ liệu từ API không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi deleteUserFromAPI:', error.message, error.stack);
    throw new Error(`Không thể xóa người dùng: ${error.message}`);
  }
};


// API để gán tester cho dự án
const assignTestersToProject = async (projectId, testers) => {
  try {
    const response = await fetch(`http://localhost:8080/projects/${projectId}/assign-testers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token-here',
      },
      body: JSON.stringify({ testers: testers.map(t => t.id) }),
    });

    if (!response.ok) {
      throw new Error('Không thể gán tester cho dự án');
    }

    const data = await response.json();
    return { success: true, message: `Tester ${testers.map(t => t.name).join(', ')} đã được gán vào dự án ${projectId}.` };
  } catch (error) {
    throw new Error('Không thể gán tester cho dự án');
  }
};

// API để lấy danh sách dự án
const fetchProjectsFromAPI = async () => {
  try {
    const response = await fetch('https://api.example.com/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token-here',
      },
    });

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách dự án');
    }

    const data = await response.json();
    return data.projects;
  } catch (error) {
    throw new Error('Không thể lấy danh sách dự án');
  }
};

// API để thêm dự án
  async function addProjectToAPI(project) {
    try {
      const response = await fetch('https://api.example.com/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-token-here',
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error('Không thể thêm dự án');
      }

      const data = await response.json();
      return data.project;
    } catch (error) {
      throw new Error('Không thể thêm dự án');
    }
  }

// API để lấy danh sách giao dịch
const fetchTransactionsFromAPI = async () => {
  try {
    const response = await fetch('https://api.example.com/transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token-here',
      },
    });

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách giao dịch');
    }

    const data = await response.json();
    return data.transactions;
  } catch (error) {
    throw new Error('Không thể lấy danh sách giao dịch');
  }
};

// API để thêm giao dịch
const addTransactionToAPI = async (transaction) => {
  try {
    const response = await fetch('https://api.example.com/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token-here',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error('Không thể thêm giao dịch');
    }

    const data = await response.json();
    return data.transaction;
  } catch (error) {
    throw new Error('Không thể thêm giao dịch');
  }
};

// API để cập nhật trạng thái giao dịch
const updateTransactionStatusAPI = async (transactionId, status) => {
  try {
    const response = await fetch(`https://api.example.com/transactions/${transactionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token-here',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Không thể cập nhật trạng thái giao dịch');
    }

    const data = await response.json();
    return data.transaction;
  } catch (error) {
    throw new Error('Không thể cập nhật trạng thái giao dịch');
  }
};

// API để lấy danh sách khóa học
const fetchCoursesFromAPI = async () => {
  try {
    const response = await fetch('http://localhost:8080/course/getAll', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi lấy danh sách khóa học: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API fetchCoursesFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data; // Trường hợp API trả về { data: [...] }
    } else {
      throw new Error('Dữ liệu từ API không phải là mảng');
    }
  } catch (error) {
    console.error('Lỗi fetchCoursesFromAPI:', error);
    throw new Error('Không thể lấy danh sách khóa học');
  }
};

// API để thêm hoặc cập nhật khóa học
const saveCourseToAPI = async (course) => {
  try {
    const method = course.id ? 'PUT' : 'POST';
    const url = course.id 
      ? `http://localhost:8080/course/update/${course.id}` 
      : 'http://localhost:8080/course/create';

    // Gán giá trị mặc định nếu thiếu
    const payload = {
      title: course.title,
      description: course.description,
      isRequired: course.isRequired ?? false,
      isBlocked: course.isBlocked ?? false, // đảm bảo không null
      type: course.type,
      linkImg: course.linkImg || null,
      requiredCourseId: course.requiredCourseId || null,
    };

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi khi lưu khóa học: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API saveCourseToAPI:', data);
    return data;
  } catch (error) {
    console.error('Lỗi saveCourseToAPI:', error);
    throw new Error('Không thể lưu khóa học');
  }
};

// API để xóa một khóa học
const deleteCourseFromAPI = async (courseId) => {
  try {
    // Giả định điểm cuối, thay thế bằng điểm cuối thực tế của bạn
    const response = await fetch(`http://localhost:8080/course/delete/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi khi xóa khóa học: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Backend có thể không trả về dữ liệu, chỉ cần kiểm tra status
    return { success: true };
  } catch (error) {
    console.error('Lỗi deleteCourseFromAPI:', error);
    throw new Error('Không thể xóa khóa học');
  }
};

// API để lấy danh sách tất cả bài học
const fetchLessonsFromAPI = async () => {
  try {
    const response = await fetch(`http://localhost:8080/lesson/getAll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi lấy danh sách bài học: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API fetchLessonsFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data; // Trường hợp API trả về { data: [...] }
    } else {
      throw new Error('Dữ liệu từ API không phải là mảng');
    }
  } catch (error) {
    console.error('Lỗi fetchLessonsFromAPI:', error);
    throw new Error('Không thể lấy danh sách bài học');
  }
};

// API để tạo bài học mới
const createLessonFromAPI = async (lessonData) => {
  try {
    const response = await fetch(`http://localhost:8080/lesson/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
      body: JSON.stringify({
        courseId: lessonData.courseId,
        title: lessonData.title,
        link: lessonData.link,
        linkImg: lessonData.linkImg || null,
        description: lessonData.description || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi tạo bài học: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API createLessonFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (data && data.data) {
      return data.data; // Trả về message hoặc dữ liệu từ server
    } else {
      throw new Error('Dữ liệu từ API không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi createLessonFromAPI:', error);
    throw new Error('Không thể tạo bài học');
  }
};

// API để xóa bài học
const deleteLessonsFromAPI = async (ids) => {
  try {
    const response = await fetch(`http://localhost:8080/lesson/delete/${ids.join(',')}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi xóa bài học: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API deleteLessonsFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (data && data.data) {
      return data.data; // Trả về message từ server
    } else {
      throw new Error('Dữ liệu từ API không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi deleteLessonsFromAPI:', error);
    throw new Error('Không thể xóa bài học');
  }
};

// API để cập nhật bài học
const updateLessonFromAPI = async (lessonId, lessonData) => {
  try {
    const response = await fetch(`http://localhost:8080/lesson/update/${lessonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Nếu backend yêu cầu token, hãy thêm vào đây
        // 'Authorization': 'Bearer your-token-here',
      },
      body: JSON.stringify({
        courseId: lessonData.courseId,
        title: lessonData.title,
        link: lessonData.Lessonlink,
        linkImg: lessonData.linkImg || null,
        description: lessonData.description || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi cập nhật bài học: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API updateLessonFromAPI:', data); // Ghi log để kiểm tra

    // Kiểm tra định dạng dữ liệu
    if (data && data.data) {
      return data.data; // Trả về message từ server
    } else {
      throw new Error('Dữ liệu từ API không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi updateLessonFromAPI:', error);
    throw new Error('Không thể cập nhật bài học');
  }
};

const fetchLessonsByCourseId = async (courseId) => {
  try {
    const response = await fetch(`http://localhost:8080/lesson/getByCourseId?courseId=${courseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi lấy danh sách bài học: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dữ liệu từ API fetchLessonsByCourseId:', data);

    if (Array.isArray(data.data)) {
      return data.data;
    } else {
      throw new Error('Dữ liệu từ API không phải là mảng');
    }
  } catch (error) {
    console.error('Lỗi fetchLessonsByCourseId:', error);
    throw new Error('Không thể lấy danh sách bài học');
  }
};

function ProjectDetail({ setNotifications }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [testers, setTesters] = useState([]);
  const [selectedTesters, setSelectedTesters] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [bugFile, setBugFile] = useState(null);
  const [bugList, setBugList] = useState([]);
  const [testHistory, setTestHistory] = useState([]);
  const [isApproving, setIsApproving] = useState(false);
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTesterModal, setShowTesterModal] = useState(false);
  const [payouts, setPayouts] = useState([]);
  const [isCheckingEntity, setIsCheckingEntity] = useState(false);

  // Tải dữ liệu dự án, tester, và danh sách bug khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mô phỏng dữ liệu dự án với trạng thái khác nhau
        const projectStatus = parseInt(projectId) % 3 === 0 ? 'open' : parseInt(projectId) % 3 === 1 ? 'accepted' : 'reject';
        const subStatus = projectStatus === 'accepted' ? (parseInt(projectId) % 2 === 0 ? 'ongoing' : 'completed') : null;
        
        setProject({
          id: parseInt(projectId),
          name: `Dự án ${projectId}`,
          customer: 'NEUFFER FENSTER + TÜREN GMBH',
          description: 'A project focused on developing AI models for image recognition.',
          status: projectStatus,
          subStatus: subStatus,
          assignedTesters: [],
          createdAt: new Date().toISOString(),
          reason: projectStatus === 'reject' ? 'Không đáp ứng yêu cầu kỹ thuật' : '',
        });
        setTesters([]);
        setBugList([]);
        setPayouts([
          { type: 'Function Low', amount: 5, reprod: 1 },
          { type: 'Function High', amount: 10, reprod: 2 },
          { type: 'Function Critical', amount: 15, reprod: 3 },
          { type: 'Visual', amount: 5, reprod: 1 },
          { type: 'Content', amount: 5, reprod: 1 },
        ]);
      } catch (error) {
        setErrorMessage('Lỗi khi tải dữ liệu. Vui lòng thử lại.');
      }
    };
    fetchData();
  }, [projectId]);

  if (!project) {
    return <div className="text-center text-gray-500 text-lg py-10">Dự án không tồn tại!</div>;
  }

  const approveProject = async () => {
    if (selectedTesters.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một tester!');
      return;
    }
    setIsApproving(true);
    try {
      setProject({ ...project, status: 'accepted', subStatus: 'ongoing', assignedTesters: selectedTesters.map(t => t.name) });
      setTestHistory(prev => [...prev, { action: `Chấp nhận dự án với tester: ${selectedTesters.map(t => t.name).join(', ')}`, timestamp: new Date().toISOString() }]);
      setNotifications(prev => [...prev, { message: `Dự án ${project.name} đã được chấp nhận. Tester: ${selectedTesters.map(t => t.name).join(', ')}`, timestamp: new Date().toISOString(), isRead: false }]);
      navigate('/projects');
    } catch (error) {
      setErrorMessage('Lỗi khi chấp nhận dự án. Vui lòng thử lại.');
    } finally {
      setIsApproving(false);
    }
  };

  const rejectProject = async () => {
    if (!rejectionReason.trim()) {
      setErrorMessage('Vui lòng nhập lý do từ chối!');
      return;
    }
    try {
      setProject({ ...project, status: 'reject', reason: rejectionReason });
      setTestHistory(prev => [...prev, { action: `Từ chối dự án. Lý do: ${rejectionReason}`, timestamp: new Date().toISOString() }]);
      setNotifications(prev => [...prev, { message: `Dự án ${project.name} đã bị từ chối. Lý do: ${rejectionReason}`, timestamp: new Date().toISOString(), isRead: false }]);
      setRejectionReason('');
      setShowRejectPopup(false);
      navigate('/projects');
    } catch (error) {
      setErrorMessage('Lỗi khi từ chối dự án. Vui lòng thử lại.');
    }
  };

  const markProjectAsCompleted = async () => {
    try {
      setProject({ ...project, subStatus: 'completed' });
      setTestHistory(prev => [...prev, { action: 'Hoàn thành kiểm thử dự án', timestamp: new Date().toISOString() }]);
      setNotifications(prev => [...prev, { message: `Dự án ${project.name} đã hoàn thành kiểm thử.`, timestamp: new Date().toISOString(), isRead: false }]);
    } catch (error) {
      setErrorMessage('Lỗi khi hoàn thành kiểm thử. Vui lòng thử lại.');
    }
  };

  const handleFileUpload = (e) => setBugFile(e.target.files[0]);

  const sendBugFile = async () => {
    if (!bugFile) {
      setErrorMessage('Vui lòng chọn file bug để gửi!');
      return;
    }
    try {
      const bugEntry = { fileName: bugFile.name, timestamp: new Date().toISOString() };
      setBugList(prev => [...prev, bugEntry]);
      setTestHistory(prev => [...prev, { action: `Gửi file bug: ${bugFile.name}`, timestamp: new Date().toISOString() }]);
      setNotifications(prev => [...prev, { message: `File bug ${bugFile.name} đã được gửi cho dự án ${project.name}.`, timestamp: new Date().toISOString(), isRead: false }]);
      setBugFile(null);
    } catch (error) {
      setErrorMessage('Lỗi khi gửi file bug. Vui lòng thử lại.');
    }
  };

  const requestReopenProject = async () => {
    try {
      setTestHistory(prev => [...prev, { action: 'Yêu cầu mở lại dự án', timestamp: new Date().toISOString() }]);
      setNotifications(prev => [...prev, { message: `Yêu cầu mở lại dự án ${project.name} đã được gửi.`, timestamp: new Date().toISOString(), isRead: false }]);
    } catch (error) {
      setErrorMessage('Lỗi khi yêu cầu mở lại dự án. Vui lòng thử lại.');
    }
  };

  const checkEntity = async () => {
    setIsCheckingEntity(true);
    try {
      setTestHistory(prev => [...prev, { action: 'Kiểm tra entity thành công', timestamp: new Date().toISOString() }]);
      setNotifications(prev => [...prev, { message: `Đã kiểm tra entity cho dự án ${project.name}.`, timestamp: new Date().toISOString(), isRead: false }]);
    } catch (error) {
      setErrorMessage('Lỗi khi kiểm tra entity. Vui lòng thử lại.');
    } finally {
      setIsCheckingEntity(false);
    }
  };

  const fetchTesters = async () => {
    try {
      const mockTesters = [
        { id: 1, name: 'Tester 1', experience: 3, skills: ['AI', 'Testing'] },
        { id: 2, name: 'Tester 2', experience: 5, skills: ['AI', 'Automation'] },
      ];
      setTesters(mockTesters);
      setNotifications(prev => [...prev, { message: 'Đã tải danh sách tester.', timestamp: new Date().toISOString(), isRead: false }]);
    } catch (error) {
      setErrorMessage('Lỗi khi tải danh sách tester. Vui lòng thử lại.');
    }
  };

  const displayStatus = () => {
    if (project.status === 'accepted') {
      if (project.subStatus === 'ongoing') return 'Đã duyệt (Đang kiểm thử)';
      if (project.subStatus === 'completed') return 'Đã duyệt (Hoàn thành kiểm thử)';
    }
    return project.status === 'open' ? 'Mới' : 'Bị từ chối';
  };

  const handleConfirmTesters = () => {
    setShowTesterModal(false);
  };

  return (
    <div className="main-content px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="card bg-white shadow-lg rounded-xl p-8 max-w-5xl mx-auto">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-center border border-red-200">
            {errorMessage}
            <button onClick={() => setErrorMessage('')} className="ml-2 text-red-900 font-medium hover:underline">Đóng</button>
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/projects')} className="btn-back flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" /> Quay lại
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết dự án kiểm thử</h2>
          <div className="w-20"></div>
        </div>

        <div className="project-details mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Thông tin dự án</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg shadow-sm">
            <div><span className="font-medium text-gray-600">Tên dự án:</span> {project.name}</div>
            <div><span className="font-medium text-gray-600">Khách hàng:</span> {project.customer}</div>
            <div><span className="font-medium text-gray-600">Mô tả:</span> {project.description || 'Không có mô tả'}</div>
            <div><span className="font-medium text-gray-600">Trạng thái:</span> {displayStatus()}</div>
            <div><span className="font-medium text-gray-600">Tester được gán:</span> {project.assignedTesters ? project.assignedTesters.join(', ') : 'Chưa gán'}</div>
            <div><span className="font-medium text-gray-600">Ngày tạo:</span> {new Date(project.createdAt).toLocaleString('vi-VN')}</div>
            {project.status === 'reject' && (
              <div className="col-span-2"><span className="font-medium text-gray-600">Lý do từ chối:</span> {project.reason}</div>
            )}
          </div>
        </div>

        <div className="test-features mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Tính năng cần kiểm thử</h3>
          <div className="feature-tag mb-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full inline-block">
            Phân bổ Tester tự động bằng AI
          </div>
          <div className="bug-types flex gap-3 mb-4">
            <div className="bug-type functional flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full">
              <svg className="w-4 h-4" viewBox="0 0 10 10" fill="currentColor">
                <polygon points="0,10 5,0 10,10" />
              </svg>
              Chức năng
            </div>
            <div className="bug-type content flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
              <svg className="w-4 h-4" viewBox="0 0 10 10" fill="currentColor">
                <polygon points="0,10 5,0 10,10" />
              </svg>
              Hiệu suất
            </div>
            <div className="bug-type visual flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full">
              <svg className="w-4 h-4" viewBox="0 0 10 10" fill="currentColor">
                <polygon points="0,10 5,0 10,10" />
              </svg>
              Tương thích
            </div>
          </div>
          <h4 className="font-medium text-gray-600 mb-2">Vị trí tính năng:</h4>
          <div className="feature-info-box mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            Có thể truy cập từ bảng điều khiển "Quản lý dự án" trong phần "Phân bổ Tester".
          </div>
          <h4 className="font-medium text-gray-600 mb-2">Nội dung cần kiểm thử:</h4>
          <div className="feature-info-box p-4 bg-gray-50 rounded-lg border border-gray-200">
            <ul className="list-disc pl-5 space-y-1">
              <li>AI tự động gợi ý tester dựa trên kỹ năng, kinh nghiệm và lịch trống.</li>
              <li>Hệ thống cho phép điều chỉnh thủ công tester được gợi ý bởi AI nếu cần.</li>
              <li>Đảm bảo quá trình phân bổ hoàn thành trong vòng 5 giây cho dự án có tối đa 50 tester.</li>
            </ul>
          </div>
          {showMoreFeatures && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <h5 className="font-medium text-gray-600">Chi tiết thêm:</h5>
              <p className="mt-2">Thông tin chi tiết về tính năng kiểm thử, bao gồm các bước cụ thể và yêu cầu đặc biệt.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Bước 1: Kiểm tra khả năng tích hợp với hệ thống hiện tại.</li>
                <li>Bước 2: Đánh giá hiệu suất dưới tải cao.</li>
                <li>Bước 3: Xác minh tính tương thích trên các nền tảng khác nhau.</li>
              </ul>
            </div>
          )}
          <div className="text-right mt-3">
            <button 
              onClick={() => setShowMoreFeatures(!showMoreFeatures)} 
              className="text-blue-600 hover:underline font-medium"
            >
              {showMoreFeatures ? 'Thu gọn' : 'Xem thêm'}
            </button>
          </div>
        </div>

        {project.status === 'accepted' && project.subStatus === 'completed' && (
          <div className="bug-list mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Danh sách bug đã báo cáo</h3>
            {bugList.length === 0 ? (
              <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg shadow-sm">Chưa có bug nào được báo cáo</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-left border-b font-medium text-gray-600">Tên file bug</th>
                      <th className="p-4 text-left border-b font-medium text-gray-600">Ngày gửi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bugList.map((bug, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 border-b">{bug.fileName}</td>
                        <td className="p-4 border-b">{new Date(bug.timestamp).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {project.status === 'accepted' && (
          <div className="payout mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Payout</h3>
            <div className="flex justify-end mb-4">
              <button 
                onClick={checkEntity} 
                className="btn-success flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-all duration-200"
                disabled={isCheckingEntity}
              >
                <CheckCircleIcon className="w-5 h-5" /> {isCheckingEntity ? 'Đang kiểm tra...' : 'Check Entity'}
              </button>
              <button 
                onClick={fetchTesters} 
                className="btn-info ml-2 flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-sm hover:bg-indigo-600 transition-all duration-200"
              >
                <CheckCircleIcon className="w-5 h-5" /> Test Features
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4 text-left border-b font-medium text-gray-600" style={{ backgroundColor: '#6B46C1', color: 'white' }}>Bug Type</th>
                    <th className="p-4 text-left border-b font-medium text-gray-600" style={{ backgroundColor: '#6B46C1', color: 'white' }}>Amount</th>
                    <th className="p-4 text-left border-b font-medium text-gray-600" style={{ backgroundColor: '#6B46C1', color: 'white' }}>Reprod.</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b">{payout.type}</td>
                      <td className="p-4 border-b">${payout.amount}</td>
                      <td className="p-4 border-b">${payout.reprod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mục Open: Bao gồm Lựa chọn Tester và các nút Chấp nhận/Từ chối */}
        {project.status === 'open' && (
          <div className="open-section mb-8">
            <div className="tester-selection mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Lựa chọn Tester</h3>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
                <p className="text-gray-600 mb-4">Chọn tester phù hợp để bắt đầu kiểm thử dự án. Bạn có thể chọn nhiều tester dựa trên kinh nghiệm và kỹ năng của họ.</p>
                <div className="max-w-lg mx-auto">
                  <button 
                    onClick={() => setShowTesterModal(true)} 
                    className="btn-info flex items-center gap-2 px-6 py-3 w-full justify-center bg-indigo-500 text-white rounded-lg shadow-sm hover:bg-indigo-600 transition-all duration-200"
                  >
                    <CheckCircleIcon className="w-5 h-5" /> Chọn Tester
                  </button>
                </div>
              </div>
              {testers.length > 0 && (
                <div className="tester-selection w-full max-w-lg mx-auto mt-4">
                  <h4 className="font-medium text-gray-600 mb-3">Danh sách Tester:</h4>
                  <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {testers.map((tester) => (
                      <label key={tester.id} className="tester-option flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={tester.name}
                          checked={selectedTesters.some(t => t.id === tester.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTesters([...selectedTesters, tester]);
                            } else {
                              setSelectedTesters(selectedTesters.filter(t => t.id !== tester.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">
                          {tester.name} ({tester.experience} năm, {tester.skills.join(', ')})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Nút Chấp nhận và Từ chối ở cuối mục Open */}
            <div className="action-buttons flex gap-3 justify-center">
              <button 
                onClick={approveProject} 
                className="btn-success flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-all duration-200" 
                disabled={isApproving}
              >
                <CheckCircleIcon className="w-5 h-5" /> {isApproving ? 'Đang xử lý...' : 'Chấp nhận'}
              </button>
              <button 
                onClick={() => setShowRejectPopup(true)} 
                className="btn-danger flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-all duration-200"
              >
                <XCircleIcon className="w-5 h-5" /> Từ chối
              </button>
            </div>
          </div>
        )}

        <div className="project-actions mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Hành động kiểm thử</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {project.status === 'accepted' && project.subStatus === 'ongoing' && (
              <button 
                onClick={markProjectAsCompleted} 
                className="btn-success flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-all duration-200"
              >
                <CheckCircleIcon className="w-5 h-5" /> Hoàn thành kiểm thử
              </button>
            )}
            {project.status === 'accepted' && project.subStatus === 'completed' && (
              <>
                <div className="form-group w-full max-w-lg mx-auto">
                  <h4 className="font-medium text-gray-600 mb-3">Gửi file bug cho khách hàng:</h4>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="p-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={sendBugFile} 
                      className="btn-primary flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-all duration-200"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" /> Gửi file
                    </button>
                  </div>
                </div>
                <button 
                  onClick={requestReopenProject} 
                  className="btn-info flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-sm hover:bg-indigo-600 transition-all duration-200"
                >
                  <ArrowPathIcon className="w-5 h-5" /> Yêu cầu mở lại
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Chọn Tester */}
      {showTesterModal && project.status === 'open' && (
        <div className="popup-overlay fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="popup-content bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Chọn Tester</h3>
              <button onClick={() => setShowTesterModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-600 mb-3">Danh sách Tester:</h4>
              {testers.length === 0 ? (
                <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">Chưa có tester nào</div>
              ) : (
                <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                  {testers.map((tester) => (
                    <label key={tester.id} className="tester-option flex items-center gap-2 hover:bg-gray-100 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        value={tester.name}
                        checked={selectedTesters.some(t => t.id === tester.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTesters([...selectedTesters, tester]);
                          } else {
                            setSelectedTesters(selectedTesters.filter(t => t.id !== tester.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">
                        {tester.name} ({tester.experience} năm, {tester.skills.join(', ')})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowTesterModal(false)} 
                className="btn-secondary flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600 transition-all duration-200"
              >
                <XCircleIcon className="w-5 h-5" /> Hủy
              </button>
              <button 
                onClick={handleConfirmTesters} 
                className="btn-success flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-all duration-200"
              >
                <CheckCircleIcon className="w-5 h-5" /> Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Từ chối dự án */}
      {showRejectPopup && project.status === 'open' && (
        <div className="popup-overlay fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="popup-content bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Lý do từ chối</h3>
              <button onClick={() => setShowRejectPopup(false)} className="text-gray-500 hover:text-gray-700">
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do từ chối"
              className="p-2 border rounded-lg w-full mb-4 shadow-sm focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-4">
              <button 
                onClick={rejectProject} 
                className="btn-danger flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-all duration-200"
              >
                <CheckCircleIcon className="w-5 h-5" /> Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function PayoutManager({ setNotifications }) {
  const [payoutTab, setPayoutTab] = useState('receive');
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    project: '',
    customer: '',
    amount: '',
    recipient: '',
    role: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [testers, setTesters] = useState([]);
  const [testLeaders, setTestLeaders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await fetchProjectsFromAPI();
        setProjects(projectsData);

        const transactionsData = await fetchTransactionsFromAPI();
        setTransactions(transactionsData);

        // Giả lập lấy danh sách customers, testers, testLeaders
        setCustomers(['Customer 1', 'Customer 2']);
        setTesters(['Tester 1', 'Tester 2', 'Tester 3']);
        setTestLeaders(['Test Leader 1']);
      } catch (error) {
        setNotifications(prev => [...prev, { message: 'Lỗi khi lấy dữ liệu.', timestamp: new Date().toISOString(), isRead: false }]);
      }
    };
    fetchData();
  }, []);

  const balance = useMemo(() => {
    const totalReceived = transactions
      .filter(t => t.type === 'receive' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPaid = transactions
      .filter(t => t.type === 'payout' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    return totalReceived - totalPaid;
  }, [transactions]);

  const completedProjects = projects.filter(
    p => p.status === 'accepted' && p.subStatus === 'completed'
  );

  const projectsWithReceivedPayment = projects.filter(project =>
    transactions.some(
      t => t.type === 'receive' && t.project === project.name && t.status === 'completed'
    )
  );

  const handleReceivePayment = async () => {
    setErrorMessage('');

    if (!newTransaction.project || !newTransaction.customer || !newTransaction.amount) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (amount <= 0) {
      setErrorMessage('Số tiền phải lớn hơn 0!');
      return;
    }

    const project = completedProjects.find(p => p.name === newTransaction.project);
    if (!project) {
      setErrorMessage('Dự án không hợp lệ hoặc chưa hoàn thành!');
      return;
    }

    if (project.customer !== newTransaction.customer) {
      setErrorMessage('Customer không khớp với dự án!');
      return;
    }

    const transaction = {
      id: Date.now(),
      type: 'receive',
      project: newTransaction.project,
      customer: newTransaction.customer,
      amount: amount,
      status: 'completed',
      date: new Date().toISOString(),
    };

    try {
      await addTransactionToAPI(transaction);
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);

      setNotifications(prev => [
        ...prev,
        {
          message: `Đã nhận thanh toán ${amount.toLocaleString()} VNĐ từ ${newTransaction.customer} cho dự án ${newTransaction.project}.`,
          timestamp: new Date().toISOString(),
          isRead: false,
        },
      ]);
      setNewTransaction({ project: '', tier: '', amount: '', recipient: '', role: '' });
    } catch (error) {
      setErrorMessage('Lỗi khi nhận thanh toán. Vui lòng thử lại.');
    }
  };

  const handlePayout = async () => {
    setErrorMessage('');

    if (!newTransaction.recipient || !newTransaction.role || !newTransaction.amount) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (amount <= 0) {
      setErrorMessage('Số tiền phải lớn hơn 0!');
      return;
    }

    if (amount > balance) {
      setErrorMessage('Số dư không đủ để thực hiện thanh toán!');
      return;
    }

    const recipientList = newTransaction.role === 'Tester' ? testers : testLeaders;
    if (!recipientList.includes(newTransaction.recipient)) {
      setErrorMessage('Người nhận không hợp lệ!');
      return;
    }

    const isRecipientInProject = projectsWithReceivedPayment.some(project => {
      if (newTransaction.role === 'Tester') {
        return project.assignedTesters && project.assignedTesters.includes(newTransaction.recipient);
      } else if (newTransaction.role === 'Test Leader') {
        return testLeaders.includes(newTransaction.recipient);
      }
      return false;
    });

    if (!isRecipientInProject) {
      setErrorMessage('Người nhận không tham gia vào dự án đã nhận thanh toán!');
      return;
    }

    const transaction = {
      id: Date.now(),
      type: 'payout',
      recipient: newTransaction.recipient,
      role: newTransaction.role,
      amount: amount,
      status: 'completed',
      date: new Date().toISOString(),
    };

    try {
      await addTransactionToAPI(transaction);
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);

      setNotifications(prev => [
        ...prev,
        {
          message: `Đã thanh toán ${amount.toLocaleString()} VNĐ cho ${newTransaction.recipient} (${newTransaction.role}).`,
          timestamp: new Date().toISOString(),
          isRead: false,
        },
      ]);
      setNewTransaction({ project: '', customer: '', amount: '', recipient: '', role: '' });
    } catch (error) {
      setErrorMessage('Lỗi khi thực hiện thanh toán. Vui lòng thử lại.');
    }
  };

  const cancelTransaction = async (id) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    try {
      await updateTransactionStatusAPI(id, 'canceled');
      const updatedTransactions = transactions.map(t =>
        t.id === id ? { ...t, status: 'canceled' } : t
      );
      setTransactions(updatedTransactions);

      setNotifications(prev => [
        ...prev,
        {
          message: `Giao dịch ${transaction.type === 'receive' ? 'nhận thanh toán' : 'thanh toán'} ${transaction.amount.toLocaleString()} VNĐ đã bị hủy.`,
          timestamp: new Date().toISOString(),
          isRead: false,
        },
      ]);
    } catch (error) {
      setErrorMessage('Lỗi khi hủy giao dịch. Vui lòng thử lại.');
    }
  };

  return (
    <main className="main-content px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="card bg-white shadow-lg rounded-xl p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Payout Manager (Sprint 2)</h2>

        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            Số dư hiện tại: <span className={balance >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
              {balance.toLocaleString()} VNĐ
            </span>
          </h3>
        </div>

        {errorMessage && (
          <div className="mt-4 text-center text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {errorMessage}
          </div>
        )}

        <div className="tab-buttons mt-6 flex justify-center gap-3">
          <button
            className={`tab-button px-4 py-2 rounded-lg font-medium transition-colors ${payoutTab === 'receive' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setPayoutTab('receive')}
          >
            Nhận thanh toán từ Customer
          </button>
          <button
            className={`tab-button px-4 py-2 roundedCancellation-lg font-medium transition-colors ${payoutTab === 'payout' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setPayoutTab('payout')}
          >
            Thanh toán cho Tester/Test Leader
          </button>
        </div>

        {payoutTab === 'receive' && (
          <div className="form-group justify-center mt-6 flex flex-wrap gap-4 max-w-3xl mx-auto">
            <select
              value={newTransaction.project}
              onChange={(e) => {
                const selectedProject = completedProjects.find(p => p.name === e.target.value);
                setNewTransaction({
                  ...newTransaction,
                  project: e.target.value,
                  customer: selectedProject ? selectedProject.customer : '',
                });
              }}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            >
              <option value="">Chọn dự án</option>
              {completedProjects.map(project => (
                <option key={project.id} value={project.name}>{project.name}</option>
              ))}
            </select>
            <select
              value={newTransaction.customer}
              onChange={(e) => setNewTransaction({ ...newTransaction, customer: e.target.value })}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              disabled
            >
              <option value="">Chọn Customer</option>
              {customers.map((customer, index) => (
                <option key={index} value={customer}>{customer}</option>
              ))}
            </select>
            <input
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              placeholder="Số tiền (VNĐ)"
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
            <button onClick={handleReceivePayment} className="btn-primary flex items-center gap-2 px-4 py-2 w-full sm:w-auto bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 hover:shadow-md transition-all duration-200">
              <CurrencyDollarIcon className="w-5 h-5" /> Nhận thanh toán
            </button>
          </div>
        )}

        {payoutTab === 'payout' && (
          <div className="form-group justify-center mt-6 flex flex-wrap gap-4 max-w-3xl mx-auto">
            <select
              value={newTransaction.recipient}
              onChange={(e) => setNewTransaction({ ...newTransaction, recipient: e.target.value })}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            >
              <option value="">Chọn người nhận</option>
              {newTransaction.role === 'Tester' &&
                testers.map((tester, index) => (
                  <option key={`tester-${index}`} value={tester}>{tester}</option>
                ))}
              {newTransaction.role === 'Test Leader' &&
                testLeaders.map((leader, index) => (
                  <option key={`leader-${index}`} value={leader}>{leader}</option>
                ))}
            </select>
            <select
              value={newTransaction.role}
              onChange={(e) => {
                setNewTransaction({ ...newTransaction, role: e.target.value, recipient: '' });
              }}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            >
              <option value="">Chọn vai trò</option>
              <option value="Tester">Tester</option>
              <option value="Test Leader">Test Leader</option>
            </select>
            <input
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              placeholder="Số tiền (VNĐ)"
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
            <button onClick={handlePayout} className="btn-success flex items-center gap-2 px-4 py-2 w-full sm:w-auto bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 hover:shadow-md transition-all duration-200">
              <CurrencyDollarIcon className="w-5 h-5" /> Thanh toán
            </button>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-4">Lịch sử giao dịch</h3>
          {transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg shadow-sm">Không có giao dịch nào</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4 text-left border-b font-medium text-gray-600">Loại giao dịch</th>
                    <th className="p-4 text-left border-b font-medium text-gray-600">Dự án/Người nhận</th>
                    <th className="p-4 text-left border-b font-medium text-gray-600">Số tiền</th>
                    <th className="p-4 text-left border-b font-medium text-gray-600">Trạng thái</th>
                    <th className="p-4 text-left border-b font-medium text-gray-600">Ngày</th>
                    <th className="p-4 text-left border-b font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b">{transaction.type === 'receive' ? 'Nhận thanh toán' : 'Thanh toán'}</td>
                      <td className="p-4 border-b">
                        {transaction.type === 'receive' ? `${transaction.customer} (${transaction.project})` : `${transaction.recipient} (${transaction.role})`}
                      </td>
                      <td className="p-4 border-b">{transaction.amount.toLocaleString()} VNĐ</td>
                      <td className="p-4 border-b">
                        <span
                          className={
                            transaction.status === 'completed'
                              ? 'status-approved'
                              : transaction.status === 'canceled'
                              ? 'status-rejected'
                              : 'status-pending'
                          }
                        >
                          {transaction.status === 'completed' && <CheckCircleIcon className="w-4 h-4" />}
                          {transaction.status === 'canceled' && <XCircleIcon className="w-4 h-4" />}
                          {transaction.status}
                        </span>
                      </td>
                      <td className="p-4 border-b">{new Date(transaction.date).toLocaleString()}</td>
                      <td className="p-4 border-b">
                        {transaction.status === 'completed' && (
                          <button
                            onClick={() => cancelTransaction(transaction.id)}
                            className="btn-danger px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 hover:shadow-md transition-all duration-200"
                          >
                            <XCircleIcon className="w-5 h-5" /> Hủy
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ProjectStatusChart({ projects }) {
  const projectStatusData = useMemo(() => ({
    labels: ['Open', 'Accepted', 'Reject'],
    datasets: [
      {
        label: 'Số lượng dự án',
        data: [
          projects.filter(p => p.status === 'open').length,
          projects.filter(p => p.status === 'accepted').length,
          projects.filter(p => p.status === 'reject').length,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }), [projects]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Số lượng dự án theo trạng thái',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
  };

  return (
    <div className="chart-container bg-white p-6 rounded-lg shadow-lg">
      {projects.length === 0 ? (
        <div className="text-center text-gray-500 py-4">Không có dữ liệu để hiển thị</div>
      ) : (
        <Bar data={projectStatusData} options={chartOptions} />
      )}
    </div>
  );
}

function TransactionChart({ transactions }) {
  const [timeFilter, setTimeFilter] = useState('all');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      if (timeFilter === 'week') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return transactionDate >= oneWeekAgo;
      } else if (timeFilter === 'month') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return transactionDate >= oneMonthAgo;
      } else if (timeFilter === 'year') {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return transactionDate >= oneYearAgo;
      }
      return true;
    });
  }, [transactions, timeFilter]);

  const transactionData = useMemo(() => {
    const transactionDataByDate = filteredTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { receive: 0, payout: 0 };
      }
      if (transaction.type === 'receive') {
        acc[date].receive += transaction.amount;
      } else if (transaction.type === 'payout') {
        acc[date].payout += transaction.amount;
      }
      return acc;
    }, {});

    const dates = Object.keys(transactionDataByDate).sort((a, b) => new Date(a) - new Date(b));
    const receiveData = dates.map(date => transactionDataByDate[date].receive);
    const payoutData = dates.map(date => transactionDataByDate[date].payout);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Số tiền nhận (VNĐ)',
          data: receiveData,
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
        },
        {
          label: 'Số tiền thanh toán (VNĐ)',
          data: payoutData,
          fill: false,
          borderColor: 'rgba(255, 99, 132, 1)',
          tension: 0.1,
        },
      ],
    };
  }, [filteredTransactions]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Số tiền nhận/thanh toán theo thời gian',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString()} VNĐ`,
        },
      },
    },
  };

  return (
    <div className="chart-container bg-white p-6 rounded-lg shadow-lg">
      <div className="filter-group mb-4 flex justify-end">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả</option>
          <option value="week">1 tuần</option>
          <option value="month">1 tháng</option>
          <option value="year">1 năm</option>
        </select>
      </div>
      {filteredTransactions.length === 0 ? (
        <div className="text-center text-gray-500 py-4">Không có dữ liệu để hiển thị</div>
      ) : (
        <Line data={transactionData} options={chartOptions} />
      )}
    </div>
  );
}

function Statistics() {
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await fetchProjectsFromAPI();
        setProjects(projectsData);

        const transactionsData = await fetchTransactionsFromAPI();
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="main-content px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="card bg-white shadow-lg rounded-xl p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Thống kê báo cáo</h2>

        <div className="mt-6">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-4">Thống kê trạng thái dự án</h3>
          <div className="max-w-3xl mx-auto">
            <ProjectStatusChart projects={projects} />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-4">Thống kê giao dịch theo thời gian</h3>
          <div className="max-w-3xl mx-auto">
            <TransactionChart transactions={transactions} />
          </div>
        </div>
      </div>
    </main>
  );
}

function CourseManager({ setNotifications }) {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    isRequired: false,
    type: '',
    linkImg: '',
    requiredCourseId: null,
  });
  const [editCourseId, setEditCourseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  // API để lấy danh sách khóa học
  const fetchCoursesFromAPI = async () => {
    try {
      const response = await fetch('http://localhost:8080/course/getAll', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi lấy danh sách khóa học: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Dữ liệu từ API fetchCoursesFromAPI:', data);

      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        throw new Error('Dữ liệu từ API không phải là mảng');
      }
    } catch (error) {
      console.error('Lỗi fetchCoursesFromAPI:', error);
      throw new Error('Không thể lấy danh sách khóa học');
    }
  };

  // API để thêm hoặc cập nhật khóa học
  // Được sử dụng trong saveCourse
  const saveCourseToAPI = async (course) => {
    try {
      const method = course.id ? 'PUT' : 'POST';
      const url = course.id 
        ? `http://localhost:8080/course/update/${course.id}` 
        : 'http://localhost:8080/course/create';

      const payload = {
        title: course.title,
        description: course.description,
        isRequired: course.isRequired ?? false,
        type: course.type,
        linkImg: course.linkImg || null,
        requiredCourseId: course.requiredCourseId || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi lưu khóa học: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dữ liệu từ API saveCourseToAPI:', data);
      return data;
    } catch (error) {
      console.error('Lỗi saveCourseToAPI:', error);
      throw new Error('Không thể lưu khóa học');
    }
  };

  // API để xóa một khóa học
  // Được sử dụng trong deleteSelectedCourses và deleteCourse
  const deleteCourseFromAPI = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:8080/course/delete/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi xóa khóa học: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Lỗi deleteCourseFromAPI:', error);
      throw new Error('Không thể xóa khóa học');
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesData = await fetchCoursesFromAPI();
        setCourses(coursesData);
      } catch (error) {
        setNotifications(prev => [...prev, { message: error.message, timestamp: new Date().toISOString(), isRead: false }]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [setNotifications]);

  const handleSelectCourse = (courseId) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map(course => course.id));
    }
  };

  const deleteSelectedCourses = async () => {
    if (selectedCourses.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một khóa học để xóa!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedCourses.length} khóa học đã chọn?`)) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all(selectedCourses.map(courseId => deleteCourseFromAPI(courseId)));
      const updatedCourses = courses.filter(course => !selectedCourses.includes(course.id));
      setCourses(updatedCourses);
      setNotifications(prev => [...prev, { message: `Đã xóa ${selectedCourses.length} khóa học.`, timestamp: new Date().toISOString(), isRead: false }]);
      setSelectedCourses([]);
      setErrorMessage('');
    } catch (error) {
      setNotifications(prev => [...prev, { message: error.message, timestamp: new Date().toISOString(), isRead: false }]);
    } finally {
      setLoading(false);
    }
  };

  const saveCourse = async () => {
    if (!newCourse.title || !newCourse.description || !newCourse.type) {
      setErrorMessage('Vui lòng điền đầy đủ các trường bắt buộc (Tiêu đề, Mô tả, Loại)!');
      return;
    }

    setLoading(true);
    try {
      const courseToSave = {
        id: editCourseId || undefined,
        title: newCourse.title,
        description: newCourse.description,
        isRequired: newCourse.isRequired,
        type: newCourse.type,
        linkImg: newCourse.linkImg || null,
        requiredCourseId: newCourse.requiredCourseId ? parseInt(newCourse.requiredCourseId) : null,
      };
      const savedCourse = await saveCourseToAPI(courseToSave);

      // Ánh xạ dữ liệu trả về từ API để đảm bảo cấu trúc đồng nhất
      const formattedCourse = {
        id: savedCourse.id,
        title: savedCourse.title || courseToSave.title,
        description: savedCourse.description || courseToSave.description,
        isRequired: savedCourse.isRequired ?? courseToSave.isRequired,
        type: savedCourse.type || courseToSave.type,
        linkImg: savedCourse.linkImg || courseToSave.linkImg,
        requiredCourseId: savedCourse.requiredCourseId || courseToSave.requiredCourseId,
      };

      if (editCourseId) {
        const updatedCourses = courses.map(course =>
          course.id === editCourseId ? formattedCourse : course
        );
        setCourses(updatedCourses);
        setNotifications(prev => [...prev, { message: `Khóa học ${newCourse.title} đã được cập nhật.`, timestamp: new Date().toISOString(), isRead: false }]);
      } else {
        setCourses([...courses, formattedCourse]);
        setNotifications(prev => [...prev, { message: `Khóa học ${newCourse.title} đã được thêm.`, timestamp: new Date().toISOString(), isRead: false }]);
      }
      setNewCourse({
        title: '',
        description: '',
        isRequired: false,
        type: '',
        linkImg: '',
        requiredCourseId: null,
      });
      setEditCourseId(null);
      setIsFormVisible(false);
      setErrorMessage('');
    } catch (error) {
      setNotifications(prev => [...prev, { message: error.message, timestamp: new Date().toISOString(), isRead: false }]);
    } finally {
      setLoading(false);
    }
  };

  const startEditCourse = (course) => {
    setEditCourseId(course.id);
    setNewCourse({
      title: course.title,
      description: course.description,
      isRequired: course.isRequired,
      type: course.type,
      linkImg: course.linkImg || '',
      requiredCourseId: course.requiredCourseId || null,
    });
    setIsFormVisible(true);
    setErrorMessage('');
  };

  const deleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${courseTitle}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteCourseFromAPI(courseId);
      const updatedCourses = courses.filter(course => course.id !== courseId);
      setCourses(updatedCourses);
      setNotifications(prev => [...prev, { message: `Khóa học ${courseTitle} đã bị xóa.`, timestamp: new Date().toISOString(), isRead: false }]);
    } catch (error) {
      setNotifications(prev => [...prev, { message: error.message, timestamp: new Date().toISOString(), isRead: false }]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddForm = () => {
    setIsFormVisible(true);
    setEditCourseId(null);
    setNewCourse({
      title: '',
      description: '',
      isRequired: false,
      type: '',
      linkImg: '',
      requiredCourseId: null,
    });
    setErrorMessage('');
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditCourseId(null);
    setNewCourse({
      title: '',
      description: '',
      isRequired: false,
      type: '',
      linkImg: '',
      requiredCourseId: null,
    });
    setErrorMessage('');
  };

  return (
    <main className="main-content">
      <div className="card">
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
            <button onClick={() => setErrorMessage('')} className="error-close-btn">
              Đóng
            </button>
          </div>
        )}
        <h2 className="card-title">Quản Lý Khóa Học</h2>

        {/* Danh sách khóa học */}
        <div className="course-list-container">
          <div className="course-list-header">
            <h3 className="form-title">Danh Sách Khóa Học</h3>
            <div className="header-buttons">
              <button
                onClick={handleShowAddForm}
                className="add-course-button"
              >
                <PlusCircleIcon className="icon" />
                Thêm Khóa Học Mới
              </button>
              {courses.length > 0 && (
                <button
                  onClick={deleteSelectedCourses}
                  className="delete-selected-button"
                  disabled={loading || selectedCourses.length === 0}
                >
                  <TrashIcon className="icon" />
                  Xóa Hàng Loạt ({selectedCourses.length})
                </button>
              )}
            </div>
          </div>
          {loading ? (
            <div className="loading-container">
              <span className="spinner large"></span>
              Đang tải...
            </div>
          ) : !Array.isArray(courses) || courses.length === 0 ? (
            <div className="empty-state">
              Không có khóa học nào
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedCourses.length === courses.length && courses.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Tiêu Đề</th>
                    <th>Mô Tả</th>
                    <th>Loại</th>
                    <th>Bắt Buộc</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleSelectCourse(course.id)}
                        />
                      </td>
                      <td>{course.title}</td>
                      <td className="description-cell">{course.description}</td>
                      <td>{course.type}</td>
                      <td>
                        {course.isRequired ? (
                          <CheckCircleIcon className="status-icon success" />
                        ) : (
                          <XCircleIcon className="status-icon error" />
                        )}
                      </td>
                      <td className="action-cell">
                        <Link
                          to={`/courses/${course.id}/lessons`}
                          state={{ courseId: course.id, courseTitle: course.title }}
                          className="action-button view"
                        >
                          <EyeIcon className="icon" /> Xem Bài Học
                        </Link>
                        <button
                          onClick={() => startEditCourse(course)}
                          className="action-button edit"
                        >
                          <PencilIcon className="icon" /> Sửa
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id, course.title)}
                          className="action-button delete"
                        >
                          <TrashIcon className="icon" /> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Popup form thêm/sửa khóa học */}
      {isFormVisible && (
        <div className="modal">
          <div className="modal-overlay" onClick={handleCancelForm}></div>
          <div className={`modal-content ${editCourseId ? 'edit-mode' : ''}`}>
            <div className="form-header">
              <h3 className="form-title">{editCourseId ? 'Chỉnh Sửa Khóa Học' : 'Thêm Khóa Học Mới'}</h3>
              <button onClick={handleCancelForm} className="form-close-btn">
                <XMarkIcon className="icon" />
              </button>
            </div>
            <div className="course-form-grid">
              <div className="course-form-group">
                <label htmlFor="courseTitle">Tiêu đề khóa học <span className="required">*</span></label>
                <input
                  id="courseTitle"
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Nhập tiêu đề khóa học"
                />
              </div>
              <div className="course-form-group">
                <label htmlFor="type">Loại khóa học <span className="required">*</span></label>
                <input
                  id="type"
                  type="text"
                  value={newCourse.type}
                  onChange={(e) => setNewCourse({ ...newCourse, type: e.target.value })}
                  placeholder="Nhập loại khóa học"
                />
              </div>
              <div className="course-form-group full-width">
                <label htmlFor="description">Mô tả <span className="required">*</span></label>
                <textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Nhập mô tả khóa học"
                  rows="6"
                />
              </div>
              <div className="course-form-group">
                <label htmlFor="linkImg">Link hình ảnh</label>
                <input
                  id="linkImg"
                  type="text"
                  value={newCourse.linkImg}
                  onChange={(e) => setNewCourse({ ...newCourse, linkImg: e.target.value })}
                  placeholder="Nhập URL hình ảnh"
                />
              </div>
              <div className="course-form-group">
                <label htmlFor="requiredCourseId">Khóa học yêu cầu</label>
                <select
                  id="requiredCourseId"
                  value={newCourse.requiredCourseId || ''}
                  onChange={(e) => setNewCourse({ ...newCourse, requiredCourseId: e.target.value || null })}
                >
                  <option value="">Không có khóa học yêu cầu</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} (ID: {course.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="course-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newCourse.isRequired}
                    onChange={(e) => setNewCourse({ ...newCourse, isRequired: e.target.checked })}
                  />
                  Bắt buộc
                </label>
              </div>
              <div className="form-buttons">
                <button
                  onClick={handleCancelForm}
                  className="cancel-button"
                >
                  Hủy
                </button>
                <button
                  onClick={saveCourse}
                  className="course-submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner"></span>
                  ) : (
                    <PlusCircleIcon className="icon" />
                  )}
                  {editCourseId ? 'Cập Nhật Khóa Học' : 'Thêm Khóa Học'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>
        {`
          .main-content {
            padding: 2rem;
            background-color: #f7fafc;
            min-height: 100vh;
          }
          .card {
            background-color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }
          .card-title {
            font-size: 1.875rem;
            font-weight: 700;
            color: #1f2937;
            text-align: center;
            margin-bottom: 2rem;
          }
          .error-message {
            background-color: #fef2f2;
            color: #991b1b;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #fecaca;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            animation: fadeIn 0.3s ease-in;
          }
          .error-close-btn {
            background: none;
            border: none;
            color: #7f1d1d;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.2s ease;
          }
          .error-close-btn:hover {
            color: #991b1b;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            cursor: pointer;
          }
          .modal-content {
            background-color: white;
            border-radius: 0.75rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            max-width: 600px;
            width: 90%;
            padding: 1.5rem;
            position: relative;
            animation: slideIn 0.3s ease-out;
          }
          .modal-content.edit-mode {
            animation: slideInEdit 0.3s ease-out;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInEdit {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .form-close-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
            transition: color 0.2s ease;
          }
          .form-close-btn:hover {
            color: #1f2937;
          }
          .form-close-btn .icon {
            width: 1.5rem;
            height: 1.5rem;
          }
          .form-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
          }
          .course-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
          }
          .course-form-group.full-width {
            grid-column: 1 / -1;
          }
          .course-form-group label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #4b5563;
            margin-bottom: 0.5rem;
          }
          .required {
            color: #ef4444;
          }
          .course-form-group input,
          .course-form-group select,
          .course-form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .course-form-group input:focus,
          .course-form-group select:focus,
          .course-form-group textarea:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
          }
          .course-form-group textarea {
            resize: vertical;
            min-height: 120px;
          }
          .course-checkbox-group {
            display: flex;
            align-items: center;
            margin-top: 1rem;
          }
          .course-checkbox-group label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #4b5563;
          }
          .course-checkbox-group input {
            width: 0.75rem;
            height: 0.75rem;
            accent-color: #2563eb;
            border: 1px solid #9ca3af;
            border-radius: 3px;
            cursor: pointer;
          }
          .course-checkbox-group input:hover,
          td input[type="checkbox"]:hover {
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
          }
          .course-checkbox-group input:focus,
          td input[type="checkbox"]:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
          }
          .form-buttons {
            grid-column: 1 / -1;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            margin-top: 1rem;
          }
          .cancel-button {
            padding: 0.75rem 1.5rem;
            background-color: #f3f4f6;
            color: #4b5563;
            font-weight: 500;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease;
          }
          .cancel-button:hover {
            background-color: #e5e7eb;
            transform: translateY(-1px);
          }
          .course-submit-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background-color: #2563eb;
            color: white;
            font-weight: 500;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .course-submit-button:hover:not(:disabled) {
            background-color: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          .course-submit-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .course-submit-button .icon {
            width: 1.25rem;
            height: 1.25rem;
          }
          .spinner {
            width: 1rem;
            height: 1rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 0.5rem;
          }
          .spinner.large {
            width: 1.5rem;
            height: 1.5rem;
            border-width: 3px;
            border-color: #6b7280;
            border-top-color: transparent;
            margin: 0 auto 0.5rem;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          .course-list-container {
            margin-top: 2rem;
          }
          .course-list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .header-buttons {
            display: flex;
            gap: 0.75rem;
          }
          .add-course-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: #2563eb;
            color: white;
            font-weight: 500;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease;
          }
          .add-course-button:hover {
            background-color: #1d4ed8;
            transform: translateY(-1px);
          }
          .add-course-button .icon {
            width: 1.25rem;
            height: 1.25rem;
          }
          .delete-selected-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: #ef4444;
            color: white;
            font-weight: 500;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease;
          }
          .delete-selected-button:hover:not(:disabled) {
            background-color: #dc2626;
            transform: translateY(-1px);
          }
          .delete-selected-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .delete-selected-button .icon {
            width: 1.25rem;
            height: 1.25rem;
          }
          .loading-container {
            text-align: center;
            padding: 2rem;
            background-color: #f9fafb;
            border-radius: 0.75rem;
            color: #6b7280;
            font-size: 1rem;
          }
          .empty-state {
            text-align: center;
            padding: 2rem;
            background-color: #f9fafb;
            border-radius: 0.75rem;
            color: #6b7280;
            font-size: 1rem;
          }
          .table-container {
            overflow-x: auto;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead tr {
            background: linear-gradient(to right, #eff6ff, #dbeafe);
          }
          th {
            padding: 0.75rem;
            text-align: center;
            font-weight: 600;
            color: #374151;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e5e7eb;
          }
          th:first-child {
            width: 50px;
          }
          td {
            padding: 0.75rem;
            text-align: center;
            color: #374151;
            font-size: 0.875rem;
            border-bottom: 1px solid #e5e7eb;
          }
          td.checkbox-cell {
            padding: 0.5rem;
          }
          td.description-cell {
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
          }
          tr {
            transition: background-color 0.15s ease;
          }
          tr:hover {
            background-color: #f9fafb;
          }
          td input[type="checkbox"] {
            width: 0.75rem;
            height: 0.75rem;
            accent-color: #2563eb;
            border: 1px solid #9ca3af;
            border-radius: 3px;
            cursor: pointer;
          }
          .status-icon {
            width: 1.25rem;
            height: 1.25rem;
            margin: 0 auto;
          }
          .status-icon.success {
            color: #22c55e;
          }
          .status-icon.error {
            color: #ef4444;
          }
          .action-cell {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
          }
          .action-button {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            text-decoration: none;
            transition: background-color 0.2s ease, transform 0.1s ease;
          }
          .action-button.view {
            background-color: #60a5fa;
            color: white;
          }
          .action-button.view:hover {
            background-color: #3b82f6;
            transform: translateY(-1px);
          }
          .action-button.edit {
            background-color: #f59e0b;
            color: white;
          }
          .action-button.edit:hover {
            background-color: #d97706;
            transform: translateY(-1px);
          }
          .action-button.delete {
            background-color: #ef4444;
            color: white;
          }
          .action-button.delete:hover {
            background-color: #dc2626;
            transform: translateY(-1px);
          }
          .action-button .icon {
            width: 0.875rem;
            height: 0.875rem;
          }
          @media (max-width: 768px) {
            .course-form-grid {
              grid-template-columns: 1fr;
            }
            .course-submit-button, .cancel-button {
              padding: 0.75rem;
            }
            .modal-content {
              width: 90%;
            }
            .table-container {
              overflow-x: auto;
            }
            th, td {
              font-size: 0.75rem;
            }
            .action-button {
              padding: 0.5rem;
              font-size: 0.75rem;
            }
            .action-button .icon {
              width: 0.75rem;
              height: 0.75rem;
            }
            .header-buttons {
              flex-direction: column;
              gap: 0.5rem;
              align-items: flex-end;
            }
          }
        `}
      </style>
    </main>
  );
}

function LessonManager({ setNotifications }) {
  const location = useLocation();
  const { lessonId } = useParams();
  const { courseId, courseTitle } = location.state || { courseId: null, courseTitle: 'Khóa học không xác định' };

  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [newLesson, setNewLesson] = useState({
    courseId: courseId || null,
    title: '',
    link: '',
    linkImg: '',
    description: '',
  });
  const [editLessonId, setEditLessonId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  // API để lấy danh sách bài học theo courseId
  const fetchLessonsByCourseId = async (courseId) => {
    console.log('Calling fetchLessonsByCourseId with courseId:', courseId);
    try {
      const response = await fetch(`http://localhost:8080/lesson/getByCourseId?courseId=${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi lấy danh sách bài học: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dữ liệu từ API fetchLessonsByCourseId:', data);

      if (Array.isArray(data.data)) {
        return data.data.map(lesson => ({
          ...lesson,
          title: lesson.title ?? '',
          link: lesson.link ?? '',
          linkImg: lesson.linkImg ?? '',
          description: lesson.description ?? '',
        }));
      } else {
        throw new Error('Dữ liệu từ API không phải là mảng');
      }
    } catch (error) {
      console.error('Lỗi fetchLessonsByCourseId:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra CORS hoặc server backend.');
      }
      throw new Error('Không thể lấy danh sách bài học');
    }
  };

  // API để tạo bài học mới
  const createLessonFromAPI = async (lessonData) => {
    try {
      const response = await fetch(`http://localhost:8080/lesson/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: lessonData.courseId,
          title: lessonData.title,
          link: lessonData.link,
          linkImg: lessonData.linkImg || null,
          description: lessonData.description || null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi tạo bài học: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dữ liệu từ API createLessonFromAPI:', data);

      if (data && data.data) {
        return {
          ...data.data,
          title: data.data.title ?? '',
          link: data.data.link ?? '',
          linkImg: data.data.linkImg ?? '',
          description: data.data.description ?? '',
        };
      } else {
        throw new Error('Dữ liệu từ API không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi createLessonFromAPI:', error);
      throw error;
    }
  };

  // API để xóa bài học
  const deleteLessonsFromAPI = async (ids) => {
    try {
      const response = await fetch(`http://localhost:8080/lesson/delete/${ids.join(',')}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi xóa bài học: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dữ liệu từ API deleteLessonsFromAPI:', data);

      if (data && data.data) {
        return data.data;
      } else {
        throw new Error('Dữ liệu từ API không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi deleteLessonsFromAPI:', error);
      throw error;
    }
  };

  // API để cập nhật bài học
  const updateLessonFromAPI = async (lessonId, lessonData) => {
    try {
      console.log('Payload gửi đi:', lessonData); // Log payload để debug
      const response = await fetch(`http://localhost:8080/lesson/update/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: lessonData.courseId,
          title: lessonData.title,
          link: lessonData.link,
          linkImg: lessonData.linkImg || null,
          description: lessonData.description || null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response lỗi từ server:', errorText); // Log lỗi chi tiết
        throw new Error(`Lỗi khi cập nhật bài học: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dữ liệu từ API updateLessonFromAPI:', data);

      if (data && data.data) {
        // Backend trả về chuỗi thông báo, trả lại thông báo này
        return data.data; // Chuỗi, ví dụ: "Cập nhật bài học thành công"
      } else {
        throw new Error('Dữ liệu từ API không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi updateLessonFromAPI:', error);
      throw new Error(`Không thể cập nhật bài học: ${error.message}`);
    }
  };

  // Lấy chi tiết bài học khi có lessonId
  useEffect(() => {
    if (lessonId && lessons.length > 0) {
      const lesson = lessons.find(lesson => lesson.id === parseInt(lessonId));
      if (lesson) {
        setSelectedLesson(lesson);
      } else {
        setErrorMessage('Không tìm thấy bài học.');
      }
    } else {
      setSelectedLesson(null);
    }
  }, [lessonId, lessons]);

  // Lấy danh sách bài học theo courseId
  useEffect(() => {
    console.log('Received courseId:', courseId, 'courseTitle:', courseTitle);
    if (!lessonId && courseId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const lessonsData = await fetchLessonsByCourseId(courseId);
          setLessons(lessonsData);
          setErrorMessage('');
        } catch (error) {
          setErrorMessage(`Lỗi khi lấy danh sách bài học: ${error.message}`);
          setNotifications(prev => [
            ...prev,
            { message: `Lỗi khi lấy dữ liệu: ${error.message}`, timestamp: new Date().toISOString(), isRead: false }
          ]);
          setLessons([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else if (!courseId) {
      setErrorMessage('Không tìm thấy khóa học. Vui lòng quay lại danh sách khóa học.');
      setLessons([]);
    }
  }, [setNotifications, courseId, lessonId]);

  const handleSelectLesson = (lessonId) => {
    if (selectedLessons.includes(lessonId)) {
      setSelectedLessons(selectedLessons.filter(id => id !== lessonId));
    } else {
      setSelectedLessons([...selectedLessons, lessonId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLessons.length === lessons.length) {
      setSelectedLessons([]);
    } else {
      setSelectedLessons(lessons.map(lesson => lesson.id));
    }
  };

  const deleteSelectedLessons = async () => {
    if (selectedLessons.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một bài học để xóa!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedLessons.length} bài học đã chọn?`)) {
      return;
    }

    setLoading(true);
    try {
      const message = await deleteLessonsFromAPI(selectedLessons);
      setLessons(lessons.filter(lesson => !selectedLessons.includes(lesson.id)));
      setNotifications(prev => [
        ...prev,
        { message: message || `Đã xóa ${selectedLessons.length} bài học.`, timestamp: new Date().toISOString(), isRead: false }
      ]);
      setSelectedLessons([]);
      setErrorMessage('');
    } catch (error) {
      const errorMessage = error.message || 'Không thể xóa bài học';
      setNotifications(prev => [
        ...prev,
        { message: errorMessage, timestamp: new Date().toISOString(), isRead: false }
      ]);
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveLesson = async () => {
    if (!newLesson.title || !newLesson.link) {
      setErrorMessage('Vui lòng điền đầy đủ các trường bắt buộc (Tiêu đề, Link)!');
      return;
    }

    if (!newLesson.courseId) {
      setErrorMessage('Không tìm thấy khóa học. Vui lòng quay lại danh sách khóa học.');
      return;
    }

    if (isNaN(parseInt(newLesson.courseId))) {
      setErrorMessage('ID khóa học không hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const lessonToSave = {
        courseId: parseInt(newLesson.courseId),
        title: newLesson.title,
        link: newLesson.link,
        linkImg: newLesson.linkImg || null,
        description: newLesson.description || null,
      };

      let savedLesson;
      if (editLessonId) {
        const message = await updateLessonFromAPI(editLessonId, lessonToSave);
        // Cập nhật danh sách bài học với dữ liệu mới từ state (vì backend trả về chuỗi)
        setLessons(lessons.map(lesson => 
          lesson.id === editLessonId ? { ...lesson, ...lessonToSave } : lesson
        ));
        setNotifications(prev => [
          ...prev,
          { message: message || `Bài học ${newLesson.title} đã được cập nhật.`, timestamp: new Date().toISOString(), isRead: false }
        ]);
      } else {
        savedLesson = await createLessonFromAPI(lessonToSave);
        setLessons([...lessons, savedLesson]);
        setNotifications(prev => [
          ...prev,
          { message: `Bài học ${newLesson.title} đã được thêm.`, timestamp: new Date().toISOString(), isRead: false }
        ]);
      }

      setNewLesson({
        courseId: courseId,
        title: '',
        link: '',
        linkImg: '',
        description: '',
      });
      setEditLessonId(null);
      setIsFormVisible(false);
      setErrorMessage('');
    } catch (error) {
      const errorMessage = error.message || 'Không thể lưu bài học';
      setNotifications(prev => [
        ...prev,
        { message: errorMessage, timestamp: new Date().toISOString(), isRead: false }
      ]);
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startEditLesson = (lesson) => {
    setEditLessonId(lesson.id);
    setNewLesson({
      courseId: lesson.courseId,
      title: lesson.title ?? '',
      link: lesson.link ?? '',
      linkImg: lesson.linkImg ?? '',
      description: lesson.description ?? '',
    });
    setIsFormVisible(true);
    setErrorMessage('');
  };

  const deleteLesson = async (lessonId, lessonTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài học "${lessonTitle}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const message = await deleteLessonsFromAPI([lessonId]);
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      setNotifications(prev => [
        ...prev,
        { message: message || `Bài học ${lessonTitle} đã bị xóa.`, timestamp: new Date().toISOString(), isRead: false }
      ]);
      setErrorMessage('');
    } catch (error) {
      const errorMessage = error.message || 'Không thể xóa bài học';
      setNotifications(prev => [
        ...prev,
        { message: errorMessage, timestamp: new Date().toISOString(), isRead: false }
      ]);
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddForm = () => {
    if (!courseId) {
      setErrorMessage('Không tìm thấy khóa học. Vui lòng quay lại danh sách khóa học.');
      return;
    }
    setIsFormVisible(true);
    setEditLessonId(null);
    setNewLesson({
      courseId: courseId,
      title: '',
      link: '',
      linkImg: '',
      description: '',
    });
    setErrorMessage('');
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditLessonId(null);
    setNewLesson({
      courseId: courseId,
      title: '',
      link: '',
      linkImg: '',
      description: '',
    });
    setErrorMessage('');
  };

  // Hiển thị chi tiết bài học nếu có lessonId
  if (lessonId && selectedLesson) {
    return (
      <main className="main-content">
        <div className="card">
          <h2 className="card-title">Chi tiết bài học: {selectedLesson.title}</h2>
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
              <button onClick={() => setErrorMessage('')} className="error-close-btn">
                Đóng
              </button>
            </div>
          )}
          {loading ? (
            <div className="loading-container">
              <span className="spinner large"></span>
              Đang tải...
            </div>
          ) : (
            <div className="lesson-details">
              <div className="lesson-detail-item">
                <strong>Khóa học:</strong> {courseTitle || 'N/A'}
              </div>
              <div className="lesson-detail-item">
                <strong>Tiêu đề:</strong> {selectedLesson.title}
              </div>
              <div className="lesson-detail-item">
                <strong>Link bài học:</strong> 
                <a href={selectedLesson.link} target="_blank" rel="noopener noreferrer" className="link">
                  {selectedLesson.link}
                </a>
              </div>
              <div className="lesson-detail-item">
                <strong>Hình ảnh:</strong> 
                {selectedLesson.linkImg ? (
                  <a href={selectedLesson.linkImg} target="_blank" rel="noopener noreferrer" className="link">
                    {selectedLesson.linkImg}
                  </a>
                ) : 'Không có'}
              </div>
              <div className="lesson-detail-item">
                <strong>Mô tả:</strong> {selectedLesson.description || 'Không có'}
              </div>
              <div className="lesson-detail-actions">
                <Link to={`/courses/${courseId}/lessons`} className="action-button view">
                  Quay lại danh sách
                </Link>
                <button onClick={() => startEditLesson(selectedLesson)} className="action-button edit">
                  <PencilIcon className="icon" /> Sửa
                </button>
                <button onClick={() => deleteLesson(selectedLesson.id, selectedLesson.title)} className="action-button delete">
                  <TrashIcon className="icon" /> Xóa
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // Hiển thị danh sách bài học và nút mở popup
  return (
    <main className="main-content">
      <div className="card">
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
            <button onClick={() => setErrorMessage('')} className="error-close-btn">
              Đóng
            </button>
          </div>
        )}
        <h2 className="card-title">
          Quản Lý Bài Học cho Khóa học: {courseTitle || 'Khóa học không xác định'}
        </h2>

        {/* Danh sách bài học */}
        <div className="lesson-list-container">
          <div className="lesson-list-header">
            <h3 className="form-title">Danh Sách Bài Học</h3>
            <div className="header-buttons">
              <button
                onClick={handleShowAddForm}
                className="add-lesson-button"
                disabled={!courseId}
              >
                <PlusCircleIcon className="icon" />
                Thêm Bài Học Mới
              </button>
              {lessons.length > 0 && (
                <button
                  onClick={deleteSelectedLessons}
                  className="delete-selected-button"
                  disabled={loading || selectedLessons.length === 0}
                >
                  <TrashIcon className="icon" />
                  Xóa Hàng Loạt ({selectedLessons.length})
                </button>
              )}
            </div>
          </div>
          {loading ? (
            <div className="loading-container">
              <span className="spinner large"></span>
              Đang tải...
            </div>
          ) : !courseId ? (
            <div className="empty-state">
              Không tìm thấy khóa học. Vui lòng quay lại danh sách khóa học.
            </div>
          ) : !Array.isArray(lessons) || lessons.length === 0 ? (
            <div className="empty-state">
              Không có bài học nào
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedLessons.length === lessons.length && lessons.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Tiêu Đề</th>
                    <th>Link</th>
                    <th>Hình Ảnh</th>
                    <th>Mô Tả</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => (
                    <tr key={lesson.id}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedLessons.includes(lesson.id)}
                          onChange={() => handleSelectLesson(lesson.id)}
                        />
                      </td>
                      <td>{lesson.title}</td>
                      <td className="text-cell">
                        <a href={lesson.link} target="_blank" rel="noopener noreferrer" className="link">
                          {lesson.link}
                        </a>
                      </td>
                      <td className="text-cell">
                        {lesson.linkImg ? (
                          <a href={lesson.linkImg} target="_blank" rel="noopener noreferrer" className="link">
                            {lesson.linkImg}
                          </a>
                        ) : 'Không có'}
                      </td>
                      <td className="text-cell">{lesson.description || 'Không có'}</td>
                      <td className="action-cell">
                        <Link
                          to={`/courses/${courseId}/lessons/${lesson.id}`}
                          state={{ lesson, courseId, courseTitle }}
                          className="action-button view"
                        >
                          <EyeIcon className="icon" /> Xem
                        </Link>
                        <button
                          onClick={() => startEditLesson(lesson)}
                          className="action-button edit"
                        >
                          <PencilIcon className="icon" /> Sửa
                        </button>
                        <button
                          onClick={() => deleteLesson(lesson.id, lesson.title)}
                          className="action-button delete"
                        >
                          <TrashIcon className="icon" /> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Popup form thêm/sửa bài học */}
      {isFormVisible && (
        <div className="modal">
          <div className="modal-overlay" onClick={handleCancelForm}></div>
          <div className={`modal-content ${editLessonId ? 'edit-mode' : ''}`}>
            <div className="form-header">
              <h3 className="form-title">{editLessonId ? 'Chỉnh Sửa Bài Học' : 'Thêm Bài Học Mới'}</h3>
              <button onClick={handleCancelForm} className="form-close-btn">
                <XMarkIcon className="icon" />
              </button>
            </div>
            <div className="lesson-form-grid">
              <div className="lesson-form-group">
                <label htmlFor="lessonTitle">Tiêu đề bài học <span className="required">*</span></label>
                <input
                  id="lessonTitle"
                  type="text"
                  value={newLesson.title ?? ''}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  placeholder="Nhập tiêu đề bài học"
                />
              </div>
              <div className="lesson-form-group">
                <label htmlFor="link">Link bài học <span className="required">*</span></label>
                <input
                  id="link"
                  type="text"
                  value={newLesson.link ?? ''}
                  onChange={(e) => setNewLesson({ ...newLesson, link: e.target.value })}
                  placeholder="Nhập URL bài học"
                />
              </div>
              <div className="lesson-form-group">
                <label htmlFor="linkImg">Link hình ảnh</label>
                <input
                  id="linkImg"
                  type="text"
                  value={newLesson.linkImg ?? ''}
                  onChange={(e) => setNewLesson({ ...newLesson, linkImg: e.target.value })}
                  placeholder="Nhập URL hình ảnh"
                />
              </div>
              <div className="lesson-form-group full-width">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  value={newLesson.description ?? ''}
                  onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                  placeholder="Nhập mô tả bài học"
                  rows="6"
                />
              </div>
              <div className="form-buttons">
                <button
                  onClick={handleCancelForm}
                  className="cancel-button"
                >
                  Hủy
                </button>
                <button
                  onClick={saveLesson}
                  className="lesson-submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner"></span>
                  ) : (
                    <PlusCircleIcon className="icon" />
                  )}
                  {editLessonId ? 'Cập Nhật Bài Học' : 'Thêm Bài Học'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>
        {`
          .main-content {
            padding: 2rem;
            background-color: #f7fafc;
            min-height: 100vh;
          }
          .card {
            background-color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }
          .card-title {
            font-size: 1.875rem;
            font-weight: 700;
            color: #1f2937;
            text-align: center;
            margin-bottom: 2rem;
          }
          .error-message {
            background-color: #fef2f2;
            color: #991b1b;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #fecaca;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            animation: fadeIn 0.3s ease-in;
          }
          .error-close-btn {
            background: none;
            border: none;
            color: #7f1d1d;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.2s ease;
          }
          .error-close-btn:hover {
            color: #991b1b;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            cursor: pointer;
          }
          .modal-content {
            background-color: white;
            border-radius: 0.75rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            max-width: 600px;
            width: 90%;
            padding: 1.5rem;
            position: relative;
            animation: slideIn 0.3s ease-out;
          }
          .modal-content.edit-mode {
            animation: slideInEdit 0.3s ease-out;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInEdit {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .form-close-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
            transition: color 0.2s ease;
          }
          .form-close-btn:hover {
            color: #1f2937;
          }
          .form-close-btn .icon {
            width: 1.5rem;
            height: 1.5rem;
          }
          .form-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
          }
          .lesson-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
          }
          .lesson-form-group.full-width {
            grid-column: 1 / -1;
          }
          .lesson-form-group label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #4b5563;
            margin-bottom: 0.5rem;
          }
          .required {
            color: #ef4444;
          }
          .lesson-form-group input,
          .lesson-form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .lesson-form-group input:focus,
          .lesson-form-group textarea:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
          }
          .lesson-form-group textarea {
            resize: vertical;
            min-height: 120px;
          }
          .form-buttons {
            grid-column: 1 / -1;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            margin-top: 1rem;
          }
          .cancel-button {
            padding: 0.75rem 1.5rem;
            background-color: #f3f4f6;
            color: #4b5563;
            font-weight: 500;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease;
          }
          .cancel-button:hover {
            background-color: #e5e7eb;
            transform: translateY(-1px);
          }
          .lesson-submit-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background-color: #2563eb;
            color: white;
            font-weight: 500;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .lesson-submit-button:hover:not(:disabled) {
            background-color: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          .lesson-submit-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .lesson-submit-button .icon {
            width: 1.25rem;
            height: 1.25rem;
          }
          .spinner {
            width: 1rem;
            height: 1rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 0.5rem;
          }
          .spinner.large {
            width: 1.5rem;
            height: 1.5rem;
            border-width: 3px;
            border-color: #6b7280;
            border-top-color: transparent;
            margin: 0 auto 0.5rem;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          .lesson-list-container {
            margin-top: 2rem;
          }
          .lesson-list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .header-buttons {
            display: flex;
            gap: 0.75rem;
          }
          .add-lesson-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: #2563eb;
            color: white;
            font-weight: 500;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease;
          }
          .add-lesson-button:hover:not(:disabled) {
            background-color: #1d4ed8;
            transform: translateY(-1px);
          }
          .add-lesson-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .add-lesson-button .icon {
            width: 1.25rem;
            height: 1.25rem;
          }
          .delete-selected-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: #ef4444;
            color: white;
            font-weight: 500;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease;
          }
          .delete-selected-button:hover:not(:disabled) {
            background-color: #dc2626;
            transform: translateY(-1px);
          }
          .delete-selected-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .delete-selected-button .icon {
            width: 1.25rem;
            height: 1.25rem;
          }
          .loading-container {
            text-align: center;
            padding: 2rem;
            background-color: #f9fafb;
            border-radius: 0.75rem;
            color: #6b7280;
            font-size: 1rem;
          }
          .empty-state {
            text-align: center;
            padding: 2rem;
            background-color: #f9fafb;
            border-radius: 0.75rem;
            color: #6b7280;
            font-size: 1rem;
          }
          .table-container {
            overflow-x: auto;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead tr {
            background: linear-gradient(to right, #eff6ff, #dbeafe);
          }
          th {
            padding: 0.75rem;
            text-align: center;
            font-weight: 600;
            color: #374151;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e5e7eb;
          }
          th:first-child {
            width: 50px;
          }
          td {
            padding: 0.75rem;
            text-align: center;
            color: #374151;
            font-size: 0.875rem;
            border-bottom: 1px solid #e5e7eb;
          }
          td.checkbox-cell {
            padding: 0.5rem;
          }
          td.text-cell {
            text-align: left;
            max-width: 180px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          tr {
            transition: background-color 0.15s ease;
          }
          tr:hover {
            background-color: #f9fafb;
          }
          td input[type="checkbox"] {
            width: 0.75rem;
            height: 0.75rem;
            accent-color: #2563eb;
            border: 1px solid #9ca3af;
            border-radius: 3px;
            cursor: pointer;
          }
          td input[type="checkbox"]:hover {
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
          }
          td input[type="checkbox"]:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
          }
          .action-cell {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
          }
          .action-button {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            text-decoration: none;
            transition: background-color 0.2s ease, transform 0.1s ease;
          }
          .action-button.view {
            background-color: #60a5fa;
            color: white;
          }
          .action-button.view:hover {
            background-color: #3b82f6;
            transform: translateY(-1px);
          }
          .action-button.edit {
            background-color: #f59e0b;
            color: white;
          }
          .action-button.edit:hover {
            background-color: #d97706;
            transform: translateY(-1px);
          }
          .action-button.delete {
            background-color: #ef4444;
            color: white;
          }
          .action-button.delete:hover {
            background-color: #dc2626;
            transform: translateY(-1px);
          }
          .action-button .icon {
            width: 0.875rem;
            height: 0.875rem;
          }
          .link {
            color: #2563eb;
            text-decoration: none;
          }
          .link:hover {
            text-decoration: underline;
          }
          .lesson-details {
            padding: 1.5rem;
            background-color: #f9fafb;
            border-radius: 0.75rem;
          }
          .lesson-detail-item {
            margin-bottom: 1rem;
            font-size: 1rem;
            color: #374151;
          }
          .lesson-detail-item strong {
            display: inline-block;
            width: 120px;
            font-weight: 600;
          }
          .lesson-detail-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 1.5rem;
            justify-content: center;
          }
          @media (max-width: 768px) {
            .lesson-form-grid {
              grid-template-columns: 1fr;
            }
            .lesson-submit-button, .cancel-button {
              padding: 0.75rem;
            }
            .modal-content {
              width: 90%;
            }
            .table-container {
              overflow-x: auto;
            }
            th, td {
              font-size: 0.75rem;
            }
            .action-button {
              padding: 0.5rem;
              font-size: 0.75rem;
            }
            .action-button .icon {
              width: 0.75rem;
              height: 0.75rem;
            }
            .header-buttons {
              flex-direction: column;
              gap: 0.5rem;
              align-items: flex-end;
            }
          }
        `}
      </style>
    </main>
  );
}



function Members({ memberTab, setMemberTab }) {
  // State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMember, setEditMember] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    joinedAt: '',
    avatar: '',
    projectCount: 0,
  });
  const [sortConfig, setSortConfig] = useState({ key: 'name', order: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const itemsPerPage = 10;
  const fileInputRef = useRef(null);

  // Fetch members from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/member/getAll?offSet=${(currentPage - 1) * itemsPerPage}&limit=${itemsPerPage}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (!response.ok) {
          throw new Error('Không thể tải danh sách thành viên');
        }
        const result = await response.json();
        const users = result.data.content || [];
        setMembers(
          users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            joinedAt: user.joinedAt,
            avatar: user.avatar,
            projectCount: user.projectCount,
          }))
        );
      } catch (err) {
        setError('Không thể tải danh sách thành viên');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  // Handle search with debounce
  const debouncedSearch = debounce(async (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
    if (value) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/member/doSearch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: value,
            roleId:
              memberTab === 'testers'
                ? 1
                : memberTab === 'testLeaders'
                ? 2
                : 3,
            projectCount: null,
            offset: 0,
            limit: itemsPerPage,
          }),
        });
        if (!response.ok) {
          throw new Error('Tìm kiếm thất bại');
        }
        const result = await response.json();
        const users = result.data.content || [];
        setMembers(
          users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            joinedAt: user.joinedAt,
            avatar: user.avatar,
            projectCount: user.projectCount,
          }))
        );
      } catch (err) {
        setError('Tìm kiếm thất bại');
      } finally {
        setIsLoading(false);
      }
    }
  }, 300);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle avatar upload for edit modal
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Kích thước ảnh tối đa 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('http://localhost:8080/user/uploadAvatar', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            throw new Error('Tải ảnh thất bại');
          }
          const data = await response.json();
          const avatarUrl = data.data;
          setEditMember((prev) => ({ ...prev, avatar: avatarUrl }));
        } catch (err) {
          setError('Tải ảnh thất bại');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter and sort members
  const getFilteredMembers = () => {
    let filtered = members.filter(
      (member) => member.role === memberTab.slice(0, -1)
    );
    if (searchQuery) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered.sort((a, b) => {
      const valueA =
        sortConfig.key === 'projectCount'
          ? a[sortConfig.key] || 0
          : a[sortConfig.key] || '';
      const valueB =
        sortConfig.key === 'projectCount'
          ? b[sortConfig.key] || 0
          : b[sortConfig.key] || '';
      if (sortConfig.key === 'projectCount') {
        return sortConfig.order === 'asc' ? valueA - valueB : valueB - valueA;
      }
      const comparison = valueA.localeCompare(valueB);
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });
  };

  // Pagination logic
  const currentMembers = getFilteredMembers();
  const totalPages = Math.ceil(currentMembers.length / itemsPerPage);
  const paginatedMembers = currentMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle edit member
  const handleEditMember = async (e) => {
    e.preventDefault();
    if (!editMember.name.trim() || !editMember.email.trim()) {
      setError('Tên và email không được để trống');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(editMember.email)) {
      setError('Email không hợp lệ');
      return;
    }
    setIsLoading(true);
    try {
      // Lưu ý: Để sửa lỗi CORS, cấu hình server backend để thêm header 'Access-Control-Allow-Origin: http://localhost:3000'
      // Xem hướng dẫn chi tiết trong phần giải thích (Spring Boot hoặc Express)
      const response = await fetch(
        `http://localhost:8080/member/${editMember.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editMember),
        }
      );
      if (!response.ok) {
        throw new Error('Cập nhật thất bại');
      }
      const updatedUser = await response.json();
      setMembers(
        members.map((m) => (m.id === editMember.id ? updatedUser : m))
      );
      setIsEditModalOpen(false);
      setEditMember({
        id: '',
        name: '',
        email: '',
        phone: '',
        role: '',
        joinedAt: '',
        avatar: '',
        projectCount: 0,
      });
      setError('');
    } catch (err) {
      setError('Cập nhật thành viên thất bại: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete member
  const handleDeleteMember = async (role, id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/member/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Xóa thất bại');
      }
      setMembers(members.filter((m) => m.id !== id));
      setError('');
    } catch (err) {
      setError('Xóa thành viên thất bại: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle change role (Tester to Test Leader)
  const handleChangeRole = async (member) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn đổi vai trò của ${member.name} từ Tester sang Test Leader?`
      )
    )
      return;
    setIsLoading(true);
    try {
      const updatedUser = { ...member, role: 'testLeader' };
      const response = await fetch(`http://localhost:8080/member/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) {
        throw new Error('Đổi vai trò thất bại');
      }
      const result = await response.json();
      setMembers(members.map((m) => (m.id === member.id ? result : m)));
      setExpandedMemberId(null);
      setError('');
    } catch (err) {
      setError('Đổi vai trò thất bại: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle inline popup
  const toggleExpand = (memberId) => {
    setExpandedMemberId(expandedMemberId === memberId ? null : memberId);
  };

  // Open edit modal
  const openEditModal = (member) => {
    setEditMember(member);
    setIsEditModalOpen(true);
  };

  // Format date
  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : 'N/A';
  };

  // Render avatar with fallback for 404 errors
  const renderAvatar = (avatar, name) => {
    const defaultAvatar = 'https://via.placeholder.com/40';
    if (avatar) {
      return (
        <img
          src={avatar}
          alt="Avatar"
          className="avatar-img"
          onError={(e) => (e.target.src = defaultAvatar)}
        />
      );
    }
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
      <div className="avatar-placeholder">
        {initial}
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .main-content {
  padding: 1.5rem;
  background-color: #f7fafc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.card {
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.search-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.search-bar input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 300px;
  font-size: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.search-bar input:hover {
  border-color: #9ca3af;
}

.search-bar input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.error-message {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.75rem;
}

.tab-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tab-buttons button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-buttons button.testers {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
  color: white;
}

.tab-buttons button.testers:not(.active) {
  background: #e5e7eb;
  color: #4b5563;
}

.tab-buttons button.customers {
  background: linear-gradient(to right, #8b5cf6, #7c3aed);
  color: white;
}

.tab-buttons button.customers:not(.active) {
  background: #e5e7eb;
  color: #4b5563;
}

.tab-buttons button.testLeaders {
  background: linear-gradient(to right, #16a34a, #15803d);
  color: white;
}

.tab-buttons button.testLeaders:not(.active) {
  background: #e5e7eb;
  color: #4b5563;
}

.tab-buttons button.active {
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.tab-buttons button:not(.active):hover {
  background: #d1d5db;
  transform: translateY(-1px);
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  background: linear-gradient(to right, #eff6ff, #dbeafe);
  font-size: 0.75rem;
  text-transform: uppercase;
}

th.sortable {
  cursor: pointer;
}

th.sortable:hover {
  color: #2563eb;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.75rem;
  color: #374151;
}

tr:hover {
  background-color: #f9fafb;
  transition: background-color 0.2s ease;
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons button {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-buttons button:hover {
  transform: translateY(-1px);
}

.action-buttons .edit-btn {
  background-color: #2563eb;
}

.action-buttons .edit-btn:hover {
  background-color: #1d4ed8;
}

.action-buttons .delete-btn {
  background-color: #dc2626;
}

.action-buttons .delete-btn:hover {
  background-color: #b91c1c;
}

.action-buttons .role-btn {
  background-color: #8b5cf6;
}

.action-buttons .role-btn:hover {
  background-color: #7c3aed;
}

.action-buttons button svg {
  width: 16px;
  height: 16px;
}

.role-popup {
  background-color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  0% { transform: translateY(-10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.role-popup .close-btn {
  color: #6b7280;
  transition: color 0.2s ease;
}

.role-popup .close-btn:hover {
  color: #1f2937;
}

.role-popup .close-btn svg {
  width: 20px;
  height: 20px;
}

.role-popup .cancel-btn {
  padding: 0.5rem 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.role-popup .cancel-btn:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.role-popup .confirm-btn {
  padding: 0.5rem 0.75rem;
  background-color: #8b5cf6;
  color: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.role-popup .confirm-btn:hover:not(:disabled) {
  background-color: #7c3aed;
  transform: translateY(-1px);
}

.role-popup .confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.pagination button {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
  font-size: 0.75rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  padding: 0.5rem 0.75rem;
  color: #4b5563;
  font-weight: 500;
  font-size: 0.75rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition: opacity 0.3s ease;
}

.modal-content {
  background-color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 320px;
  animation: slideIn 0.3s ease-out;
}

.modal-content h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.modal-content .close-btn {
  color: #6b7280;
  transition: color 0.2s ease;
}

.modal-content .close-btn:hover {
  color: #1f2937;
}

.modal-content .close-btn svg {
  width: 16px;
  height: 16px;
}

.modal-content form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-content label {
  color: #4b5563;
  font-weight: 500;
  margin-bottom: 0.25rem;
  display: block;
  font-size: 0.75rem;
}

.modal-content input,
.modal-content select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.modal-content input:focus,
.modal-content select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.modal-content input[type="file"] {
  padding: 0.25rem;
}

.modal-content .avatar-preview {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  margin-left: 0.25rem;
}

.modal-content .form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.modal-content .cancel-btn {
  padding: 0.5rem 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.modal-content .cancel-btn:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.modal-content .submit-btn {
  padding: 0.5rem 0.75rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.modal-content .submit-btn:hover:not(:disabled) {
  background-color: #1d4ed8;
  transform: translateY(-1px);
}

.modal-content .submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  width: 12px;
  height: 12px;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .card {
    padding: 1rem;
  }

  .search-bar input {
    max-width: 100%;
  }

  .tab-buttons {
    flex-direction: column;
    align-items: center;
  }

  .table-container {
    font-size: 0.75rem;
  }

  .modal-content {
    width: 90%;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}
        `}
      </style>
      <main className="main-content">
        <div className="card">
          <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: '2rem' }}>
            Quản lý thành viên
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
            <div className="search-bar">
              <input
                type="text"
                onChange={(e) => debouncedSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc email..."
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="tab-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            {['testers', 'customers', 'testLeaders'].map((tab) => (
              <button
                key={tab}
                className={memberTab === tab ? 'active' : ''}
                onClick={() => {
                  setMemberTab(tab);
                  setCurrentPage(1);
                }}
              >
                {tab === 'testers'
                  ? 'Testers'
                  : tab === 'customers'
                    ? 'Customers'
                    : 'Test Leaders'}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
              {memberTab === 'testers'
                ? 'Danh sách Tester'
                : memberTab === 'customers'
                  ? 'Danh sách Customer'
                  : 'Danh sách Test Leader'}
            </h3>

            {isLoading ? (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem' }}>
                <svg
                  className="loading-spinner"
                  style={{ display: 'inline-block', color: '#2563eb' }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                  ></path>
                </svg>
                Đang tải...
              </div>
            ) : paginatedMembers.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem' }}>
                Không tìm thấy thành viên nào
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th
                        className="sortable"
                        onClick={() => handleSort('name')}
                      >
                        Tên{' '}
                        {sortConfig.key === 'name' &&
                          (sortConfig.order === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th
                        className="sortable"
                        onClick={() => handleSort('joinedAt')}
                      >
                        Ngày tham gia{' '}
                        {sortConfig.key === 'joinedAt' &&
                          (sortConfig.order === 'asc' ? '↑' : '↓')}
                      </th>
                      {['testers', 'testLeaders'].includes(memberTab) && (
                        <th
                          className="sortable"
                          onClick={() => handleSort('projectCount')}
                        >
                          Số dự án{' '}
                          {sortConfig.key === 'projectCount' &&
                            (sortConfig.order === 'asc' ? '↑' : '↓')}
                        </th>
                      )}
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map((member) => (
                      <React.Fragment key={member.id}>
                        <tr>
                          <td>{renderAvatar(member.avatar, member.name)}</td>
                          <td style={{ fontWeight: '500', color: '#1f2937' }}>{member.name}</td>
                          <td style={{ color: '#6b7280' }}>{member.email}</td>
                          <td style={{ color: '#6b7280' }}>{member.phone || 'N/A'}</td>
                          <td style={{ color: '#6b7280' }}>{formatDate(member.joinedAt)}</td>
                          {['testers', 'testLeaders'].includes(memberTab) && (
                            <td style={{ color: '#6b7280' }}>{member.projectCount || 0}</td>
                          )}
                          <td className="action-buttons" style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                              onClick={() => openEditModal(member)}
                              className="edit-btn"
                            >
                              <PencilIcon style={{ width: '20px', height: '20px' }} /> Sửa
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteMember(memberTab.slice(0, -1), member.id)
                              }
                              className="delete-btn"
                            >
                              <TrashIcon style={{ width: '20px', height: '20px' }} /> Xóa
                            </button>
                            {member.role === 'tester' && (
                              <button
                                onClick={() => toggleExpand(member.id)}
                                className="role-btn"
                              >
                                <ArrowUpIcon style={{ width: '20px', height: '20px' }} /> Đổi vai trò
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedMemberId === member.id && (
                          <tr>
                            <td
                              colSpan={
                                ['testers', 'testLeaders'].includes(memberTab) ? 7 : 6
                              }
                              style={{ backgroundColor: '#f9fafb', padding: '1rem' }}
                            >
                              <div className="role-popup">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                  <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                    Đổi vai trò cho {member.name}
                                  </h4>
                                  <button
                                    onClick={() => setExpandedMemberId(null)}
                                    className="close-btn"
                                  >
                                    <XMarkIcon style={{ width: '24px', height: '24px' }} />
                                  </button>
                                </div>
                                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                                  Bạn muốn đổi vai trò của {member.name} từ{' '}
                                  <strong>Tester</strong> sang{' '}
                                  <strong>Test Leader</strong>?
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                  <button
                                    onClick={() => setExpandedMemberId(null)}
                                    className="cancel-btn"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    onClick={() => handleChangeRole(member)}
                                    disabled={isLoading}
                                    className="confirm-btn"
                                  >
                                    {isLoading ? (
                                      <>
                                        <svg
                                          className="loading-spinner"
                                          style={{ color: 'white' }}
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            style={{ opacity: 0.25 }}
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            style={{ opacity: 0.75 }}
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                                          ></path>
                                        </svg>
                                        Đang xử lý...
                                      </>
                                    ) : (
                                      'Xác nhận'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Sửa thông tin thành viên</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="close-btn"
                >
                  <XMarkIcon style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              <form onSubmit={handleEditMember}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Ảnh đại diện</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      ref={fileInputRef}
                    />
                    {editMember.avatar && (
                      <img
                        src={editMember.avatar}
                        alt="Preview"
                        className="avatar-preview"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/36')}
                      />
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Tên</label>
                  <input
                    type="text"
                    value={editMember.name}
                    onChange={(e) =>
                      setEditMember({ ...editMember, name: e.target.value })
                    }
                    placeholder="Nhập tên thành viên"
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={editMember.email}
                    onChange={(e) =>
                      setEditMember({ ...editMember, email: e.target.value })
                    }
                    placeholder="Nhập email"
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={editMember.phone}
                    onChange={(e) =>
                      setEditMember({ ...editMember, phone: e.target.value })
                    }
                    placeholder="Nhập số điện thoại (tùy chọn)"
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Vai trò</label>
                  <select
                    value={editMember.role}
                    onChange={(e) =>
                      setEditMember({ ...editMember, role: e.target.value })
                    }
                  >
                    <option value="tester">Tester</option>
                    <option value="customer">Customer</option>
                    <option value="testLeader">Test Leader</option>
                  </select>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Ngày tham gia</label>
                  <input
                    type="date"
                    value={
                      editMember.joinedAt ? editMember.joinedAt.split('T')[0] : ''
                    }
                    onChange={(e) =>
                      setEditMember({ ...editMember, joinedAt: e.target.value })
                    }
                  />
                </div>
                {['tester', 'testLeader'].includes(editMember.role) && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label>Số dự án tham gia</label>
                    <input
                      type="number"
                      value={editMember.projectCount}
                      onChange={(e) =>
                        setEditMember({
                          ...editMember,
                          projectCount: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Nhập số dự án"
                      min="0"
                    />
                  </div>
                )}
                <div className="form-buttons">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="cancel-btn"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="submit-btn"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="loading-spinner"
                          style={{ color: 'white' }}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            style={{ opacity: 0.25 }}
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            style={{ opacity: 0.75 }}
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                          ></path>
                        </svg>
                        Đang cập nhật...
                      </>
                    ) : (
                      'Cập nhật'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}


function App() {
  const [activeTab, setActiveTab] = useState('members');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memberTab, setMemberTab] = useState('testers');
  const [projectTab, setProjectTab] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(
    JSON.parse(localStorage.getItem('notifications'))?.map(notif => ({
      ...notif,
      isRead: notif.isRead ?? false,
    })) || []
  );
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [isUpdateMemberModalOpen, setIsUpdateMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [testers, setTesters] = useState(
    JSON.parse(localStorage.getItem('testers')) || [
      { id: '1', name: 'Tester 1', email: 'tester1@example.com', phone: '0123456789', role: 'tester', joinedAt: '2025-05-01', avatar: '', projectCount: 5 },
      { id: '2', name: 'Tester 2', email: 'tester2@example.com', phone: '0987654321', role: 'tester', joinedAt: '2025-04-15', avatar: '', projectCount: 3 },
      { id: '3', name: 'Tester 3', email: 'tester3@example.com', phone: '0912345678', role: 'tester', joinedAt: '2025-03-20', avatar: '', projectCount: 2 },
    ]
  );
  const [customers, setCustomers] = useState(
    JSON.parse(localStorage.getItem('customers')) || [
      { id: '4', name: 'Customer 1', email: 'customer1@example.com', phone: '0908765432', role: 'customer', joinedAt: '2025-02-10', avatar: '' },
      { id: '5', name: 'Customer 2', email: 'customer2@example.com', phone: '0932145678', role: 'customer', joinedAt: '2025-01-15', avatar: '' },
    ]
  );
  const [testLeaders, setTestLeaders] = useState(
    JSON.parse(localStorage.getItem('testLeaders')) || [
      { id: '6', name: 'Test Leader 1', email: 'leader1@example.com', phone: '0943215678', role: 'testLeader', joinedAt: '2025-01-01', avatar: '', projectCount: 8 },
    ]
  );

  const [projects, setProjects] = useState(JSON.parse(localStorage.getItem('projects')) || []);
  const [newProject, setNewProject] = useState({ name: '', customer: '', description: '' });

  // Lưu dữ liệu vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('testers', JSON.stringify(testers));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('testLeaders', JSON.stringify(testLeaders));
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [notifications, testers, customers, testLeaders, projects]);

  // Hiển thị popup thông báo khi có thông báo mới
  useEffect(() => {
    if (notifications.length > 0 && notifications[notifications.length - 1].isRead === false) {
      setShowNotificationPopup(true);
      const timer = setTimeout(() => {
        setShowNotificationPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Xóa một thông báo
  const deleteNotification = (index) => {
    const updatedNotifications = notifications.filter((_, i) => i !== index);
    setNotifications(updatedNotifications);
  };

  // Xóa tất cả thông báo
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, isRead: true }));
    setNotifications(updatedNotifications);
  };

  // Đánh dấu một thông báo là đã đọc
  const markAsRead = (index) => {
    const updatedNotifications = notifications.map((notif, i) =>
      i === index ? { ...notif, isRead: true } : notif
    );
    setNotifications(updatedNotifications);
  };

  // Lọc testers, customers, testLeaders theo searchQuery
  const filteredTesters = testers.filter(
    member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCustomers = customers.filter(
    member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTestLeaders = testLeaders.filter(
    member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Thêm thành viên mới
  const addMember = (newMember) => {
    const id = Date.now().toString();
    const updatedMember = { ...newMember, id };
    if (newMember.role === 'tester') {
      setTesters([...testers, updatedMember]);
    } else if (newMember.role === 'customer') {
      setCustomers([...customers, updatedMember]);
    } else if (newMember.role === 'testLeader') {
      setTestLeaders([...testLeaders, updatedMember]);
    }
    setNotifications(prev => [
      ...prev,
      { message: `Thành viên ${newMember.name} đã được thêm.`, timestamp: new Date().toISOString(), isRead: false },
    ]);
  };

  // Xóa thành viên
  const removeMember = (role, id) => {
    if (role === 'tester') {
      const updatedTesters = testers.filter(t => t.id !== id);
      setTesters(updatedTesters);
    } else if (role === 'customer') {
      const updatedCustomers = customers.filter(c => c.id !== id);
      setCustomers(updatedCustomers);
    } else if (role === 'testLeader') {
      const updatedTestLeaders = testLeaders.filter(l => l.id !== id);
      setTestLeaders(updatedTestLeaders);
    }
    setNotifications(prev => [
      ...prev,
      { message: `Thành viên đã được xóa.`, timestamp: new Date().toISOString(), isRead: false },
    ]);
  };

  // Cập nhật avatar thành viên
  const handleAvatarUpdate = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Kích thước ảnh tối đa 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedMember((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Cập nhật thông tin thành viên
  const updateMember = (e) => {
    e.preventDefault();
    if (!selectedMember.name.trim() || !selectedMember.email.trim()) {
      setError('Tên và email không được để trống');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(selectedMember.email)) {
      setError('Email không hợp lệ');
      return;
    }
    setIsLoading(true);
    const updatedMember = {
      ...selectedMember,
      joinedAt: selectedMember.joinedAt || new Date().toISOString(),
      projectCount: selectedMember.role === 'customer' ? 0 : parseInt(selectedMember.projectCount) || 0,
    };
    if (selectedMember.role === 'tester') {
      setTesters(testers.map(t => (t.id === selectedMember.id ? updatedMember : t)));
    } else if (selectedMember.role === 'customer') {
      setCustomers(customers.map(c => (c.id === selectedMember.id ? updatedMember : c)));
    } else if (selectedMember.role === 'testLeader') {
      setTestLeaders(testLeaders.map(l => (l.id === selectedMember.id ? updatedMember : l)));
    }
    setNotifications(prev => [
      ...prev,
      { message: `Thành viên ${selectedMember.name} đã được cập nhật.`, timestamp: new Date().toISOString(), isRead: false },
    ]);
    setIsUpdateMemberModalOpen(false);
    setSelectedMember(null);
    setError('');
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Thêm dự án mới
  const addProject = () => {
    if (newProject.name.trim() === '' || newProject.customer.trim() === '') return;
    const projectId = Date.now();
    const updatedProjects = [
      ...projects,
      { ...newProject, id: projectId, status: 'open', createdAt: new Date().toISOString(), subStatus: null },
    ];
    setProjects(updatedProjects);
    setNotifications(prev => [
      ...prev,
      { message: `Dự án ${newProject.name} đã được nhận từ Customer.`, timestamp: new Date().toISOString(), isRead: false },
    ]);
    setNewProject({ name: '', customer: '', description: '' });
  };

  // Lọc dự án theo tab
  const filteredProjects = projects.filter(project => projectTab === 'all' || project.status === projectTab);

  // Hàm hiển thị thời gian tương đối
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return time.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <img src="/logo.svg" alt="Arena Logo" className="logo" />
          <nav>
            <Link to="/">
              <div
                className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('home');
                  setSidebarOpen(false);
                }}
              >
                <UsersIcon className="w-5 h-5" />
                Trang chủ
              </div>
            </Link>
            <Link to="/members">
              <div
                className={`nav-item ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('members');
                  setSidebarOpen(false);
                }}
              >
                <UsersIcon className="w-5 h-5" />
                Quản lý thành viên
              </div>
            </Link>
            <Link to="/projects">
              <div
                className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('projects');
                  setSidebarOpen(false);
                }}
              >
                <FolderIcon className="w-5 h-5" />
                Quản lý dự án
              </div>
            </Link>
            <Link to="/payout">
              <div
                className={`nav-item ${activeTab === 'payout' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('payout');
                  setSidebarOpen(false);
                }}
              >
                <CurrencyDollarIcon className="w-5 h-5" />
                Payout Manager
              </div>
            </Link>
            <Link to="/statistics">
              <div
                className={`nav-item ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('statistics');
                  setSidebarOpen(false);
                }}
              >
                <ChartBarIcon className="w-5 h-5" />
                Thống kê báo cáo
              </div>
            </Link>
            <Link to="/courses">
              <div
                className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('courses');
                  setSidebarOpen(false);
                }}
              >
                <AcademicCapIcon className="w-5 h-5" />
                Quản lý khóa học
              </div>
            </Link>
          </nav>
          <div className="notification-section">
            <div className="notification-header">
              <div className="nav-item">
                <BellIcon className="w-5 h-5" />
                Thông báo
                {notifications.some(notif => !notif.isRead) && (
                  <span className="notification-badge">
                    {notifications.filter(notif => !notif.isRead).length}
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="notification-actions">
                  <button onClick={markAllAsRead} className="btn-action">
                    <CheckIcon className="w-4 h-4" /> Đánh dấu tất cả
                  </button>
                  <button onClick={clearAllNotifications} className="btn-action btn-action-danger">
                    <TrashIcon className="w-4 h-4" /> Xóa tất cả
                  </button>
                </div>
              )}
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-300">Không có thông báo</p>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  >
                    <div className="notification-content">
                      {!notification.isRead && <span className="unread-dot"></span>}
                      <span className="notification-message">{notification.message}</span>
                    </div>
                    <div className="notification-meta">
                      <span className="notification-timestamp">
                        {getRelativeTime(notification.timestamp)}
                      </span>
                      <div className="notification-buttons">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(index)}
                            className="btn-action btn-action-small"
                            title="Đánh dấu đã đọc"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(index)}
                          className="btn-action btn-action-small btn-action-danger"
                          title="Xóa thông báo"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Menu toggle for mobile */}
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Popup thông báo */}
        {showNotificationPopup && notifications.length > 0 && (
          <div className="notification-popup">
            <BellIcon className="w-5 h-5 mr-2" />
            <div className="notification-content">
              <span>{notifications[notifications.length - 1].message}</span>
              <span className="notification-timestamp">
                {getRelativeTime(notifications[notifications.length - 1].timestamp)}
              </span>
            </div>
            <button
              onClick={() => setShowNotificationPopup(false)}
              className="btn-action btn-action-small btn-action-danger"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal cập nhật thành viên */}
        {isUpdateMemberModalOpen && selectedMember && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Cập nhật thành viên</h3>
                <button
                  onClick={() => {
                    setIsUpdateMemberModalOpen(false);
                    setSelectedMember(null);
                    setError('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="modal-close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={updateMember} className="modal-content">
                <div className="form-group">
                  <label>Ảnh đại diện</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpdate}
                    ref={fileInputRef}
                  />
                  {selectedMember.avatar && (
                    <img src={selectedMember.avatar} alt="Avatar Preview" className="avatar-preview" />
                  )}
                </div>
                <div className="form-group">
                  <label>Tên</label>
                  <input
                    type="text"
                    value={selectedMember.name}
                    onChange={(e) => setSelectedMember({ ...selectedMember, name: e.target.value })}
                    placeholder="Nhập tên thành viên"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedMember.email}
                    onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })}
                    placeholder="Nhập email"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={selectedMember.phone}
                    onChange={(e) => setSelectedMember({ ...selectedMember, phone: e.target.value })}
                    placeholder="Nhập số điện thoại (tùy chọn)"
                  />
                </div>
                <div className="form-group">
                  <label>Vai trò</label>
                  <select
                    value={selectedMember.role}
                    onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })}
                  >
                    <option value="tester">Tester</option>
                    <option value="customer">Customer</option>
                    <option value="testLeader">Test Leader</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày tham gia</label>
                  <input
                    type="date"
                    value={selectedMember.joinedAt ? selectedMember.joinedAt.split('T')[0] : ''}
                    onChange={(e) => setSelectedMember({ ...selectedMember, joinedAt: e.target.value })}
                  />
                </div>
                {['tester', 'testLeader'].includes(selectedMember.role) && (
                  <div className="form-group">
                    <label>Số dự án tham gia</label>
                    <input
                      type="number"
                      value={selectedMember.projectCount}
                      onChange={(e) => setSelectedMember({ ...selectedMember, projectCount: parseInt(e.target.value) || 0 })}
                      placeholder="Nhập số dự án"
                      min="0"
                    />
                  </div>
                )}
                {error && (
                  <div className="error-message">{error}</div>
                )}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpdateMemberModalOpen(false);
                      setSelectedMember(null);
                      setError('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="btn-cancel"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-submit"
                  >
                    {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main content */}
        <Routes>
          <Route
            path="/"
            element={
              <main className="main-content px-4 sm:px-6 lg:px-8 py-6">
                <div className="card bg-white shadow-lg rounded-xl p-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Chào mừng đến với hệ thống quản lý</h2>
                  <p className="text-gray-600">Vui lòng chọn một mục từ thanh điều hướng để bắt đầu.</p>
                </div>
              </main>
            }
          />
          <Route
            path="/members"
            element={
              <Members
                memberTab={memberTab}
                setMemberTab={setMemberTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredTesters={filteredTesters}
                filteredCustomers={filteredCustomers}
                filteredTestLeaders={filteredTestLeaders}
                addMember={addMember}
                removeMember={removeMember}
                setSelectedMember={setSelectedMember}
                setIsUpdateMemberModalOpen={setIsUpdateMemberModalOpen}
              />
            }
          />
          <Route
            path="/projects"
            element={
              <main className="main-content">
                <div className="card">
                  <h2 className="text-center text-2xl font-semibold text-gray-800">Quản lý dự án</h2>
                  <div className="form-group justify-center">
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Tên dự án"
                      className="project-input"
                    />
                    <input
                      type="text"
                      value={newProject.customer}
                      onChange={(e) => setNewProject({ ...newProject, customer: e.target.value })}
                      placeholder="Customer"
                      className="project-input"
                    />
                    <input
                      type="text"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Mô tả dự án"
                      className="project-input"
                    />
                    <button onClick={addProject} className="btn-primary">
                      <PlusCircleIcon className="w-5 h-5" /> Nhận dự án
                    </button>
                  </div>
                  <div className="tab-buttons">
                    <button
                      className={`tab-button ${projectTab === 'open' ? 'active' : ''}`}
                      onClick={() => setProjectTab('open')}
                    >
                      Open
                    </button>
                    <button
                      className={`tab-button ${projectTab === 'accepted' ? 'active' : ''}`}
                      onClick={() => setProjectTab('accepted')}
                    >
                      Accepted
                    </button>
                    <button
                      className={`tab-button ${projectTab === 'reject' ? 'active' : ''}`}
                      onClick={() => setProjectTab('reject')}
                    >
                      Reject
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left border-b">Tên dự án</th>
                          <th className="p-3 text-left border-b">Customer</th>
                          <th className="p-3 text-left border-b">Trạng thái</th>
                          <th className="p-3 text-left border-b">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map(project => (
                          <tr key={project.id} className="hover:bg-gray-50">
                            <td className="p-3 border-b">{project.name}</td>
                            <td className="p-3 border-b">{project.customer}</td>
                            <td className="p-3 border-b">
                              <span
                                className={
                                  project.status === 'accepted'
                                    ? 'status-approved'
                                    : project.status === 'reject'
                                    ? 'status-rejected'
                                    : 'status-pending'
                                }
                              >
                                {project.status === 'accepted' && <CheckCircleIcon className="w-4 h-4" />}
                                {project.status === 'reject' && <XCircleIcon className="w-4 h-4" />}
                                {project.status === 'accepted'
                                  ? project.subStatus === 'ongoing'
                                    ? 'Accepted (Đang thực hiện)'
                                    : 'Accepted (Đã thực hiện xong)'
                                  : project.status}
                              </span>
                            </td>
                            <td className="p-3 border-b">
                              <Link to={`/project/${project.id}`}>
                                <button className="btn-info">
                                  <EyeIcon className="w-5 h-5" /> Xem
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </main>
            }
          />
          <Route path="/project/:projectId" element={<ProjectDetail setNotifications={setNotifications} />} />
          <Route path="/payout" element={<PayoutManager setNotifications={setNotifications} />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/courses" element={<CourseManager setNotifications={setNotifications} />} />
          <Route path="/courses/:courseId/lessons" element={<LessonManager setNotifications={() => {}} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
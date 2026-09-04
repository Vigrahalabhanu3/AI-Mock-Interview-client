import API from './api.js';

const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

const getResume = async () => {
    try {
        const response = await API.get('/resume');
        return response.data.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};

const startInterview = async (role, resumeText, totalQuestions) => {
    const response = await API.post('/interview/start', { role, resumeText, totalQuestions });
    return response.data.data;
};

const scheduleInterview = async ({ role, resumeText, scheduledAt, timezone, interviewType, duration }) => {
    const response = await API.post('/interview/schedule', {
        role,
        resumeText,
        scheduledAt,
        timezone,
        interviewType,
        duration,
    });
    return response.data.data;
};

const rescheduleInterview = async (interviewId, { newScheduledAt, timezone }) => {
    const response = await API.patch(`/interview/${interviewId}/reschedule`, {
        newScheduledAt,
        timezone,
    });
    return response.data.data;
};

const cancelInterview = async (interviewId, cancellationReason) => {
    const response = await API.patch(`/interview/${interviewId}/cancel`, {
        cancellationReason,
    });
    return response.data.data;
};

const getEmailLogs = async (interviewId) => {
    const response = await API.get(`/interview/${interviewId}/email-logs`);
    return response.data.data;
};

const submitTextAnswer = async (interviewId, answer) => {
    const response = await API.post(`/interview/${interviewId}/answer`, { answer });
    return response.data.data;
};

const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'answer.webm');

    const response = await API.post('/interview/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

const submitCode = async (interviewId, code, language) => {
    const response = await API.post(`/interview/${interviewId}/code`, { code, language });
    return response.data.data;
};

const endInterview = async (interviewId) => {
    const response = await API.post(`/interview/${interviewId}/end`);
    return response.data.data;
};

const getInterview = async (interviewId) => {
    const response = await API.get(`/interview/${interviewId}`);
    return response.data.data;
};

export {
    uploadResume,
    getResume,
    startInterview,
    scheduleInterview,
    rescheduleInterview,
    cancelInterview,
    getEmailLogs,
    submitTextAnswer,
    transcribeAudio,
    submitCode,
    endInterview,
    getInterview,
};
import React, { useState, useEffect, useRef } from 'react';
import CodingPage, { CodingPageHandle } from './CodingPage';
import QuestionPage, { QuestionPageHandle } from './QuestionPage';
import http from '../utils/http';
import './ExamPage.css';

interface Question {
    id: string;
    type: 'choice' | 'multiple-choice' | 'short-answer' | 'coding';
    questionText: string;
    options?: string[]; // For choice and multiple-choice questions
}

interface IProps {
    onFinishExam: () => void;
}

const ExamPage: React.FC<IProps> = ({ onFinishExam }) => {
    const [examId, setExamId] = useState<number>(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [codingQuestions, setCodingQuestions] = useState<Question[]>([]);
    const [codingQuestion, setCodingQuestion] = useState<Question | null>(null);
    const [showCoding, setShowCoding] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(3600); // Time in seconds (e.g., 1 hour)
    const codingRef = useRef<CodingPageHandle | null>(null);
    const questionRef = useRef<QuestionPageHandle | null>(null);
    const timeRef = useRef<number>(3600);

    useEffect(() => {
        fetchExamData();

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    // 自动提交
                    if (showCoding) {
                        if (codingRef.current) {
                            codingRef.current.handleSubmit(true);
                        }
                    } else {
                        if (questionRef.current) {
                            questionRef.current.handleSubmit(true);
                        }
                    }
                    // 结束考试
                    handleFinish();

                    return 0;
                }
                timeRef.current = prevTime - 1;
                return prevTime - 1;
            });
        }, 1000);

        return () => {
            updateServerLimitTime();
            clearInterval(timer);
        };
    }, []);

    const fetchExamData = async () => {
        try {
            const response = await http.get('/api/exam', {
                params: { userId: 1 },
            });
            console.log('test fetch:', response.data);
            const { id, timeLimit, questions } = response.data || {};
            if (!id) {
                console.error('Exam ID not found in response');
                return;
            }
            setExamId(id);
            setTimeLeft(timeLimit);
            timeRef.current = timeLimit;
            setQuestions(questions.filter((question: Question) => question.type !== 'coding'));
            setCodingQuestions(questions.filter((question: Question) => question.type === 'coding'));
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const updateServerLimitTime = async () => {
        try {
            console.log('test update:', examId, timeRef.current);
            await http.post(`/api/exam/time`, { examId, userId: 1, timeLimit: timeRef.current });
        } catch (error) {
            console.error('Error updating server time limit:', error);
        }
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleQustionSubmitCB = () => {
        // Update after submitting question
        if (codingQuestions.length) {
            setShowCoding(true);
            setCodingQuestion(codingQuestions[0]);
            setCodingQuestions(codingQuestions.slice(1));
        } else {
            // 结束考试
            handleFinish();
        }
    }

    const handleFinish = () => {
        // 结束考试
        console.log('Exam finished');
        // alert('考试结束，感谢您的参与！');
        // TODO: 跳转到结果页面
        if (onFinishExam) {
            onFinishExam();
        }
    }

    return (
        <>
            <div className='flex flex-column center top-fixed'>
                <div className="header-title">xxx公司在线笔试</div>
                <div className='flex-center'>考试剩余时间: {formatTime(timeLeft)}</div>
            </div>
            <div className='content-container'>
                {!showCoding && <QuestionPage ref={questionRef} examId={examId} questions={questions} submitSuccessCB={handleQustionSubmitCB} />}
                {showCoding && <CodingPage ref={codingRef} examId={examId} question={codingQuestion} submitSuccessCB={handleQustionSubmitCB} />}
            </div>
        </>
    );
};

export default ExamPage;

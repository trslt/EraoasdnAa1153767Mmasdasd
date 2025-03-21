import { isUserEnrolledInCourse, useQuery } from 'wasp/client/operations';
import { courseEnrollment } from '../../../services/client/CourseServices';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type EnrollContinueCourseButtonProps = {
    courseId: string,
}

export default function EnrollContinueCourseButton({ courseId }: EnrollContinueCourseButtonProps) {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    // Query to check if user is enrolled in the course
    const {
        data: enrollmentData,
        isLoading,
        error
    } = useQuery(isUserEnrolledInCourse, {
        courseId
    });

    // Store enrollment information when data is loaded
    useEffect(() => {
        if (enrollmentData && enrollmentData.isEnrolled && enrollmentData.enrollment) {
            setEnrollment({
                nextLessonId: enrollmentData.enrollment.currentLessonId || ''
            });
        }
    }, [enrollmentData]);

    const [enrollment, setEnrollment] = useState({
        nextLessonId: ''
    });

    // Function to enroll in the course
    const enrollCourse = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            const enrollmentResult = await courseEnrollment({ courseId });

            console.log("Iscrizione completata", enrollmentResult);

            if (enrollmentResult && enrollmentResult.nextLessonId) {

                navigate(`/app/play/lesson/${enrollmentResult.nextLessonId}`);
            } else {
                console.error("Missing nextLessonId in enrollment response");
            }
        } catch (error) {
            console.error("Errore durante l'iscrizione al corso:",
                error instanceof Error ? error.message : 'Errore sconosciuto');
        } finally {
            setIsProcessing(false);
        }
    };

    // Function to continue to the next lesson
    const continueLesson = () => {
        if (isProcessing || !enrollment.nextLessonId) return;

        setIsProcessing(true);
        try {
            navigate(`/app/play/lesson/${enrollment.nextLessonId}`);
        } catch (error) {
            console.error("Errore durante la navigazione alla lezione:",
                error instanceof Error ? error.message : 'Errore sconosciuto');
            setIsProcessing(false);
        }
    }

    // Show appropriate button based on loading and enrollment state
    return (
        <div>
            {isLoading ? (
                <button
                    disabled
                    className="bg-gray-300 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center min-w-[120px]"
                >
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Caricamento...
                </button>
            ) : isProcessing ? (
                <button
                    disabled
                    className="bg-blue-400 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center min-w-[120px]"
                >
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Elaborazione...
                </button>
            ) : enrollmentData && enrollmentData.isEnrolled ? (
                <button
                    onClick={continueLesson}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                    Continua Corso
                </button>
            ) : (
                <button
                    onClick={enrollCourse}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                    Avvia Corso
                </button>
            )}

            {error && (
                <p className="text-red-500 text-xs mt-1">
                    Si è verificato un errore. Riprova più tardi.
                </p>
            )}
        </div>
    );
}
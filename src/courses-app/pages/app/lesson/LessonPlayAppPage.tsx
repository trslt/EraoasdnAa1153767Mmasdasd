import React from 'react';
import {
  BlockTitle,
  Navbar,
  NavbarBackLink,
  Button
} from 'konsta/react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import {
  useQuery,
  getLessonProgress,
  getChapterNextLesson
} from 'wasp/client/operations';
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { JSONContent } from '@tiptap/react';
import { Course } from "wasp/entities";
import YoupiterLessonPlayer from '../../../components/YoupiterLessonPlayer';
import MarkAsCompleteButton from '../../../components/app/lesson/MarkAsCompleteButton';

export default function LessonPlayAppPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [chapter, setChapter] = useState<any>(null);

  if (!state) {
    console.log("attento, non c'è il corso")
    navigate("*");
    return null;
  }

  console.log("chapterId", state.chapterId);
  const { course } = state as { course: Course };

  // Redirect early if no lessonId
  useEffect(() => {
    if (!lessonId) {
      navigate("*");
    }
  }, [lessonId, navigate]);

  if (!lessonId) {
    return null;
  }

  const exitAlert = () => {
    navigate(`/app/course/${course.id}`);
  }

  // Ottieni lo stato di progresso dell'utente per questa lezione
  const {
    data: progressData,
    isLoading: isLoadingProgress
  } = useQuery(getLessonProgress, { lessonId, courseId: course.id });

  // Ottieni informazioni sul capitolo corrente e la lezione successiva
  const {
    data: nextLessonData,
    isLoading: isLoadingNextLesson,
    error: nextLessonError
  } = useQuery(getChapterNextLesson, 
    { 
      chapterId: state.chapterId, 
      currentLessonId: lessonId 
    },
    {
      enabled: !!state.chapterId
    }
  );

  const isLessonCompleted = progressData?.completed || false;

  const handleNextLesson = () => {
    if (nextLessonData && nextLessonData.lesson) {
      navigate(`/app/play/lesson/${nextLessonData.lesson.id}`, { 
        state: { 
          course, 
          chapterId: state.chapterId 
        } 
      });
    } else {
      // Se non c'è una prossima lezione, torna alla pagina del corso
      navigate(`/app/course/${course.id}`);
    }
  };

  const handleLessonCompleted = () => {
    // Questa funzione viene chiamata quando una lezione è stata completata
    // Potrebbe essere utile per aggiornare l'interfaccia utente
  };

  return (
    <div className="mb-20">
      <Navbar
        title="Lesson Title"
        subtitle="Chapter Name"
        className="top-0 sticky"
        left={<NavbarBackLink
          onClick={() => exitAlert()}
        />}
      />

      <YoupiterLessonPlayer
        lessonId={lessonId}
        lang="en"
      />

      <div className="flex justify-between items-center px-4 py-2 fixed bottom-16 left-0 right-0 bg-white shadow-md">
        {course && !isLessonCompleted ? (
          <MarkAsCompleteButton
            lessonId={lessonId}
            courseId={course.id}
            onComplete={handleLessonCompleted}
            className="flex-1 mx-2"
          />
        ) : (
          <Button
            onClick={handleNextLesson}
            className="flex-1 mx-2 bg-blue-500 text-white"
            disabled={isLoadingNextLesson}
          >
            {isLoadingNextLesson ? 'Caricamento...' : 
             nextLessonData && nextLessonData.lesson ? 'Prossima lezione' : 'Torna al corso'}
          </Button>
        )}
      </div>
    </div>
  );
}
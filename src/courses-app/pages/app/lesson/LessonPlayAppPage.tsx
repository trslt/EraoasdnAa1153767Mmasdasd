import React from 'react';
import {
  BlockTitle,
  Navbar,
  NavbarBackLink
} from 'konsta/react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import {
  useQuery,
  getLessonProgress,
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

  if (!state) {
    console.log("attento, non c'è il corso")
    navigate("*");
    return null;
  }

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
    console.log("exit - //TODO")
  }

  // Ottieni lo stato di progresso dell'utente per questa lezione
  const {
    data: progressData,
    isLoading: isLoadingProgress
  } = useQuery(getLessonProgress, { lessonId, courseId: course.id });

  const isLessonCompleted = progressData?.completed || false;

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

      {course && !isLessonCompleted ? (
        <MarkAsCompleteButton
          lessonId={lessonId}
          courseId={course.id}
          // onComplete={handleLessonCompleted}
          className="w-full max-w-md"
        />
      ) : isLessonCompleted && (
        <button

          className="ml-4 bg-blue-500 text-white p-2 rounded-full"
          aria-label="Prossima lezione"
        >
          Prossima lezione
        </button>
      )}

    </div>
  );
}




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
  getLesson,
  getLessonContents,
  getChapterNextLesson,
} from 'wasp/client/operations';
import { useEffect, useState } from "react";
import { JSONContent } from '@tiptap/react';
import YoupiterLessonPlayer from '../../../components/YoupiterLessonPlayer';

export default function LessonPlayAppPage() {

  const { lessonId, courseId } = useParams<{ lessonId: string, courseId: string }>();
  const navigate = useNavigate();

  // Redirect early if no lessonId
  useEffect(() => {
    if (!lessonId || !courseId) {
      navigate("*");
    }
  }, [lessonId, navigate]);

  if (!lessonId) {
    return null;
  }


  console.log("lessonId", lessonId, "courseId", courseId)

  const { data: lesson } = useQuery(getLesson, { lessonId });

  // Ottieni il contenuto della lezione
  const { data: lessonContent, isLoading } = useQuery(getLessonContents, { lessonId, lang: 'en' });

  const [localLessonContent, setLocalLessonContent] = useState<JSONContent>();


  const getNextLesson = async () => {
    
      // Ottieni la prossima lezione utilizzando l'operazione getChapterNextLesson
  }

  // Prende il contenuto dell'editor e lo salva in locale
  const updateLocalLessonContent = (content: JSONContent) => {

    setLocalLessonContent(content)

    console.log("contenuto aggiornato", localLessonContent)
  }

  const exitAlert = () => {
    console.log("exit - //TODO")
  }

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
      
    </div>
  );
}




import React from 'react';
import {
  BlockTitle,
  Navbar,
  NavbarBackLink
} from 'konsta/react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import { useQuery, getLesson, getLessonContents } from 'wasp/client/operations';
import { useEffect, useState } from "react";
import { JSONContent } from '@tiptap/react';
import NotionLikeEditor from '../../../editor/NotionLikeEditor';

export default function LessonPlayer() {

  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  // Redirect early if no lessonId
  useEffect(() => {
    if (!lessonId) {
      navigate("*");
    }
  }, [lessonId, navigate]);

  if (!lessonId) {
    return null;
  }

  const { data: lesson } = useQuery(getLesson, { lessonId });

  const { data: lessonContent, isLoading } = useQuery(getLessonContents, { lessonId, lang: 'en' });

  const [localLessonContent, setLocalLessonContent] = useState<JSONContent>();

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
      {isLoading ? (
        <div>Caricamento editor...</div>
      ) : (
        <>
          <NotionLikeEditor
            contentProp={lessonContent?.[0]?.content as JSONContent}
            onUpdateFn={(content: JSONContent) => { updateLocalLessonContent(content) }}
            editable={false}
          />
        </>
      )}
    </div>
  );
}




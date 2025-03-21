import React from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Course } from 'wasp/entities';
import {
  useQuery,
  getCourse,
  getCourseChapterList,
  getLessonsByChapterIDs,
} from 'wasp/client/operations';
import {
  useRedirect404IfMissingParams,
} from '../../../services/ClientServices';
import { courseEnrollment } from '../../../services/client/CourseServices';

// Componente Header del Corso
const CourseHeader = ({
  title,
  subtitle,
  duration,
  backgroundImage,
  progress,
  onContinue,
  onShare,
  onBookmark,
  onInfo,
  onDownload
}: {
  title: string,
  subtitle: string,
  duration: string,
  backgroundImage: string,
  progress: number,
  onContinue: () => void,
  onShare: () => void,
  onBookmark: () => void,
  onInfo: () => void,
  onDownload: () => void
}) => {
  return (
    <div className="relative mb-5">
      {/* Immagine di sfondo con overlay */}
      <div className="relative h-64 w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          {/* Overlay gradiente per migliorare la leggibilità del testo */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-90"></div>
        </div>

        {/* Informazioni corso posizionate in basso */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          <p className="text-sm opacity-90 mb-2">{subtitle}</p>
          <div className="flex items-center text-xs mb-3">
            <span className="mr-2">{duration}</span>
            <div className="h-1 w-1 bg-white rounded-full mx-1"></div>
            <span>Completato: {progress}%</span>
          </div>

          {/* Barra di progresso */}
          <div className="h-1 bg-white bg-opacity-30 rounded-full w-full mt-2">
            <div
              className="h-1 bg-white rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Pulsanti azione */}
      <div className="flex justify-between px-4 py-3 border-b border-gray-200">
        <button
          onClick={onContinue}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm"
        >
          Avvia Corso
        </button>

        <button
          onClick={onContinue}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm"
        >
          Prosegui Corso
        </button>

        <div className="flex space-x-4">
          <button onClick={onShare} className="text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button onClick={onBookmark} className="text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button onClick={onInfo} className="text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CourseViewAppPage() {

  const params = useParams();
  const navigate = useNavigate();

  useRedirect404IfMissingParams({ params, paramName: 'courseId' });

  const [course, setCourse] = useState<Course>();

  const {
    data: courseInfo,
    isLoading: isLoadingCourseInfo,
    error: courseInfoError
  } = useQuery(getCourse, { courseId: params.courseId! });

  useEffect(() => {
    // Se il corso non viene trovato
    if (!isLoadingCourseInfo && courseInfo == null) {
      navigate("/app/not-found/course");
    }

    if (courseInfo != null) {
      setCourse(courseInfo as Course);
    }
  }, [courseInfo]);

  const goBack = () => {
    history.back();
  };

  /* Tutti i capitoli del corso */
  const {
    data: chapters,
    isLoading: isLoadingChapters,
    refetch: refetchChapters
  } = useQuery(getCourseChapterList,
    {
      courseId: course?.id!
    },
    {
      enabled: !!course // Esegui questa query solo quando course è disponibile
    }
  );

  const {
    data: lessons,
    isLoading: isLoadingLessons,
    refetch: refetchLessons
  } = useQuery(getLessonsByChapterIDs,
    {
      chapterIDs: chapters?.map((chapter) => chapter.id) || []
    },
    {
      enabled: !!chapters && chapters.length > 0 // Esegui questa query solo quando chapters è disponibile
    }
  );

  const enrollCourse = async (courseId: string) => {
    try {

      const enrollment = await courseEnrollment({ courseId });


      console.log("Iscrizione completata", enrollment);

      navigate(`/app/play/${courseId}/${enrollment.nextLessonId}`);
    } catch (error) {
      console.error("Errore durante l'iscrizione al corso:", error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen mb-20">
      {/* Navbar */}
      <div className="bg-blue-500 text-white shadow-sm">
        <div className="px-4 py-4 flex items-center">
          <button onClick={goBack} className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">
            {!isLoadingCourseInfo && course ? course.title : ""}
          </h1>
        </div>
      </div>

      {isLoadingCourseInfo && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!isLoadingCourseInfo && course && (
        <>
          <CourseHeader
            title={course.title}
            subtitle={course.shortDescription || ""}
            duration="10h | 350 studenti"
            backgroundImage={course.image || "/api/placeholder/400/320"}
            progress={0}
            onContinue={() => enrollCourse(course.id)}
            onShare={() => console.log('Share')}
            onBookmark={() => console.log('Bookmark')}
            onInfo={() => console.log('Info')}
            onDownload={() => console.log('Download')}
          />

          {/* Descrizione del corso */}
          <div className="px-4 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Descrizione</h2>
            <p className="text-sm text-gray-600">{course.shortDescription}</p>
          </div>

          {/* Contenuto del corso */}
          <div className="px-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Contenuto del corso</h2>

            {isLoadingChapters || isLoadingLessons ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="mb-6">
                {chapters && lessons && chapters.map(chapter => {
                  const lessonsInChapters = lessons.filter(lesson => lesson.chapterId === chapter.id);

                  return (
                    <div key={`ch-${chapter.id}`} className="mb-4">
                      {/* Titolo del capitolo */}
                      <div className="bg-gray-100 px-4 py-2 font-medium text-gray-700 rounded-t-lg">
                        {chapter.title}
                      </div>

                      {/* Lezioni del capitolo */}
                      <div className="border border-gray-200 rounded-b-lg divide-y">
                        {lessonsInChapters.map((lessonInChapter) => (
                          <div
                            key={lessonInChapter.lesson.id}
                            className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                            onClick={() => console.log("TODO: Apri descrizione lezione")}
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="text-sm">{lessonInChapter.lesson.title}</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTAs finali */}
          <div className="px-4 mb-8">
            <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium mb-3">
              Inizia/Continua il corso
            </button>
          </div>
        </>
      )}
    </div>
  );
}
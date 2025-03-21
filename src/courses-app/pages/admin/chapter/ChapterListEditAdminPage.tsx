import { type AuthUser } from 'wasp/auth';
import {
  useQuery,
  getCourseChapterList,
  getCourse,
  getLessonsByChapterIDs
} from 'wasp/client/operations';
import {
  type Course,
  Chapter,
} from 'wasp/entities';
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import { api } from "wasp/client/api";
import { useState, useEffect } from "react";
import YoupiterBreadcrumb from '../../../components/YoupiterBreadcrumb';
import { Home, Layout } from 'lucide-react';
import YoupiterTable from '../../../components/YoupiterTable';
import { ProjectData } from '../../../components/YoupiterTable'
import YoupiterButton from '../../../components/YoupiterButton';
import { Plus, TableOfContents, FilePlus2, Pencil } from 'lucide-react';
import { JSONContent } from '@tiptap/react';
import { useRedirectHomeUnlessUserIsAdmin } from '../../../services/ClientServices';

export default function ChapterListEditAdminPage({ user }: { user: AuthUser }) {

  useRedirectHomeUnlessUserIsAdmin({ user });

  const params = useParams()
  const navigate = useNavigate();

  if (!params.courseId) {
    navigate("*");
    return null;
  }

  /* Aggiungi un capitolo al corso */
  const createChapter = async () => {

    const title = prompt("Inserisci il titolo del capitolo");

    try {

      await api.put(`/api/admin/course/${params.courseId}/chapter`, {
        title
      });

      // Dopo aver aggiunto il capitolo, ricarica i dati
      // Questo forzerà la query getCourseChapters a ri-eseguirsi
      // e aggiornare automaticamente l'interfaccia
      await refetchChapters(); // Usa refetchChapters invece di useQuery
    } catch (error) {
      console.error("Errore nell'aggiungere il capitolo:", error);
    }
  };

  const defaultContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Start here :)'
          }
        ],
      }
    ]
  };

  const createLesson = async ({ chapterId, title, courseId, content }: {
    chapterId: number,
    title: string,
    courseId: string,
    content?: JSONContent
  }) => {

    try {

      await api.post(`/api/admin/lesson`, {
        chapterId,
        title,
        courseId: String(courseId),
        lang: 'en',
        content: JSON.stringify(defaultContent)
      });

      await refetchLessons();

    } catch (e) {
      console.log("errore nel creare la lezione", e as Error);
    }

  };

  const [courseData, setCourseData] = useState<Course>();

  const {
    data: courseInfo,
  } = useQuery(getCourse, { courseId: params.courseId })

  useEffect(() => {

    if (courseInfo != null) {

      console.log("dati del corso ottenuti", courseInfo)

      setCourseData(courseInfo)
    }
  }, [courseInfo]);

  /* Tutti i capitoli del corso */
  const {
    data: chapters,
    isLoading: isLoadingChapters,
    refetch: refetchChapters
  } = useQuery(getCourseChapterList, { courseId: params.courseId! })

  /* Lezioni basate sui capitoli (query condizionale) */
  const {
    data: lessons,
    isLoading: isLoadingLessons,
    refetch: refetchLessons
  } = useQuery(getLessonsByChapterIDs,
    {
      chapterIDs: chapters?.map((chapter: Chapter) => chapter.id) || []
    },
    {
      enabled: !!chapters && chapters.length > 0 // Esegui questa query solo quando chapters è disponibile
    }
  )

  const [chapterRows, setChapterRows] = useState<ProjectData[]>();

  useEffect(() => {

    if (chapters && lessons) {

      // Qui puoi aggiornare lo stato con i dati combinati di capitoli e lezioni
      const chapterRows = chapters.map((chapter: Chapter) => {
        // Trova tutte le lezioni per questo capitolo
        const chapterLessons = lessons.filter(lesson => lesson.chapterId === chapter.id);

        const isCollapsible = chapterLessons.length > 0;

        const subRowColumns = [
          {
            key: 'lessonName',
            title: 'Nome',
            width: '40%',
            render: (value: string, row: any) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={row.icon || 'default-icon.png'}
                  alt={row.name}
                  style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                />
                <span>{value}</span>
              </div>
            )
          },
          {
            key: 'lessonActions',
            title: 'Azioni',
            sortable: false,
            render: ({ lessonId, versionId }: { lessonId: string, versionId: string }, row: any) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>
                  <Link
                    to={`/lesson/${lessonId}/edit`}
                  >
                    <YoupiterButton
                      showIcon
                      icon={Pencil}
                    />
                  </Link>

                </span>
              </div>
            ),
          },
        ];

        const subRows = chapterLessons.map((lessonInChapter) => {
          return (
            {
              id: String(lessonInChapter.id),
              icon: 'https://placehold.co/24',
              lessonName: lessonInChapter.lesson?.title,
              lessonActions: { lessonId: lessonInChapter.lesson?.id }
            })
        });

        return {
          id: String(chapter.id),
          chapterTitle: chapter.title,
          chapterLanguages: "it",
          chapterLessons: chapterLessons.length, // Aggiorna con il conteggio effettivo
          chapterActions: { courseId: chapter.courseId, chapterId: chapter.id },
          isCollapsible,
          subRowColumns: isCollapsible ? subRowColumns : [],
          subRows: isCollapsible ? subRows : [],
        };
      });

      setChapterRows(chapterRows);
    }
  }, [chapters, lessons]);

  const breadCrumbItems = [
    {
      label: 'Home',
      href: '#',
      icon: <Home className="shrink-0 me-3 size-4" />
    },
    {
      label: 'Modifica Capitoli del Corso',
      href: '#',
      icon: <Layout className="shrink-0 me-3 size-4" />
    },
    {
      label: 'Titolo del corso',
    }
  ];

  const columns = [
    {
      key: 'chapterTitle',
      title: 'Titolo Capitolo',
      width: '30%',
      sortable: false,
      render: (value: string, row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TableOfContents />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'chapterLanguages',
      title: 'Lingue',
      sortable: false,
      render: (value: number) => `${value.toLocaleString()}`,
    },
    {
      key: 'chapterLessons',
      title: 'Lezioni',
      sortable: false,
      render: (value: number) => `${value.toLocaleString()}`,
    },
    {
      key: 'chapterActions',
      title: 'Azioni',
      sortable: false,
      render: ({ courseId, chapterId }: { courseId: string, chapterId: number }, row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>
            <YoupiterButton
              showIcon
              icon={Pencil}
            />
          </span>
          <span>
            <YoupiterButton
              showIcon
              icon={FilePlus2}
              onClick={() => createLesson({ title: prompt("Titolo della lezione") || "", chapterId, courseId, content: defaultContent})}
            />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
        <div className="flex">

          <div className="flex-1 ml-64 p-8 pt-0">
            <YoupiterBreadcrumb items={breadCrumbItems}></YoupiterBreadcrumb>
            <div className="grid gap-8 mt-5">
              <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center'>
                  <h3 className='font-medium text-black dark:text-white'>Gestisci Capitoli e Lezioni</h3>
                  <YoupiterButton
                    showIcon
                    icon={Plus}
                    onClick={() => createChapter()}>
                    Aggiungi capitolo
                  </YoupiterButton>
                </div>
                {isLoadingChapters ? (
                  <div>Caricamento in corso</div>
                ) : chapterRows ? (
                  <YoupiterTable columns={columns} data={chapterRows} />
                ) : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
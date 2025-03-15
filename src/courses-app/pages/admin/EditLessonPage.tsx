import { type AuthUser } from 'wasp/auth';
import NotionLikeEditor from "../../editor/NotionLikeEditor"
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import { useQuery, getLesson, getLessonContents } from 'wasp/client/operations';
import { JSONContent } from '@tiptap/react';
import { useEffect, useState } from "react";
import YoupiterBreadcrumb from '../../components/YoupiterBreadcrumb';
import { Home, Layout, Languages, Save } from 'lucide-react';
import YoupiterButton from '../../components/YoupiterButton';
import { DropdownOption } from '../../components/YoupiterDropdownWithImage';
import YoupiterDropdownWithImage from '../../components/YoupiterDropdownWithImage';
import { api } from "wasp/client/api";
import { useRedirectHomeUnlessUserIsAdmin } from '../../services/ClientServices';


export default function EditLessonPage({ user }: { user: AuthUser }) {

  useRedirectHomeUnlessUserIsAdmin({ user });

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

  const updateLessonContent = async ({ lessonId, lang, content }:{
    lessonId: string,
    lang: string,
    content: JSONContent
  }) => {
    try {

      await api.put(`/api/admin/lesson/${lessonId}/content`, { lang, content });

      console.log("Lezione aggiornata con successo")
    } catch (error) {

      console.log("impossibile aggiornare la lezione", error instanceof Error ? error.message : '')
    }
  };

  const nuovoContenuto = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Questo e un contenuto fresco fresco'
          }
        ],
      }
    ]

  };

  const breadCrumbItems = [
    {
      label: 'Home',
      href: '#',
      icon: <Home className="shrink-0 me-3 size-4" />
    },
    {
      label: 'Lessons',
      href: '#',
      icon: <Layout className="shrink-0 me-3 size-4" />
    },
    {
      label: 'Edit Lesson',
      href: '#',
      icon: <Layout className="shrink-0 me-3 size-4" />
    }
  ];

  const [selectedLanguage, setSelectedLanguage] = useState<string | number>('en-US');

  const handleLanguageChange = (option: DropdownOption) => {
    setSelectedLanguage(option.id);
    console.log(`Lingua selezionata: ${option.label}`);
  };

  const languageOptions: DropdownOption[] = [
    {
      id: 'en-US',
      icon: '/path/to/usa-flag.png', // In un'app reale, usa percorsi reali alle immagini
      label: 'English (US)'
    },
    {
      id: 'en-UK',
      icon: '/path/to/uk-flag.png',
      label: 'English (UK)'
    },
    {
      id: 'de',
      icon: '/path/to/germany-flag.png',
      label: 'Deutsch'
    },
    {
      id: 'da',
      icon: '/path/to/denmark-flag.png',
      label: 'Dansk'
    },
    {
      id: 'it',
      icon: '/path/to/italy-flag.png',
      label: 'Italiano'
    },
    {
      id: 'zh',
      icon: '/path/to/china-flag.png',
      label: '中文 (繁體)'
    }
  ];

  return (
    <div>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
        <div className="flex">

          <div className="flex-1 ml-64 p-8 pt-0">
            <YoupiterBreadcrumb items={breadCrumbItems}></YoupiterBreadcrumb>
            <div className='grid mt-5'>
              <div className='flex flex-col gap-9'>
                <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                  <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center'>
                    <h3 className='font-medium text-black dark:text-white'>Modifica Lezione</h3>
                    <YoupiterButton
                      showIcon
                      icon={Languages}
                    >
                      Aggiungi Lingua
                    </YoupiterButton>
                    <YoupiterDropdownWithImage
                      options={languageOptions}
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                    />
                    <YoupiterButton
                      showIcon
                      icon={Save}
                      onClick={() => updateLessonContent({ lessonId, lang: 'en', content: localLessonContent! })}
                    >
                      Salva
                    </YoupiterButton>
                  </div>
                </div>

                {isLoading ? (
                  <div>Caricamento editor...</div>
                ) : (
                  <NotionLikeEditor
                    contentProp={lessonContent?.[0]?.content as JSONContent}
                    onUpdateFn={(content: JSONContent) => { updateLocalLessonContent(content) }}
                    editable={true}
                  />
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { type AuthUser } from 'wasp/auth';
import {
  useQuery,
  getCourse
} from 'wasp/client/operations';
import { type Course } from 'wasp/entities';
import { useParams } from 'react-router';
import { useState, useEffect } from "react";
import YoupiterBreadcrumb from '../../../components/YoupiterBreadcrumb';
import YoupiterCourseForm from '../../../components/admin/YoupiterCourseForm'
import YoupiterButton from '../../../components/YoupiterButton';
import { Link as ReactRouterLink } from 'react-router-dom';
import { routes } from 'wasp/client/router';
import {
  useRedirectHomeUnlessUserIsAdmin,
  useRedirect404IfMissingParams
} from '../../../services/ClientServices';
import {
  updateCourseCover,
  updateCourseCategories,
  updateCourseInstructors,
  updateCourse,
} from '../../../services/client/CourseServices';
import { EditCourseBreadcrumbData } from '../../../data/BreadCrumbData';

export default function CourseEditAdminPage({ user }: { user: AuthUser }) {

  useRedirectHomeUnlessUserIsAdmin({ user });

  const params = useParams()

  useRedirect404IfMissingParams({ params: useParams(), paramName: 'courseId' });

  const [courseData, setCourseData] = useState<Course>();

  const {
    data: courseInfo,
    isLoading: isLoadingCourseInfo,
    error: courseInfoError
  } = useQuery(getCourse, { courseId: params.courseId! })

  useEffect(() => {

    if (courseInfo != null) {

      console.log("dati del corso ottenuti", courseInfo)

      setCourseData(courseInfo)
    }
  }, [courseInfo]);


  const onCoverUpdateClick = async (cover: File) => {
    try {
      await updateCourseCover({ cover, courseId: params.courseId! });
      console.log("immagine aggiornata");
    } catch (err) {
      console.log("Errore durante l'aggiornamento della cover del corso:", err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  };

  const onCategoriesUpdateClick = async (categories: any) => {

    try {
      await updateCourseCategories({ categoryIds: categories.map((category: any) => category.id), courseId: params.courseId! });
      console.log("Categorie aggiornate");
    }
    catch (err) {
      console.log("Errore durante l'aggiornamento delle categorie del corso:", err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  };

  const onInstructorsUpdateClick = async (instructors: any) => {

    try {
      await updateCourseInstructors({
        instructorIds: instructors.map((instructor: any) => instructor.id),
        courseId: params.courseId!
      });
      console.log("Istruttori aggiornati");
    } catch (err) {
      console.log("Errore durante l'aggiornamento degli istruttori del corso:", err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  }

  const onUpdateCourseClick = async (course: any) => {

    try {

      const { id: courseId, title, description, shortDescription } = course;

      await updateCourse({ courseId, title, description, shortDescription });

      console.log("Corso aggiornato");

    } catch (err) {
      console.log("Errore durante l'aggiornamento del corso:", err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
        <div className="flex">

          <div className="flex-1 ml-64 p-8 pt-0">
            <YoupiterBreadcrumb items={EditCourseBreadcrumbData}/>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-5">

              {/* Inizio Colonna 1 */}
              <div className="space-y-8">
                {isLoadingCourseInfo && !courseData ? (
                  <div className="w-full p-3 bg-gray-100 rounded-lg animate-pulse">
                    Caricamento info corso...
                  </div>
                ) : (
                  <YoupiterCourseForm
                    courseInfo={courseData}
                    buttonText='Aggiorna Corso'
                    isCategories
                    isInstructors
                    isCover
                    onSubmit={(course) => onUpdateCourseClick(course)}
                    onCoverUpdateClick={(cover) => onCoverUpdateClick(cover)}
                    onCategoriesUpdateClick={(categories) => onCategoriesUpdateClick(categories)}
                    onInstructorsUpdateClick={(instructors) => onInstructorsUpdateClick(instructors)}
                  >
                  </YoupiterCourseForm>)}
              </div>
              {/* Fine Colonna 1 */}

              {/* Inizio Colonna 2 */}
              <div className="space-y-8">
                <div className='flex flex-col gap-1'>

                  <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                    <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                      <h3 className='font-medium text-black dark:text-white'>Capitoli e Lezioni</h3>
                    </div>
                    <div className='flex flex-col gap-5.5 p-6.5'>
                      <ReactRouterLink
                        to={`/admin/course/${params.courseId}/chapters/edit`}
                      >
                        <YoupiterButton>
                          Aggiungi/Modifica Capitoli
                        </YoupiterButton>
                      </ReactRouterLink>

                      <ReactRouterLink
                        to={routes.CourseCreateAdminPageRoute.to}
                      >
                        <YoupiterButton>
                          Riordina Capitoli
                        </YoupiterButton>
                      </ReactRouterLink>
                    </div>
                  </div>
                </div>
              </div>
              {/* Fine Colonna 2 */}

            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
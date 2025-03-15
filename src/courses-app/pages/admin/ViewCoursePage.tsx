import { type AuthUser } from 'wasp/auth';
import {
  useQuery,
  getCourse
} from 'wasp/client/operations';
import { type Course } from 'wasp/entities';
import { useParams } from 'react-router';
import { useState, useEffect } from "react";
import YoupiterBreadcrumb from '../../components/YoupiterBreadcrumb';
import {
  useRedirectHomeUnlessUserIsAdmin,
  useRedirect404IfMissingParams
} from '../../services/ClientServices';
import { EditCourseBreadcrumbData } from '../../data/BreadCrumbData';
import YoupiterSidebar from '../../components/YoupiterSidebar';
import AdminSidebarData from "../../data/AdminDashboardSidebarData";

export default function ViewCoursePage({ user }: { user: AuthUser }) {

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

  return (
    <div className="grid grid-cols-12 gap-4 h-screen overflow-hidden p-4" style={{ backgroundColor: '#efefef' }}>
      {/* Left Column */}
      <div className="col-span-3 rounded-lg overflow-y-auto">

        <div className="p-4">
        <YoupiterSidebar
            sections={AdminSidebarData}
            defaultExpandedItems={{ 'Products': true }}
            onItemClick={(item) => console.log('Clicked:', item.label)}
            theme="light"
          />
        </div>

      </div>

      {/* Center Column */}
      <div className="col-span-6 rounded-lg overflow-y-auto bg-white dark:bg-gray-800 p-4">

        {courseInfo && (
        <div className="p-4">
          <YoupiterBreadcrumb items={EditCourseBreadcrumbData} />

          <figure className="mt-5">
            <img
              className="h-auto rounded-lg shadow-xl dark:shadow-gray-800"
              src={courseInfo.image}
              alt="image description"
              style={{ margin: '0 auto', maxWidth: '100px' }}
            ></img>
            <figcaption className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
              {courseInfo.shortDescription}
            </figcaption>
          </figure>

          <h1 className="text-1xl font-bold mt-5">Titolo e descrizione</h1>
          <h1 className="text-1xl font-bold mt-5">[EN] {courseInfo.title}</h1>
          <p className="text-md text-gray-500 mt-2 mb-2">{courseInfo.description}</p>
          <a href={`/admin/course/${courseInfo.id}/edit`} className="text-blue-500 text-sm">Modifica Informazioni</a>
          
          <h1 className="text-1xl font-bold mt-5">Internazionalizzazione</h1>
          <p className="text-md text-gray-500 mt-2 mb-2">Non ci sono traduzioni</p>
          <a href={`/admin/course/${courseInfo.id}/edit`} className="text-blue-500 text-sm">Modifica Informazioni</a>

          <h1 className="text-1xl font-bold mt-5">Capitoli e Lezioni</h1>
          <p className="text-md text-gray-500 mt-2">Non ci sono capitoli o lezioni</p>
          <a href={`/admin/course/${courseInfo.id}/chapters/edit`} className="text-blue-500 text-sm">Aggiungi Capitoli e Lezioni</a>

          <h1 className="text-1xl font-bold mt-5">Categorie</h1>
          <p className="text-md text-gray-500 mt-2">Assegna almeno una categoria.</p>
          <a href={`/admin/course/${courseInfo.id}/edit`} className="text-blue-500 text-sm">Setta Categorie</a>

          <h1 className="text-1xl font-bold mt-5">Istruttori</h1>
          <p className="text-md text-gray-500 mt-2">Assegna almeno una istruttore del corso.</p>
          <a href={`/admin/course/${courseInfo.id}/edit`} className="text-blue-500 text-sm">Setta Istruttori</a>

          <h1 className="text-1xl font-bold mt-5">Certificato</h1>
          <p className="text-md text-gray-500 mt-2">Non è stato creato alcun certificato per il corso</p>
          <a href={`/admin/course/${courseInfo.id}/certificate`} className="text-blue-500 text-sm">Crea Certificato</a>

          <h1 className="text-1xl font-bold mt-5">Stato</h1>
          <p className="text-md text-gray-500 mt-2">Il corso non può essere ancora pubblicato.</p>

          <h1 className="text-1xl font-bold mt-5">Statistiche</h1>
          <p className="text-md text-gray-500 mt-2">Il corso non e' pubblico.</p>


        </div>
        )}

      </div>

      {/* Right Column */}
      <div className="col-span-3 rounded-lg overflow-y-auto">

        <div className="p-4">

        </div>

      </div>
    </div>
  )
}
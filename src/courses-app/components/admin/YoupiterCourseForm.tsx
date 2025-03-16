import {
  courseCategoryList,
  useQuery,
  instructorList as getInstructorList,
} from 'wasp/client/operations';
import { UserInstructor, User } from 'wasp/entities';
import YoupiterFileUploader from '../YoupiterFileUploader';
import YoupiterMultiSelectSearch from '../YoupiterMultiSelectSearch';
import YoupiterButton from '../YoupiterButton';
import { useState, useEffect } from "react";
import { Course, CourseCategory } from 'wasp/entities';
import { renderUserDropdownItem, renderUserItem } from '../YoupiterMultiSelectSearch';

type InstructorData = {
  id: string,
  name: string,
  email: string,
  user?: Partial<User>
}
interface CourseFormProps {
  courseInfo?: Course & { categories?: [] } & { instructors?: InstructorData[] } | undefined,
  selectedCategories?: [],
  selectedInstructors?: [],
  buttonText: string,
  isCategories?: Boolean,
  isInstructors?: Boolean,
  isCover?: Boolean,
  onInfoChanged?: (course: any) => void,
  onSubmit: (course: any) => void,
  onCoverChanged? : (cover: any) => void,
  onCoverUpdateClick? : (cover: any) => void,
  onCategoriesUpdateClick? : (categories: any) => void,
  onInstructorsUpdateClick? : (instructors: any) => void,
}

type InternalCourseInfo = Partial<Course> & { cover?: File } & { categories? : Partial<CourseCategory>[] } & { instructors? : InstructorData[] };

export default function YoupiterCourseForm({
  courseInfo,
  selectedCategories,
  selectedInstructors,
  isCategories = false,
  isInstructors = false,
  isCover = false,
  buttonText,
  onInfoChanged,
  onSubmit,
  onCoverChanged = (cover) => {},
  onCoverUpdateClick = (cover) => {},
  onCategoriesUpdateClick = (categories) => {},
  onInstructorsUpdateClick = (instructors) => {},
}: CourseFormProps) {

  const [internalCourseInfo, setInternalCourseInfo] = useState<InternalCourseInfo>(courseInfo || {});
  const [selectedCourseCategories, setSelectedCourseCategories] = useState<any[]>([]);
  const [selectedCourseInstructors, setSelectedCourseInstructors] = useState<any[]>([]);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError
  } = useQuery(courseCategoryList)

  const [instructorList, setInstructorList] = useState<{ id: string, name: string, email: string }[]>([]);

  const {
    data: instructors,
    isLoading: isInstructorsLoading,
    error: instructorsError
  } = useQuery(getInstructorList)

  useEffect(() => {

    if (typeof onInfoChanged == "function") {
      onInfoChanged(internalCourseInfo)
    }

  }, [internalCourseInfo]);

  useEffect(() => {

    if (typeof courseInfo != "undefined") {
      setInternalCourseInfo(courseInfo);
    }

    if (courseInfo && courseInfo.categories) {
      setSelectedCourseCategories(courseInfo.categories);
    }
    
    if (courseInfo && courseInfo.instructors) {
      // Mappa gli istruttori nel formato richiesto da YoupiterMultiSelectSearch
      const formattedInstructors = courseInfo.instructors.map(instructor => ({
        id: String(instructor.id),
        name: instructor.user?.username || "Nome non disponibile",
        email: instructor.user?.email || ""
      }));

      setSelectedCourseInstructors(formattedInstructors);
      
      // Aggiorna anche internalCourseInfo
      setInternalCourseInfo(prev => ({ 
        ...prev!, 
        instructors: formattedInstructors,
        categories: courseInfo.categories
      }));
    }

  }, [courseInfo]);

  /* Quando la lista di tutti gli istruttori e' stata caricata */
  useEffect(() => {

    setInstructorList(instructors?.map(
      (instructor: UserInstructor & { user?: { id: string, username: string } }) =>
        ({ id: String(instructor.id), name: "Mario", email: instructor.user?.username || "" })) || [])

  }, [instructors]);

  return (
    <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
     
      <div className='flex flex-col gap-5.5 p-6.5'>
        <div>
          <label className='mb-3 block text-black dark:text-white'>Titolo *</label>
          <input
            id="title"
            name="title"
            type='text'
            value={internalCourseInfo?.title || ""}
            placeholder='Corso di Visualizzazione'
            className='w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
            onChange={(e) => {
              setInternalCourseInfo(prev => ({ ...prev!, title: e.target.value }))
            }}
          />
        </div>

        <div>
          <label className='mb-3 block text-black dark:text-white'>Breve Descrizione *</label>
          <input
            id="shortDescription"
            name="shortDescription"
            value={internalCourseInfo?.shortDescription || ""}
            type='text'
            placeholder='Impara a plasmare il tuo futuro con la visualizzazione.'
            className='w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
            onChange={(e) => {
              setInternalCourseInfo(prev => ({ ...prev!, shortDescription: e.target.value }))
            }}
          />
        </div>

        <div>
          <label className='mb-3 block text-black dark:text-white'>Descrizione del corso *</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={internalCourseInfo?.description || ""}
            placeholder='Descrizione lunga e dettagliata del corso.'
            className='w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
            onChange={(e) => {
              setInternalCourseInfo(prev => ({ ...prev!, description: e.target.value }))
            }}
          ></textarea>
        </div>

        <YoupiterButton
          onClick={() => { onSubmit(internalCourseInfo) }}
          loadingText="Creazione in corso"
        >
          {buttonText}
        </YoupiterButton>

        {isCover && (
          <div>
            <label className='mb-3 block text-black dark:text-white'>Copertina del corso</label>
            <YoupiterFileUploader
              maxFiles={1}
              acceptedFileTypes={['image/*']}
              defaultImageUrl={internalCourseInfo.image}
              onFilesChange={(files) => {
                setInternalCourseInfo(prev => ({ ...prev!, cover: files.length > 0 ? files[0] : undefined }))
                onCoverChanged(files.length > 0 ? files[0] : undefined)
              }}
            />
            <YoupiterButton
              onClick={() => { onCoverUpdateClick(internalCourseInfo.cover) }}
            >
              Setta Cover
            </YoupiterButton>
          </div>
        )}

        {isCategories && (
          <div>
            <label className='mb-3 block text-black dark:text-white'>Categorie</label>

            {isCategoriesLoading ? (
              <div className="w-full p-3 bg-gray-100 rounded-lg animate-pulse">
                Caricamento categorie...
              </div>
            ) : (
              <>
                <YoupiterMultiSelectSearch
                  items={categories!}
                  getItemId={category => String(category.id)}
                  getSearchableText={category => category.name}
                  placeholder="Ricerca categorie"
                  initialSelection={selectedCourseCategories}
                  onSelectionChange={(newSelection) => {
                    console.log('Selezione attuale:', newSelection);
                    setInternalCourseInfo(prev => ({ ...prev!, categories: newSelection }))
                  }}
                />
                <YoupiterButton
                  onClick={() => { onCategoriesUpdateClick(internalCourseInfo.categories) }}
                >
                  Aggiorna categorie
                </YoupiterButton>
              </>
            )}
          </div>
        )}

        {isInstructors && (
          <div>
            <label className='mb-3 block text-black dark:text-white'>Istruttori</label>

            {isInstructors && isInstructorsLoading ? (
              <div className="w-full p-3 bg-gray-100 rounded-lg animate-pulse">
                Caricamento istruttori...
              </div>
            ) : (
              <>
                <YoupiterMultiSelectSearch
                  items={instructorList}
                  getItemId={user => user.id}
                  getSearchableText={user => `${user.name} ${user.email}`}
                  renderSelectedItem={renderUserItem}
                  renderDropdownItem={renderUserDropdownItem}
                  placeholder="Ricerca Istruttori"
                  initialSelection={selectedCourseInstructors}
                  onSelectionChange={(newSelection) => {
                    console.log('Selezione attuale:', newSelection);
                    setInternalCourseInfo(prev => ({ ...prev!, instructors: newSelection }))
                  }}
                />
                <YoupiterButton
                  onClick={() => { onInstructorsUpdateClick(internalCourseInfo.instructors) }}
                >
                  Aggiorna istruttori
                </YoupiterButton>
              </>
            )}
          </div>
        )}

      </div>
    </div>

  )
}
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, Layout, Plus, Search, Trash } from 'lucide-react';
import { type Course } from 'wasp/entities';

interface YoupiterCourseTableProps {
    courses: Course[];
    isLoading: boolean;
    error: any;
    onDeleteCourse?: (courseId: string) => void;
    showAddButton?: boolean;
    addButtonUrl?: string;
}

export default function YoupiterCoursesTable({
    courses,
    isLoading,
    error,
    onDeleteCourse,
    showAddButton = true,
    addButtonUrl = '/admin/course'
}: YoupiterCourseTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

    useEffect(() => {
        if (courses && courses.length > 0) {
            const results = courses.filter(course => 
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (course.shortDescription && course.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredCourses(results);
        } else {
            setFilteredCourses([]);
        }
    }, [searchTerm, courses]);

    const handleDelete = (courseId: string) => {
        if (window.confirm("Sei sicuro di voler eliminare questo corso? Questa azione non può essere annullata.")) {
            if (onDeleteCourse) {
                onDeleteCourse(courseId);
            } else {
                console.log("Eliminazione corso:", courseId);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestione Corsi</h1>
                {showAddButton && (
                    <Link 
                        to={addButtonUrl} 
                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        <Plus className="size-4 mr-2" />
                        Nuovo Corso
                    </Link>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="mb-4 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="size-5 text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full pl-10 p-2.5"
                        placeholder="Cerca corsi per titolo o descrizione..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Caricamento corsi in corso...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10 text-red-600 dark:text-red-400">
                        <p>Si è verificato un errore durante il caricamento dei corsi.</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>Nessun corso trovato. {searchTerm && "Prova a modificare i criteri di ricerca."}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Immagine
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Titolo
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Descrizione
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Stato
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Azioni
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img 
                                                src={course.image || "/images/default-course.png"} 
                                                alt={course.title} 
                                                className="h-12 w-16 object-cover rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">
                                                {course.shortDescription || "Nessuna descrizione breve"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                course.isPublished 
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                            }`}>
                                                {course.isPublished ? "Pubblicato" : "Bozza"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link 
                                                    to={`/admin/course/${course.id}`} 
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    title="Visualizza corso"
                                                >
                                                    <Eye className="size-5" />
                                                </Link>
                                                <Link 
                                                    to={`/admin/course/${course.id}/edit`} 
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Modifica corso"
                                                >
                                                    <Edit className="size-5" />
                                                </Link>
                                                <Link 
                                                    to={`/admin/course/${course.id}/chapters/edit`} 
                                                    className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                                                    title="Gestisci capitoli e lezioni"
                                                >
                                                    <Layout className="size-5" />
                                                </Link>
                                                <button 
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Elimina corso"
                                                    onClick={() => handleDelete(course.id)}
                                                >
                                                    <Trash className="size-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
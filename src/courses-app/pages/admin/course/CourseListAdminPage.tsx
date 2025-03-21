import YoupiterBreadcrumb from '../../../components/YoupiterBreadcrumb';
import { type AuthUser } from 'wasp/auth';
import { useRedirectHomeUnlessUserIsAdmin } from '../../../services/ClientServices';
import { Home, Layout } from 'lucide-react';
import YoupiterSidebar from '../../../components/YoupiterSidebar';
import AdminSidebarData from "../../../data/AdminDashboardSidebarData";
import { useQuery, getCourseList } from 'wasp/client/operations';
import YoupiterCourseTable from '../../../components/admin/YoupiterCoursesTable';

export default function CourseListAdminPage({ user }: { user: AuthUser }) {
    useRedirectHomeUnlessUserIsAdmin({ user });

    const breadcrumbItems = [
        {
            label: 'Admin Dashboard',
            href: '/admin',
            icon: <Home className="shrink-0 me-3 size-4" />
        },
        {
            label: 'Courses',
            href: '#',
            icon: <Layout className="shrink-0 me-3 size-4" />
        }
    ];

    const {
        data: courses,
        isLoading,
        error
    } = useQuery(getCourseList);

    const handleDeleteCourse = (courseId: string) => {
        // Implementare la logica di eliminazione corso
        console.log("Eliminazione corso:", courseId);
        // Dopo l'eliminazione, la query si aggiornerà automaticamente
    };

    return (
        <div>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
                <div className="flex">
                    
                    <div className="flex-1 p-8 pt-0">
                        <YoupiterSidebar
                            sections={AdminSidebarData}
                            defaultExpandedItems={{ 'Corsi': true }}
                            onItemClick={(item) => console.log('Clicked:', item.label)}
                            theme="light"
                        /></div>

                    <div className="flex-1 p-8 pt-0">
                        <YoupiterBreadcrumb items={breadcrumbItems} />

                        <div className="mt-8">
                            <YoupiterCourseTable
                                courses={courses || []}
                                isLoading={isLoading}
                                error={error}
                                onDeleteCourse={handleDeleteCourse}
                                showAddButton={true}
                                addButtonUrl="/admin/course"
                            />
                        </div>
                    </div>

                    <div className="flex-1 p-8 pt-0">
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
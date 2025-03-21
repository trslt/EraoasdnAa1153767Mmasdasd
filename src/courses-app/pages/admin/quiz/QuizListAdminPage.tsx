import YoupiterBreadcrumb from '../../../components/YoupiterBreadcrumb';
import { useNavigate } from 'react-router-dom';
import YoupiterCourseForm from '../../../components/admin/YoupiterCourseForm';
import { type AuthUser } from 'wasp/auth';
import { useRedirectHomeUnlessUserIsAdmin } from '../../../services/ClientServices';
import { Course } from 'wasp/entities';
import { useState } from 'react';
import { createCourse } from '../../../services/client/CourseServices';
import YoupiterSidebar from '../../../components/YoupiterSidebar';
import AdminSidebarData from "../../../data/AdminDashboardSidebarData";
import { Home, Layout } from 'lucide-react';

export default function BadgeListAdminPage({ user }: { user: AuthUser }) {

  useRedirectHomeUnlessUserIsAdmin({ user });

  const breadcrumbItems = [
    {
      label: 'Admin Dashboard',
      href: '/admin',
      icon: <Home className="shrink-0 me-3 size-4" />
    },
    {
      label: 'Courses',
      href: '/admin/courses',
      icon: <Layout className="shrink-0 me-3 size-4" />
    },
    {
      label: 'Create Course',
      href: '#',
      icon: <Layout className="shrink-0 me-3 size-4" />
    }
  ];

  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (courseData: Course) => {

    setError(null);
    setIsSubmitting(true);

    try {
      const course = await createCourse(courseData);
      if (course) {
        navigate(`/admin/course/${course.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si è verificato un errore durante la creazione del corso');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      Quiz List
    </div>
  )
}
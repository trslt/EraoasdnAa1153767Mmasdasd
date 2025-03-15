import {
    Home,
    TestTubeDiagonal,
    GraduationCap,
    Award,
    Trophy,
    UserRoundPen,
    Users,
    FileText,
    DollarSign,
    BarChart2,
    MessageSquare,
    Tag as TagIcon,
    Settings,
    Code,
    AlertCircle
} from 'lucide-react';
import { SidebarSection } from '../components/YoupiterSidebar';

const AdminSidebarData: SidebarSection[] = [
    {
        items: [
            { icon: <Home size={20} />, label: 'Dashboard', href: '/admin' },
            {
                icon: <GraduationCap size={20} />,
                label: 'Corsi',
                expandable: true,
                active: false,
                href: '/admin/courses',
                items: [
                    { label: 'Crea Corso', href: '/admin/course' },
                    { label: 'Tutti i Corsi', href: '/admin/courses' },
                    { label: 'Crea Categoria', href: '/admin/course/category' },
                    { label: 'Tutte le Categorie', href: '/admin/course/categories' },
                    { label: 'Crea Skill', href: '/admin/course/category' },
                    { label: 'Tutte le Skill', href: '/admin/course/categories' },
                ]
            },
            {
                icon: <Award size={20} />,
                label: 'Certificati',
                expandable: true,
                active: false,
                href: '/admin/certificates',
                items: [
                    { label: 'Aggiungi Certificato', href: '/admin/certificate' },
                    { label: 'Tutti i Certificati', href: '/admin/certificates' },
                ]
            },
            {
                icon: <Trophy size={20} />,
                label: 'Badge',
                expandable: true,
                active: false,
                href: '/admin/badges',
                items: [
                    { label: 'Aggiungi Badge', href: '/admin/badge' },
                    { label: 'Tutti i Badges', href: '/admin/badges' },
                ]
            },
            {
                icon: <TestTubeDiagonal size={20} />,
                label: 'Quiz',
                expandable: true,
                active: false,
                href: '/admin/quizzes',
                items: [
                    { label: 'Aggiungi Quiz', href: '/admin/quiz' },
                    { label: 'Tutti i Quiz', href: '/admin/quizzes' },
                ]
            },
            {
                icon: <UserRoundPen size={20} />,
                label: 'Istruttori',
                expandable: true,
                active: false,
                href: '/admin/instructors',
                items: [
                    { label: 'Aggiungi Istruttore', href: '/admin/instructor' },
                    { label: 'Tutti Gli Istruttori', href: '/admin/instructors' },
                ]
            },
            { icon: <Users size={20} />, label: 'Studenti', href: '/admin/students' },
            
        ]
    },
   
];

export default AdminSidebarData;
import './Main.css';
import NavBar from './components/NavBar/NavBar';
import { appNavigationItems } from './components/NavBar/contentSections';
import { landingPageNavigationItems } from '../landing-page/contentSections';
import { useMemo, useEffect } from 'react';
import { routes } from 'wasp/client/router';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { useIsLandingPage } from './hooks/useIsLandingPage';
import { updateCurrentUser } from 'wasp/client/operations';
import { App as KonstaApp, Page, Navbar, Block, KonstaProvider } from 'konsta/react';
import StudentTabbar from '../courses-app/components/app/student/StudentTabbar';
import LessonPlayerTabbar from '../courses-app/components/app/course/LessonPlayerTabbar';
/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export default function App() {
  const location = useLocation();
  const { data: user } = useAuth();
  const isLandingPage = useIsLandingPage();
  const navigationItems = isLandingPage ? landingPageNavigationItems : appNavigationItems;

  const shouldDisplayAppNavBar = useMemo(() => {
    return location.pathname !== routes.LoginRoute.build() && location.pathname !== routes.SignupRoute.build();
  }, [location]);

  const isAdminDashboard = useMemo(() => {
    return location.pathname.startsWith('/admin');
  }, [location]);

  const isCourseApp = useMemo(() => {
    return location.pathname.startsWith('/app');
  }, [location]);

  const isAuthPath = useMemo(() => {
    return location.pathname.startsWith('/app/auth');
  }, [location]);

  const isPlayerPath = useMemo(() => {
    return location.pathname.startsWith('/app/play');
  }, [location]);

  useEffect(() => {
    if (user) {
      const lastSeenAt = new Date(user.lastActiveTimestamp);
      const today = new Date();
      if (today.getTime() - lastSeenAt.getTime() > 5 * 60 * 1000) {
        updateCurrentUser({ lastActiveTimestamp: today });
      }
    }
  }, [user]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
  }, [location]);

  const displayNavbar = false;

  return (
    <>
      {isCourseApp ? (
        <KonstaProvider theme="material" dark={true}>
          <KonstaApp safeAreas theme="material" dark={true}>
            <Page>
              <Outlet />
              {!isAuthPath && !isPlayerPath && (
                <StudentTabbar />
              )}
              {!isAuthPath && isPlayerPath && (
                <LessonPlayerTabbar />
              )}
            </Page>
          </KonstaApp>
        </KonstaProvider>
      ) : (
        <div className='min-h-screen dark:text-white dark:bg-boxdark-2'>
          {isAdminDashboard ? (
            <Outlet />
          ) : (
            <>
              {displayNavbar && shouldDisplayAppNavBar && <NavBar navigationItems={navigationItems} />}
              {/* <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'> */}
              <Outlet />
              {/* </div> */}
            </>
          )}
        </div>
      )}
    </>
  );
}

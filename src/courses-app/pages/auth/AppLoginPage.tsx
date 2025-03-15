import React, { useEffect } from 'react';
import {
  Page,
  BlockTitle,
} from 'konsta/react';
import { LoginForm } from 'wasp/client/auth';
import { AuthPageLayout } from '../../../auth/AuthPageLayout';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { useAuth } from 'wasp/client/auth'
import { useNavigate } from 'react-router-dom'

export default function AppLoginPage() {

  const { data: user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  // Se l'utente è autenticato, puoi renderizzare un loader o null
  // ma la navigazione avverrà nell'useEffect, non durante il rendering
  if (user) {
    return null; // o un componente di caricamento
  }

  return (
    <Page>
      <AuthPageLayout>
        <LoginForm
          logo='https://i.ibb.co/Kzz8zFHN/6c196310-9a39-4a66-91a4-fb447cfbe1d0.jpg'
        />
        <br />
        <span className='text-sm font-medium text-gray-900 dark:text-gray-900'>
          Don't have an account yet?{' '}
          <WaspRouterLink to={routes.AppSignupPageRoute.to} className='underline'>
            go to signup
          </WaspRouterLink>
          .
        </span>
        <br />
        <span className='text-sm font-medium text-gray-900'>
          Forgot your password?{' '}
          <WaspRouterLink to={routes.AppAskPasswordResetPageRoute.to} className='underline'>
            reset it
          </WaspRouterLink>
        </span>
      </AuthPageLayout>
    </Page>
  );
}




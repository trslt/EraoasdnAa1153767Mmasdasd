import React from 'react';
import {
  Page,
} from 'konsta/react';
import { SignupForm } from 'wasp/client/auth';
import { AuthPageLayout } from '../../../auth/AuthPageLayout';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';

export default function AppSignupPage() {

  return (
    <Page>
      <AuthPageLayout>
        <SignupForm />
        <br />
        <span className='text-sm font-medium text-gray-900'>
          I already have an account (
          <WaspRouterLink to={routes.AppLoginPageRoute.to} className='underline'>
            go to login
          </WaspRouterLink>
          ).
        </span>
        <br />
      </AuthPageLayout>
    </Page>
  );
}




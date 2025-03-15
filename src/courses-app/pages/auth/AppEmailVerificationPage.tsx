import React from 'react';
import {
  Page,
} from 'konsta/react';
import { AuthPageLayout } from '../../../auth/AuthPageLayout';
import { VerifyEmailForm } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';

export default function AppEmailVerificationPage() {

  return (
    <Page>
      <AuthPageLayout>
        <VerifyEmailForm />
        <br />
        <span className='text-sm font-medium text-gray-900'>
          If everything is okay, <WaspRouterLink to={routes.AppLoginPageRoute.to} className='underline'>go to login</WaspRouterLink>
        </span>
      </AuthPageLayout>
    </Page>
  );
}




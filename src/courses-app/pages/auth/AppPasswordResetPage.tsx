import React from 'react';
import {
  Page
} from 'konsta/react';
import { ResetPasswordForm } from 'wasp/client/auth';
import { AuthPageLayout } from '../../../auth/AuthPageLayout';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';

export default function AppPasswordResetPage() {

  return (
    <Page>
      <AuthPageLayout>
        <ResetPasswordForm />
        <br />
        <span className='text-sm font-medium text-gray-900'>
          If everything is okay, <WaspRouterLink to={routes.LoginRoute.to}>go to login</WaspRouterLink>
        </span>
      </AuthPageLayout>
    </Page>
  );
}




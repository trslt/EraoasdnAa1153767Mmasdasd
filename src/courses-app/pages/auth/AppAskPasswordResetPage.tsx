import React from 'react';
import {
  Page,
  BlockTitle,
} from 'konsta/react';
import { ForgotPasswordForm } from 'wasp/client/auth';
import { AuthPageLayout } from '../../../auth/AuthPageLayout';

export default function AppAskPasswordResetPage() {

  return (
    <Page>
      <AuthPageLayout>
        <ForgotPasswordForm />
      </AuthPageLayout>
    </Page>
  );
}




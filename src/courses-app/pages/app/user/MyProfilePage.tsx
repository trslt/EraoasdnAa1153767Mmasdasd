import React from 'react';
import {
  Page,
  BlockTitle,
} from 'konsta/react';
import StudentTabbar from '../../../components/app/student/StudentTabbar';

export default function MyProfilePage() {

  return (
    <Page>

      <BlockTitle withBlock={false}>MyProfilePage - // TODO</BlockTitle>

      <StudentTabbar />
    </Page>
  );
}




import React from 'react';
import {
  Page,
  BlockTitle,
} from 'konsta/react';
import StudentTabbar from '../../../components/app/student/StudentTabbar';

export default function InstructorPage() {

  return (
    <Page>

      <BlockTitle withBlock={false}>AppInstructorPage - // TODO</BlockTitle>

      <StudentTabbar />
    </Page>
  );
}
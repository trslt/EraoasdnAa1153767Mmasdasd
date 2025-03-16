import React from 'react';
import {
  Card,
  Preloader,
  Block,
  Navbar,
  Button,
} from 'konsta/react';
import { courseList, useQuery } from 'wasp/client/operations';
import { Course } from 'wasp/entities';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CourseListAppPage() {

  const { data: coursesData, isLoading, error } = useQuery(courseList);

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (coursesData) {
      setCourses(coursesData);
    }
  }, [coursesData]);

  const navigate = useNavigate();

  const redirectToCourse = (courseId: string) => {
    navigate(`/app/course/${courseId}`);
    return null;
  };

  const FeaturedCourseCard = ({ course }: { course: Course }) => {
    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg rounded-xl overflow-hidden">
        <div className="relative">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-40 object-cover mix-blend-overlay opacity-80"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
            <h3 className="text-xl font-bold mb-1">{course.title}</h3>
            <p className="text-sm mb-3 opacity-90">{course.description}</p>
            <Button className="bg-white text-blue-600 font-medium rounded-lg"
              onClick={() => redirectToCourse(course.id)}
            >
              Esplora
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const CourseCard = ({ course }: { course: Course }) => {
    return (
      <Card className="mb-4 bg-white shadow-md rounded-xl overflow-hidden">
        <div className="relative">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-36 object-cover"
          />
          {!course.isPublished && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded-md">
              "In lavorazione"
            </span>
          )}
        </div>
  
        <h3 className="text-lg font-bold text-gray-800 mb-1">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{course.description}</p>
        <div className="flex items-center justify-between">
          <Button className="bg-blue-500 text-white text-sm rounded-lg"
           onClick={() => redirectToCourse(course.id)}>
            Scopri
          </Button>
          <div className="flex items-center space-x-1">
  
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <Navbar title="Scopri i Corsi" />
      <Block className="px-4 py-2 mb-20">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Cerca corsi..."
            className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Preloader size="large" color="blue" />
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-3">In Evidenza</h2>
            {courses && courses.length > 0 && <FeaturedCourseCard course={courses[0]} />}

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-800">Tutti i Corsi</h2>
              <Button className="text-blue-500 text-sm" inline>Vedi tutti</Button>
            </div>

            <div className="grid gap-4">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}
      </Block>
    </>
  );
}
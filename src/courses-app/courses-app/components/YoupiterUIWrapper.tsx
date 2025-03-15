import React from 'react';

export default function YoupiterUIWrapper() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        
        
        <div className="flex-1 ml-64 p-8">
          {/* <Header user={user} /> */}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <div className="space-y-8">
              {/* {projects.slice(0, 2).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))} */}
            </div>
            
            <div>
              {/* <TaskList tasks={tasks} /> */}
            </div>
            
            <div>
              {/* <MessageList messages={messages} /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


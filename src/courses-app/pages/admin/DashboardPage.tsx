import YoupiterBreadcrumb from '../../components/YoupiterBreadcrumb';
import { type AuthUser } from 'wasp/auth';
import { useRedirectHomeUnlessUserIsAdmin } from '../../services/ClientServices';
import YoupiterSidebar from '../../components/YoupiterSidebar';
import AdminSidebarData from "../../data/AdminDashboardSidebarData";
import { DashboardBreadcrumbData } from "../../data/BreadCrumbData";

export default function DashboardPage({ user }: { user: AuthUser }) {

  useRedirectHomeUnlessUserIsAdmin({ user });

  return (
    <div>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
        <div className="flex">
          <YoupiterSidebar
            sections={AdminSidebarData}
            defaultExpandedItems={{ 'Products': true }}
            onItemClick={(item) => console.log('Clicked:', item.label)}
            theme="light"
          />

          <div className="flex-1 ml-64 p-8 pt-0">

            <YoupiterBreadcrumb items={DashboardBreadcrumbData}></YoupiterBreadcrumb>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-5">

              {/* Inizio Colonna 1 */}
              <div className="space-y-8">
                <div className='flex flex-col gap-1'>

                  

                

                </div>
              </div>
              {/* Fine Colonna 1 */}

              {/* Inizio Colonna 2 */}
              <div className="space-y-8">
                <div className='flex flex-col gap-1'>



                </div>
              </div>
              {/* Fine Colonna 2 */}

            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
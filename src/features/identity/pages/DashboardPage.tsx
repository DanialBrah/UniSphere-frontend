import { DashboardLayout }  from '../../../components/layout/DashboardLayout'
import { DashboardHeader }  from '../components/dashboard/DashboardHeader'
import { StatsRow }         from '../components/dashboard/StatsRow'
import { FeaturesSection }  from '../components/dashboard/FeaturesSection'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <DashboardHeader />
        <StatsRow />
        <FeaturesSection />
      </div>
    </DashboardLayout>
  )
}

import { Navbar }       from '../../../components/layout/Navbar'
import { Footer }       from '../../../components/layout/Footer'
import { HeroSection }  from '../components/HeroSection'
import { FeaturesGrid } from '../components/FeaturesGrid'
import { WhoItsFor }    from '../components/WhoItsFor'
import { Highlights }   from '../components/Highlights'
import { CtaBanner }    from '../components/CtaBanner'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0A1A]">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <WhoItsFor />
        <Highlights />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}

import useLenis from './hooks/useLenis'
import Spotlight from './components/ui/Spotlight'
import SplashCursor from './components/ui/SplashCursor'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HeroExperience from './components/sections/HeroExperience'
import ProductJourney from './components/sections/ProductJourney'
import InternshipGenerator from './components/sections/InternshipGenerator'
import LivingAICompany from './components/sections/LivingAICompany'
import ProjectExecution from './components/sections/ProjectExecution'
import AIEvaluationEngine from './components/sections/AIEvaluationEngine'
import SkillEvolution from './components/sections/SkillEvolution'
import InterviewSimulator from './components/sections/InterviewSimulator'
import CertificateReveal from './components/sections/CertificateReveal'
import RecruiterExperience from './components/sections/RecruiterExperience'
import BentoShowcase from './components/sections/BentoShowcase'
import FinalCTA from './components/sections/FinalCTA'

export default function App() {
  useLenis()

  return (
    <div className="relative min-h-screen bg-void text-text">
      <SplashCursor />
      <Spotlight />
      <Navbar />
      <main className="relative z-[2]">
        <HeroExperience />
        <ProductJourney />
        <InternshipGenerator />
        <LivingAICompany />
        <ProjectExecution />
        <AIEvaluationEngine />
        <SkillEvolution />
        <InterviewSimulator />
        <CertificateReveal />
        <RecruiterExperience />
        <BentoShowcase />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

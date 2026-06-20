import useLenis from './hooks/useLenis'
import Spotlight from './components/ui/Spotlight'
import SplashCursor from './components/ui/SplashCursor'
import MatrixRain from './components/ui/MatrixRain'
import LiquidGlass from './components/ui/LiquidGlass'
import FadeInView from './components/ui/FadeInView'
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
    <div className="relative min-h-screen bg-void text-text overflow-x-hidden">
      {/* Background/Futuristic Canvas and Glow layers */}
      <LiquidGlass />
      <MatrixRain />
      <SplashCursor />
      <Spotlight />
      
      <Navbar />
      <main className="relative z-[2]">
        <HeroExperience />
        <FadeInView direction="up"><ProductJourney /></FadeInView>
        <FadeInView direction="up"><InternshipGenerator /></FadeInView>
        <FadeInView direction="up"><LivingAICompany /></FadeInView>
        <FadeInView direction="up"><ProjectExecution /></FadeInView>
        <FadeInView direction="up"><AIEvaluationEngine /></FadeInView>
        <FadeInView direction="up"><SkillEvolution /></FadeInView>
        <FadeInView direction="up"><InterviewSimulator /></FadeInView>
        <FadeInView direction="up"><CertificateReveal /></FadeInView>
        <FadeInView direction="up"><RecruiterExperience /></FadeInView>
        <FadeInView direction="up"><BentoShowcase /></FadeInView>
        <FadeInView direction="up"><FinalCTA /></FadeInView>
        <Footer />
      </main>
    </div>
  )
}

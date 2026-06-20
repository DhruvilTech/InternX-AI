import HeroExperience from '../components/sections/HeroExperience'
import ProductJourney from '../components/sections/ProductJourney'
import InternshipGenerator from '../components/sections/InternshipGenerator'
import LivingAICompany from '../components/sections/LivingAICompany'
import ProjectExecution from '../components/sections/ProjectExecution'
import AIEvaluationEngine from '../components/sections/AIEvaluationEngine'
import SkillEvolution from '../components/sections/SkillEvolution'
import InterviewSimulator from '../components/sections/InterviewSimulator'
import CertificateReveal from '../components/sections/CertificateReveal'
import RecruiterExperience from '../components/sections/RecruiterExperience'
import BentoShowcase from '../components/sections/BentoShowcase'
import FinalCTA from '../components/sections/FinalCTA'
import FadeInView from '../components/ui/FadeInView'

export default function LandingPage() {
  return (
    <div className="space-y-0">
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
    </div>
  )
}

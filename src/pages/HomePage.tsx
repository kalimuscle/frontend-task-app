import { ArchitectureSection } from '../components/home/ArchitectureSection'
import { ChallengeSection } from '../components/home/ChallengeSection'
import { ContextSection } from '../components/home/ContextSection'
import { HeroSection } from '../components/home/HeroSection'
import { usePageTitle } from '../hooks/usePageTitle'

export function HomePage() {
  usePageTitle('Gestión de tareas | Prueba técnica')

  return (
    <main id="contenido" tabIndex={-1}>
      <HeroSection />
      <ContextSection />
      <ArchitectureSection />
      <ChallengeSection />
    </main>
  )
}

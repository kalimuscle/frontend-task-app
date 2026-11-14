import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ScrollManager } from './components/layout/ScrollManager'
import { SiteLayout } from './components/layout/SiteLayout'
import { AiUsagePage } from './pages/AiUsagePage'
import { CandidatePage } from './pages/CandidatePage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { TechStackPage } from './pages/TechStackPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tech-stack" element={<TechStackPage />} />
          <Route path="uso-de-la-ia" element={<AiUsagePage />} />
          <Route path="candidato" element={<CandidatePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

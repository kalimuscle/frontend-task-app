import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastViewport } from './components/notifications/ToastViewport'
import { ScrollManager } from './components/layout/ScrollManager'
import { SiteLayout } from './components/layout/SiteLayout'
import { AuthDialog } from './features/auth/AuthDialog'
import { AuthDialogProvider } from './features/auth/AuthDialogProvider'
import { queryClient } from './lib/query-client'
import { AiUsagePage } from './pages/AiUsagePage'
import { CandidatePage } from './pages/CandidatePage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { TechStackPage } from './pages/TechStackPage'
import './App.css'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthDialogProvider>
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
          <AuthDialog />
          <ToastViewport />
        </AuthDialogProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

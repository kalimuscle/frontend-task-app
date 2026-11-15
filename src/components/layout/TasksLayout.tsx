import type { ReactNode } from 'react'
import { HomeFooter } from '../home/HomeFooter'
import { TasksHeader } from '../tasks/TasksHeader'

export function TasksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <TasksHeader />
      {children}
      <HomeFooter showTopLink={false} />
    </>
  )
}

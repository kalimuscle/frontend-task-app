import { Outlet } from 'react-router-dom'
import { HomeFooter } from '../home/HomeFooter'
import { HomeHeader } from '../home/HomeHeader'

export function SiteLayout() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <HomeHeader />
      <Outlet />
      <HomeFooter />
    </>
  )
}

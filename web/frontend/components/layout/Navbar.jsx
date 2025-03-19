import { NavMenu } from '@shopify/app-bridge-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const { t } = useTranslation()
  return (
    <NavMenu>
      <Link to="/" rel="home">
        {t('NavigationMenu.dashboard')}
      </Link>
      {/* <a href="/analytics">{t('NavigationMenu.analytics')}</a> */}
      <Link to="/settings">{t('NavigationMenu.settings')}</Link>
      {/* <a href="/support">{t('NavigationMenu.support')}</a> */}
    </NavMenu>
  )
}

export default Navbar

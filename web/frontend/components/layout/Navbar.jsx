import { NavMenu } from '@shopify/app-bridge-react'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
  const { t } = useTranslation()
  return (
    <NavMenu>
      <a href="/" rel="home">
        {t('NavigationMenu.dashboard')}
      </a>
      <a href="/analytics">{t('NavigationMenu.analytics')}</a>
      <a href="/settings">{t('NavigationMenu.settings')}</a>
      <a href="/support">{t('NavigationMenu.support')}</a>
    </NavMenu>
  )
}

export default Navbar

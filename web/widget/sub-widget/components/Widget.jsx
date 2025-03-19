import { useElementSize } from '../../shared/hooks/useElementSize'
import Layout from './layout/Layout'
import { $WidgetContainer } from './Widget.styled'

const Widget = ({ widgetSettings }) => {
  const { theme } = widgetSettings

  const { elementRef, width: widgetContainerWidth } = useElementSize()

  return (
    <Layout>
      <$WidgetContainer ref={elementRef} $textColor={theme.txt_color}>
        <h2>This is an example of a widget</h2>
        <p>It is a sub-widget</p>
      </$WidgetContainer>
    </Layout>
  )
}

export default Widget

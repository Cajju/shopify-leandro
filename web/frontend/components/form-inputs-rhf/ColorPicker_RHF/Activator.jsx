import { $ActivatorWrap, $Activator } from './Activator.styled'

const Activator = ({ hexColor, onColorPickerToggle }) => (
  <$ActivatorWrap>
    <$Activator onClick={onColorPickerToggle} $selectedColor={hexColor}></$Activator>
  </$ActivatorWrap>
)

export default Activator

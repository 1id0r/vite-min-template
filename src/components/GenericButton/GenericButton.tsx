import { type ComponentType } from 'react'
import type { IconProps } from '@tabler/icons-react'
import { Button, type ButtonProps } from 'antd'

export type ButtonVariant = 'filled' | 'outlined' | 'link'
export type ButtonType = 'textWithIcon' | 'iconOnly' | 'textOnly'

export interface GenericButtonProps extends Omit<ButtonProps, 'type' | 'icon' | 'iconPosition'> {
  variant?: ButtonVariant
  buttonType?: ButtonType
  text?: string
  icon?: ComponentType<IconProps>
  iconSize?: number
  iconPosition?: 'left' | 'right'
}

export function GenericButton({
  variant = 'filled',
  buttonType = 'textWithIcon',
  text,
  icon: Icon,
  iconSize = 18,
  iconPosition = 'left',
  disabled,
  ...props
}: GenericButtonProps) {
  // Map variant to Ant Design Button type
  const getAntdType = (): ButtonProps['type'] => {
    switch (variant) {
      case 'filled':
        return 'primary'
      case 'outlined':
        return 'default'
      case 'link':
        return 'link'
      default:
        return 'primary'
    }
  }

  // Determine if we should show text
  const showText = buttonType !== 'iconOnly'

  // Prepare icon element
  const iconElement = Icon ? <Icon size={iconSize} stroke={2} style={{ marginTop: 4 }} /> : undefined

  return (
    <Button
      type={getAntdType()}
      icon={buttonType !== 'textOnly' ? iconElement : undefined}
      iconPosition={iconPosition === 'right' ? 'end' : 'start'}
      disabled={disabled}
      {...props}
    >
      {showText && text}
    </Button>
  )
}

import { type ButtonHTMLAttributes, type ComponentType } from 'react'
import type { IconProps } from '@tabler/icons-react'
import styles from './GenericButton.module.css'

export type ButtonVariant = 'filled' | 'outlined' | 'link'
export type ButtonType = 'textWithIcon' | 'iconOnly' | 'textOnly'

export interface GenericButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant
  buttonType?: ButtonType
  text?: string
  icon?: ComponentType<IconProps>
  iconSize?: number
  iconPosition?: 'left' | 'right'
  className?: string
  htmlType?: 'button' | 'submit' | 'reset'
}

export function GenericButton({
  variant = 'filled',
  buttonType = 'textWithIcon',
  text,
  icon: Icon,
  iconSize = 18,
  iconPosition = 'left',
  className = '',
  htmlType = 'button',
  disabled,
  ...props
}: GenericButtonProps) {
  const buttonClasses = [styles.button, styles[variant], styles[buttonType], disabled ? styles.disabled : '', className]
    .filter(Boolean)
    .join(' ')

  const renderIcon = () => {
    if (!Icon || buttonType === 'textOnly') return null
    return <Icon size={iconSize} stroke={2} />
  }

  const renderContent = () => {
    if (buttonType === 'iconOnly') {
      return renderIcon()
    }

    if (buttonType === 'textOnly') {
      return <span className={styles.text}>{text}</span>
    }

    // textWithIcon
    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        <span className={styles.text}>{text}</span>
        {iconPosition === 'right' && renderIcon()}
      </>
    )
  }

  return (
    <button type={htmlType} className={buttonClasses} disabled={disabled} {...props}>
      {renderContent()}
    </button>
  )
}

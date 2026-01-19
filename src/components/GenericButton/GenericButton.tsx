/**
 * GenericButton - A versatile button component with multiple variants
 *
 * Variants:
 * - filled: Blue background (#001BB3), white text/icon
 * - outlined: White background, blue border and text/icon
 * - link: No border, transparent background, primer blue text/icon
 *
 * Types:
 * - textWithIcon: Shows both text and icon
 * - iconOnly: Shows only the icon
 * - textOnly: Shows only text
 */

import { memo, type ButtonHTMLAttributes, type ComponentType } from 'react'
import type { IconProps } from '@tabler/icons-react'
import styles from './GenericButton.module.css'

export type ButtonVariant = 'filled' | 'outlined' | 'link'
export type ButtonType = 'textWithIcon' | 'iconOnly' | 'textOnly'

export interface GenericButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** The visual variant of the button */
  variant?: ButtonVariant
  /** The type of content to display */
  buttonType?: ButtonType
  /** The text to display (for textWithIcon and textOnly types) */
  text?: string
  /** Tabler icon component to display */
  icon?: ComponentType<IconProps>
  /** Icon size in pixels */
  iconSize?: number
  /** Icon position relative to text */
  iconPosition?: 'left' | 'right'
  /** Additional class name */
  className?: string
  /** HTML button type attribute */
  htmlType?: 'button' | 'submit' | 'reset'
}

export const GenericButton = memo(function GenericButton({
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
})

GenericButton.displayName = 'GenericButton'

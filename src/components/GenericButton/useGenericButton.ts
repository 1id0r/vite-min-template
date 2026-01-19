/**
 * useGenericButton Hook
 *
 * A hook that provides button props generators for consistent button styling
 * across your application. Can be used with GenericButton or applied to any element.
 */

import type { ComponentType } from 'react'
import type { IconProps } from '@tabler/icons-react'
import type { GenericButtonProps, ButtonVariant, ButtonType } from './GenericButton'

interface UseGenericButtonOptions {
  /** Default variant for all buttons created with this hook */
  defaultVariant?: ButtonVariant
  /** Default icon size */
  defaultIconSize?: number
  /** Default icon position */
  defaultIconPosition?: 'left' | 'right'
}

interface ButtonConfig {
  text?: string
  icon?: ComponentType<IconProps>
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function useGenericButton(options: UseGenericButtonOptions = {}) {
  const {
    defaultVariant = 'filled',
    defaultIconSize = 18,
    defaultIconPosition = 'left',
  } = options

  /**
   * Create props for a filled button with text and icon
   */
  const filledWithIcon = (config: ButtonConfig): GenericButtonProps => ({
    variant: 'filled',
    buttonType: 'textWithIcon',
    text: config.text,
    icon: config.icon,
    iconSize: defaultIconSize,
    iconPosition: defaultIconPosition,
    onClick: config.onClick,
    disabled: config.disabled,
    className: config.className,
  })

  /**
   * Create props for an outlined button with text and icon
   */
  const outlinedWithIcon = (config: ButtonConfig): GenericButtonProps => ({
    variant: 'outlined',
    buttonType: 'textWithIcon',
    text: config.text,
    icon: config.icon,
    iconSize: defaultIconSize,
    iconPosition: defaultIconPosition,
    onClick: config.onClick,
    disabled: config.disabled,
    className: config.className,
  })

  /**
   * Create props for a filled icon-only button
   */
  const filledIconOnly = (config: Omit<ButtonConfig, 'text'>): GenericButtonProps => ({
    variant: 'filled',
    buttonType: 'iconOnly',
    icon: config.icon,
    iconSize: defaultIconSize,
    onClick: config.onClick,
    disabled: config.disabled,
    className: config.className,
  })

  /**
   * Create props for an outlined icon-only button
   */
  const outlinedIconOnly = (config: Omit<ButtonConfig, 'text'>): GenericButtonProps => ({
    variant: 'outlined',
    buttonType: 'iconOnly',
    icon: config.icon,
    iconSize: defaultIconSize,
    onClick: config.onClick,
    disabled: config.disabled,
    className: config.className,
  })

  /**
   * Create props for a filled text-only button
   */
  const filledTextOnly = (config: Omit<ButtonConfig, 'icon'>): GenericButtonProps => ({
    variant: 'filled',
    buttonType: 'textOnly',
    text: config.text,
    onClick: config.onClick,
    disabled: config.disabled,
    className: config.className,
  })

  /**
   * Create props for an outlined text-only button
   */
  const outlinedTextOnly = (config: Omit<ButtonConfig, 'icon'>): GenericButtonProps => ({
    variant: 'outlined',
    buttonType: 'textOnly',
    text: config.text,
    onClick: config.onClick,
    disabled: config.disabled,
    className: config.className,
  })

  /**
   * Generic button props creator
   */
  const createButton = (
    variant: ButtonVariant,
    buttonType: ButtonType,
    config: ButtonConfig
  ): GenericButtonProps => ({
    variant,
    buttonType,
    text: config.text,
    icon: config.icon,
    iconSize: defaultIconSize,
    iconPosition: defaultIconPosition,
    onClick: config.onClick,
    disabled: config.disabled,
    className: config.className,
  })

  return {
    // Quick creators
    filledWithIcon,
    outlinedWithIcon,
    filledIconOnly,
    outlinedIconOnly,
    filledTextOnly,
    outlinedTextOnly,
    // Generic creator
    createButton,
    // Defaults
    defaultVariant,
    defaultIconSize,
    defaultIconPosition,
  }
}

export type { UseGenericButtonOptions, ButtonConfig }

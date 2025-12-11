/**
 * @dealicious/design-system-react 타입 선언
 * 실제 패키지가 설치되지 않은 환경에서 TypeScript 에러를 방지하기 위한 타입 정의
 */

declare module '@dealicious/design-system-react/src/components/ssm-button' {
  import { FC, ReactNode, CSSProperties, MouseEventHandler } from 'react';

  export interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'custom';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const Button: FC<ButtonProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-chip' {
  import { FC, ReactNode, CSSProperties, MouseEventHandler } from 'react';

  export interface ChipProps {
    variant?: 'filled' | 'outlined' | 'custom';
    size?: 'small' | 'medium' | 'large';
    selected?: boolean;
    onClick?: MouseEventHandler<HTMLDivElement>;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const Chip: FC<ChipProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-tag' {
  import { FC, ReactNode, CSSProperties } from 'react';

  export interface TagProps {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outlined' | 'custom';
    size?: 'small' | 'medium' | 'large';
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const Tag: FC<TagProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-text' {
  import { FC, ReactNode, CSSProperties } from 'react';

  export interface TextProps {
    variant?: 'heading' | 'body' | 'caption' | 'label';
    size?: 'small' | 'medium' | 'large';
    color?: string;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const Text: FC<TextProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-icon' {
  import { FC, CSSProperties } from 'react';

  export interface IconProps {
    name: string;
    size?: 'small' | 'medium' | 'large' | number;
    color?: string;
    style?: CSSProperties;
    className?: string;
  }

  export const Icon: FC<IconProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-input' {
  import { FC, CSSProperties, ChangeEventHandler } from 'react';

  export interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    style?: CSSProperties;
    className?: string;
  }

  export const Input: FC<InputProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-check' {
  import { FC, CSSProperties } from 'react';

  export interface CheckProps {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    onChange?: (checked: boolean) => void;
    style?: CSSProperties;
    className?: string;
  }

  export const Check: FC<CheckProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-dropdown' {
  import { FC, CSSProperties, ReactNode } from 'react';

  export interface DropdownOption {
    value: string;
    label: string;
  }

  export interface DropdownProps {
    options?: DropdownOption[];
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (value: string) => void;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const Dropdown: FC<DropdownProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-badge' {
  import { FC, ReactNode, CSSProperties } from 'react';

  export interface BadgeProps {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'small' | 'medium' | 'large';
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const Badge: FC<BadgeProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-text-link' {
  import { FC, ReactNode, CSSProperties, MouseEventHandler } from 'react';

  export interface TextLinkProps {
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const TextLink: FC<TextLinkProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-radio' {
  import { FC, CSSProperties } from 'react';

  export interface RadioProps {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    name?: string;
    value?: string;
    onChange?: (value: string) => void;
    style?: CSSProperties;
    className?: string;
  }

  export const Radio: FC<RadioProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-switch' {
  import { FC, CSSProperties } from 'react';

  export interface SwitchProps {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    onChange?: (checked: boolean) => void;
    style?: CSSProperties;
    className?: string;
  }

  export const Switch: FC<SwitchProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-toast' {
  import { FC, ReactNode, CSSProperties } from 'react';

  export interface ToastProps {
    type?: 'success' | 'error' | 'warning' | 'info';
    message?: string;
    duration?: number;
    onClose?: () => void;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const Toast: FC<ToastProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-loading-spinner' {
  import { FC, CSSProperties } from 'react';

  export interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    style?: CSSProperties;
    className?: string;
  }

  export const LoadingSpinner: FC<LoadingSpinnerProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-tooltip' {
  import { FC, ReactNode, CSSProperties } from 'react';

  export interface TooltipProps {
    content?: string | ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const Tooltip: FC<TooltipProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-accordion' {
  import { FC, ReactNode, CSSProperties } from 'react';

  export interface AccordionProps {
    title?: string;
    expanded?: boolean;
    onChange?: (expanded: boolean) => void;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const Accordion: FC<AccordionProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-tab' {
  import { FC, ReactNode, CSSProperties } from 'react';

  export interface TabProps {
    tabs?: { key: string; label: string; content?: ReactNode }[];
    activeKey?: string;
    onChange?: (key: string) => void;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const Tab: FC<TabProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-pagination' {
  import { FC, CSSProperties } from 'react';

  export interface PaginationProps {
    current?: number;
    total?: number;
    pageSize?: number;
    onChange?: (page: number) => void;
    style?: CSSProperties;
    className?: string;
  }

  export const Pagination: FC<PaginationProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-layer-popup' {
  import { FC, ReactNode, CSSProperties } from 'react';

  export interface LayerPopupProps {
    visible?: boolean;
    title?: string;
    onClose?: () => void;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const LayerPopup: FC<LayerPopupProps>;
}

declare module '@dealicious/design-system-react/src/components/ssm-layer-alert' {
  import { FC, ReactNode, CSSProperties } from 'react';

  export interface LayerAlertProps {
    visible?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export const LayerAlert: FC<LayerAlertProps>;
}

/**
 * @dealicious/design-system (Vue) 타입 선언
 */
declare module '@dealicious/design-system/src/components/ssm-button' {
  const Button: any;
  export { Button };
}

declare module '@dealicious/design-system/src/components/ssm-chip' {
  const Chip: any;
  export { Chip };
}

declare module '@dealicious/design-system/src/components/ssm-tag' {
  const Tag: any;
  export { Tag };
}

declare module '@dealicious/design-system/src/components/ssm-text' {
  const Text: any;
  export { Text };
}

declare module '@dealicious/design-system/src/components/ssm-icon' {
  const Icon: any;
  export { Icon };
}

declare module '@dealicious/design-system/src/components/ssm-input' {
  const Input: any;
  export { Input };
}

declare module '@dealicious/design-system/src/components/ssm-check' {
  const Check: any;
  export { Check };
}

declare module '@dealicious/design-system/src/components/ssm-dropdown' {
  const Dropdown: any;
  export { Dropdown };
}

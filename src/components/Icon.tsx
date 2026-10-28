type IconName =
  | 'github'
  | 'mail'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'external'
  | 'copy'
  | 'check'
  | 'menu'
  | 'close'
  | 'download'
  | 'pin'

const paths: Record<IconName, string> = {
  github:
    'M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.1c-3.2.7-3.88-1.4-3.88-1.4-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z',
  mail: 'M3.5 6.5h17v11h-17zM4 7l8 6 8-6',
  'arrow-right': 'M4 12h15M13 6l6 6-6 6',
  'arrow-left': 'M20 12H5M11 6l-6 6 6 6',
  'arrow-up': 'M12 20V5M6 11l6-6 6 6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  check: 'M4 12.5l5 5L20 6.5',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
}

const filled: IconName[] = ['github']

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 18, className = '' }: IconProps) {
  const isFilled = filled.includes(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={isFilled ? 'currentColor' : 'none'}
      stroke={isFilled ? 'none' : 'currentColor'}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  )
}

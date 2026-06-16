import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-base' },
  xl: { container: 'w-16 h-16', text: 'text-lg' },
};

const colorPalette = [
  'bg-primary-500',
  'bg-accent-500',
  'bg-warning-500',
  'bg-[#8B5CF6]',
  'bg-[#EC4899]',
  'bg-[#06B6D4]',
  'bg-[#F97316]',
  'bg-[#14B8A6]',
];

const getColorForName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};

const getInitial = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
};

export default function Avatar({ src, name = '', size = 'md', className }: AvatarProps) {
  const sizes = sizeMap[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={cn(
          sizes.container,
          'rounded-full border-2 border-white object-cover shadow-card',
          className
        )}
      />
    );
  }

  const bgColor = getColorForName(name);
  const initial = getInitial(name);

  return (
    <div
      className={cn(
        sizes.container,
        bgColor,
        'flex items-center justify-center rounded-full border-2 border-white font-semibold text-white shadow-card',
        sizes.text,
        className
      )}
    >
      {initial}
    </div>
  );
}

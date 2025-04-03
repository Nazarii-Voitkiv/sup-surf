interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center';
}

export const SectionHeader = ({ title, subtitle, alignment = 'left' }: SectionHeaderProps) => {
  return (
    <>
      <h2 className={`text-4xl font-bold mb-6 text-gray-800 ${alignment === 'center' ? 'text-center' : ''}`}>
        {title}
      </h2>
      {alignment === 'left' && <div className="w-20 h-1 bg-primary mb-8"></div>}
      {subtitle && (
        <p className={`${alignment === 'center' ? 'text-center text-gray-600 mb-12 max-w-2xl mx-auto' : 'text-lg text-gray-600 mb-8'}`}>
          {subtitle}
        </p>
      )}
    </>
  );
};

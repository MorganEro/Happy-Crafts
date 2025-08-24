function SectionLabel({
  children,
  hidden,
}: {
  children: React.ReactNode;
  hidden?: boolean;
}) {
  return (
    <div
      className={[
        'px-3 pb-1 pt-2 text-[11px] uppercase tracking-[0.18em] text-hc-teal-500',
        hidden ? 'sr-only' : '',
      ].join(' ')}>
      {children}
    </div>
  );
}

export default SectionLabel;

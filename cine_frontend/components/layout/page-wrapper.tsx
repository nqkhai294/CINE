interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="pt-32 pb-20">{children}</div>
    </div>
  );
};

export default PageWrapper;

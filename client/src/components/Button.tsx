type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        bg-white
        text-black
        font-semibold
        px-8 py-4
        rounded-2xl
        transition-all
        duration-200
        hover:bg-neutral-800
        hover:text-white
        shadow-md
      "
    >
      {children}
    </button>
  );
}
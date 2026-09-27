import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "section" | "article";
};

export default function Surface({
  children,
  className = "",
  hover = true,
  as = "div",
}: Props) {
  const Component = as;

  return (
    <Component
      className={`
        rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-md
        shadow-sm
        ${hover ? "transition-all duration-200 hover:shadow-md hover:border-slate-300/70" : ""}
        dark:border-slate-800/60 dark:bg-slate-900/80 dark:hover:border-slate-700/70
        ${className}
      `.trim()}
    >
      {children}
    </Component>
  );
}

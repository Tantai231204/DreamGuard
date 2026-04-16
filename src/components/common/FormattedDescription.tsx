import React, { memo, useMemo, useId } from 'react';
import type { ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

const slugify = (node: ReactNode): string => {
  if (typeof node === 'string') {
    return node
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }
  if (Array.isArray(node)) {
    return node.map(slugify).join('');
  }
  if (React.isValidElement(node)) {
    return slugify((node as React.ReactElement<MDXElementProps>).props.children);
  }
  return '';
};

interface FormattedDescriptionProps {
  content: string | null | undefined;
  className?: string;
}

interface MDXElementProps {
  children?: ReactNode;
  mdxType?: string;
  [key: string]: unknown;
}

// Custom components for ReactMarkdown
const MarkdownComponents: Partial<Components> = {
  h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(children);
    return (
      <h1 id={id} className="text-3xl font-black uppercase tracking-[0.2em] text-slate-900 border-b-4 border-slate-900/5 pb-4 mb-10 mt-12 scroll-mt-24">
        {children}
      </h1>
    );
  },
  h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(children);
    return (
      <h2 id={id} className="text-[16px] font-black uppercase tracking-[0.25em] text-slate-900 mb-8 mt-10 border-l-4 border-slate-900/30 pl-5 scroll-mt-24">
        {children}
      </h2>
    );
  },
  h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(children);
    return (
      <h3 id={id} className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-800 mb-6 mt-8 bg-slate-50 py-2.5 px-4 rounded-xl inline-block border border-slate-100 scroll-mt-24">
        {children}
      </h3>
    );
  },
  p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => <p className="text-[15px] leading-[1.8] text-slate-600 mb-6 font-normal tracking-tight">{children}</p>,
  ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => <ul className="space-y-3 mb-8 list-none pl-0">{children}</ul>,
  ol: ({ children }: React.OlHTMLAttributes<HTMLOListElement>) => <ol className="space-y-3 mb-8 list-decimal pl-5 text-slate-600 font-medium">{children}</ol>,
  li: ({ children }: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-3 text-[14px] text-slate-600 font-normal group">
      <div className="mt-[7px] shrink-0">
        <div className="h-2 w-2 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:bg-primary/40 transition-colors">
          <div className="h-1 w-1 rounded-full bg-primary" />
        </div>
      </div>
      <span className="leading-relaxed">{children}</span>
    </li>
  ),
  a: ({ children, href }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary font-bold underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all px-0.5"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <div className="my-10 overflow-hidden rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50">
      <img src={src} alt={alt} className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-700" />
      {alt && <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-3 bg-slate-50/50 border-t border-slate-100">{alt}</p>}
    </div>
  ),
  table: ({ children }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-8 overflow-hidden rounded-xl border border-slate-100 shadow-sm">
      <table className="w-full border-collapse text-[13px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className="bg-slate-50 border-b-2 border-slate-100">{children}</thead>,
  th: ({ children }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => <th className="px-5 py-3 text-left font-black text-slate-900 uppercase tracking-wider">{children}</th>,
  td: ({ children }: React.TdHTMLAttributes<HTMLTableDataCellElement>) => <td className="px-5 py-4 border-b border-slate-50 text-slate-600 font-medium">{children}</td>,
  tr: ({ children }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className="hover:bg-slate-50/30 transition-colors">{children}</tr>,
  details: ({ children }: React.DetailsHTMLAttributes<HTMLDetailsElement>) => {
    const childrenArray = React.Children.toArray(children);
    const itemId = `acc-${Math.random().toString(36).substring(2, 9)}`;

    const summary = childrenArray.find((c) => {
      if (!React.isValidElement(c)) return false;
      const props = c.props as MDXElementProps;
      return c.type === 'summary' || props.mdxType === 'summary';
    });

    const contentNodes = childrenArray.filter((c) => {
      if (!React.isValidElement(c)) return true;
      const props = c.props as MDXElementProps;
      return c.type !== 'summary' && props.mdxType !== 'summary';
    });

    return (
      <Accordion type="single" collapsible className="w-full mb-6">
        <AccordionItem value={itemId} className="border-slate-100 bg-white shadow-[0_2px_10_rgba(0,0,0,0.02)] px-4 rounded-xl border overflow-hidden transition-all hover:border-slate-200">
          <AccordionTrigger className="hover:no-underline py-4 text-[12px] font-black uppercase tracking-wider text-slate-800 focus-visible:ring-0">
            {summary || "Details"}
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-slate-500 border-t border-slate-50 pt-4 mt-1">
            {contentNodes}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  },
  summary: ({ children }: React.HTMLAttributes<HTMLElement>) => <>{children}</>,
};

export const FormattedDescription = memo(({ content, className }: FormattedDescriptionProps) => {
  const containerId = `desc-${useId().replace(/:/g, '')}`;

  const safeContent = useMemo(() => {
    if (!content) return '';
    return content
      .replace(/&nbsp;/g, ' ')
      .replace(/(\w)-(\w)/g, '$1\u2011$2');
  }, [content]);

  if (!content) return null;

  return (
    <div id={containerId} className={cn('w-full [overflow-wrap:break-word] prose-slate max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={MarkdownComponents}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
});

FormattedDescription.displayName = 'FormattedDescription';
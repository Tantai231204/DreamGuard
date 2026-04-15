import React, { memo, useMemo, useId } from 'react';
import type { ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

interface FormattedDescriptionProps {
  content: string | null | undefined;
  className?: string;
}

interface ComponentProps {
  children?: ReactNode;
}

// Define a safe type for nodes that might have mdxType or type in context
interface MDXElementProps {
  mdxType?: string;
  [key: string]: unknown;
}

// Custom components for ReactMarkdown
const MarkdownComponents: Partial<Components> = {
  h1: ({ children }: ComponentProps) => <h1 className="text-2xl font-black uppercase tracking-[0.1em] text-slate-900 border-b-2 border-slate-900 pb-2 mb-8 mt-12">{children}</h1>,
  h2: ({ children }: ComponentProps) => <h2 className="text-[14px] font-black uppercase tracking-[0.15em] text-slate-900 mb-6 mt-10 border-l-4 border-slate-900 pl-4">{children}</h2>,
  h3: ({ children }: ComponentProps) => <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 mb-4 mt-8 bg-slate-50 py-2 px-3 rounded-lg inline-block">{children}</h3>,
  p: ({ children }: ComponentProps) => <p className="text-[14px] leading-[1.8] text-slate-600 mb-6 font-normal">{children}</p>,
  ul: ({ children }: ComponentProps) => <ul className="space-y-3 mb-8 list-none pl-0">{children}</ul>,
  ol: ({ children }: ComponentProps) => <ol className="space-y-3 mb-8 list-decimal pl-5 text-slate-600 font-medium">{children}</ol>,
  li: ({ children }: ComponentProps) => (
    <li className="flex items-start gap-3 text-[14px] text-slate-600 font-normal">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 mt-[9px] shrink-0" />
      <span>{children}</span>
    </li>
  ),
  details: ({ children }: ComponentProps) => {
    const childrenArray = React.Children.toArray(children);

    // Type-safe search for summary
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
        <AccordionItem value="item-1" className="border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] px-4 rounded-xl border">
          <AccordionTrigger className="hover:no-underline py-4 text-[12px] font-black uppercase tracking-wider text-slate-800">
            {summary || "Details"}
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-slate-500">
            {contentNodes}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  },
  summary: ({ children }: ComponentProps) => <>{children}</>,
};

export const FormattedDescription = memo(({ content, className }: FormattedDescriptionProps) => {
  const containerId = `desc-${useId().replace(/:/g, '')}`;

  // Pre-process for non-breaking hyphens even in Markdown/HTML
  const safeContent = useMemo(() => {
    if (!content) return '';
    // 1. Replace all non-breaking spaces with normal spaces to allow wrapping
    // 2. Fix non-breaking hyphens for compound words
    return content
      .replace(/&nbsp;/g, ' ')
      .replace(/(\w)-(\w)/g, '$1\u2011$2');
  }, [content]);

  if (!content) return null;

  return (
    <div id={containerId} className={cn('w-full [overflow-wrap:break-word]', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={MarkdownComponents}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
});

FormattedDescription.displayName = 'FormattedDescription';
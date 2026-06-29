'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  code: string;
  title: string;
}

let idCounter = 0;

export default function MermaidDiagram({ code, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#EEF2FF',
            primaryTextColor: '#1C1917',
            primaryBorderColor: '#6366F1',
            lineColor: '#78716C',
            secondaryColor: '#F1EDE8',
            tertiaryColor: '#F8F6F3',
            fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
            fontSize: '13px',
            nodeBorder: '#6366F1',
            clusterBkg: '#F1EDE8',
            titleColor: '#1C1917',
            edgeLabelBackground: '#F8F6F3',
          },
        });

        const id = `mermaid-${++idCounter}`;
        const { svg } = await mermaid.render(id, code);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          // Make SVG responsive
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.removeAttribute('height');
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
          setStatus('ready');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code]);

  if (status === 'error') return null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
    >
      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
          Visual
        </span>
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
        <span className="text-xs" style={{ color: 'var(--text-2)' }}>{title}</span>
      </div>

      {status === 'loading' && (
        <div className="flex justify-center items-center py-12">
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
        </div>
      )}

      <div
        ref={containerRef}
        className="p-4 overflow-x-auto"
        style={{ display: status === 'ready' ? 'block' : 'none' }}
      />
    </div>
  );
}

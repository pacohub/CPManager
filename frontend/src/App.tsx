export {};
import React, { useLayoutEffect } from 'react';
import SagaPanel from './js/SagaPanel';

function App() {
	useLayoutEffect(() => {
  function applyTooltipToElement(el: HTMLElement) {
    const title = el.getAttribute('title');
    if (!title) return;
    el.setAttribute('data-tooltip', title);
    el.removeAttribute('title');
  }

  function applyTooltips(root: ParentNode) {
    if (root instanceof HTMLElement) applyTooltipToElement(root);
    const nodes = Array.from(root.querySelectorAll('[title]')) as HTMLElement[];
    for (const el of nodes) applyTooltipToElement(el);
  }

	function autosizeTextarea(el: HTMLTextAreaElement) {
		// Preserve manual height if caller explicitly set it.
		el.style.height = 'auto';
		// Add 2px to avoid cutting off the last line on some browsers.
		el.style.height = `${el.scrollHeight + 2}px`;
	}

	function applyAutosize(root: ParentNode) {
		const nodes = Array.from(root.querySelectorAll('textarea')) as HTMLTextAreaElement[];
		for (const ta of nodes) autosizeTextarea(ta);
	}

    applyTooltips(document);
    applyAutosize(document);

    // Tooltip portal (so tooltips are not clipped by overflow:hidden containers)
    let tooltipEl: HTMLDivElement | null = null;
    let currentTarget: HTMLElement | null = null;

    function ensureTooltipEl() {
      if (tooltipEl) return tooltipEl;
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'cp-tooltip';
      tooltipEl.setAttribute('role', 'tooltip');
      document.body.appendChild(tooltipEl);
      return tooltipEl;
    }

    function positionTooltip() {
      if (!tooltipEl || !currentTarget) return;
      const rect = currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top - 10;
      tooltipEl.style.left = `${x}px`;
      tooltipEl.style.top = `${y}px`;
      // Clamp horizontally after measuring.
      const tipRect = tooltipEl.getBoundingClientRect();
      const margin = 8;
      if (tipRect.left < margin) tooltipEl.style.left = `${x + (margin - tipRect.left)}px`;
      if (tipRect.right > window.innerWidth - margin) tooltipEl.style.left = `${x - (tipRect.right - (window.innerWidth - margin))}px`;
    }

    function showTooltip(target: HTMLElement) {
      const text = (target.getAttribute('data-tooltip') || '').trim();
      if (!text) return;
      currentTarget = target;
      const el = ensureTooltipEl();
      el.textContent = text;
      // If any modal is open (or the target is inside a modal), keep tooltip below modal overlay
      const anyModalOpen = Boolean(document.querySelector('.modal-overlay'));
      const insideModal = Boolean(target.closest('.modal-overlay') || target.closest('.modal-content'));
      if (anyModalOpen || insideModal) el.style.zIndex = '900';
      else el.style.zIndex = '10000';
      el.style.display = 'block';
      positionTooltip();
      requestAnimationFrame(() => {
        if (!tooltipEl) return;
        tooltipEl.classList.add('cp-tooltip--visible');
        positionTooltip();
      });
    }

    function hideTooltip() {
      currentTarget = null;
      if (!tooltipEl) return;
      tooltipEl.classList.remove('cp-tooltip--visible');
      // Allow fade-out to run.
      window.setTimeout(() => {
        if (!tooltipEl) return;
        if (currentTarget) return;
        tooltipEl.style.display = 'none';
      }, 80);
    }

    function closestTooltipTarget(node: EventTarget | null): HTMLElement | null {
      if (!(node instanceof HTMLElement)) return null;
      return node.closest('[data-tooltip]') as HTMLElement | null;
    }

    function onPointerOver(e: Event) {
      const nextTarget = closestTooltipTarget(e.target);
      if (!nextTarget) return;
      if (currentTarget === nextTarget) return;
      showTooltip(nextTarget);
    }

    function onPointerOut(e: MouseEvent) {
      if (!currentTarget) return;
      const related = e.relatedTarget as any;
      if (related instanceof Node && currentTarget.contains(related)) return;
      hideTooltip();
    }

    function onFocusIn(e: Event) {
      const nextTarget = closestTooltipTarget(e.target);
      if (!nextTarget) return;
      showTooltip(nextTarget);
    }

    function onFocusOut() {
      hideTooltip();
    }

    function onInput(e: Event) {
      if (e.target instanceof HTMLTextAreaElement) autosizeTextarea(e.target);
    }
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'title' && m.target instanceof HTMLElement) {
          applyTooltips(m.target);
        }
        if (m.type === 'childList') {
          for (const node of Array.from(m.addedNodes)) {
            if (!(node instanceof HTMLElement)) continue;
            applyTooltips(node);
				applyAutosize(node);
          }
        }
      }
    });

    if (document.body) {
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['title'],
      });
    }

		document.addEventListener('pointerover', onPointerOver, true);
		document.addEventListener('pointerout', onPointerOut as any, true);
		document.addEventListener('focusin', onFocusIn, true);
		document.addEventListener('focusout', onFocusOut, true);
		document.addEventListener('input', onInput, true);
		window.addEventListener('scroll', positionTooltip, true);
		window.addEventListener('resize', positionTooltip);

    return () => {
    observer.disconnect();
    document.removeEventListener('pointerover', onPointerOver, true);
    document.removeEventListener('pointerout', onPointerOut as any, true);
    document.removeEventListener('focusin', onFocusIn, true);
    document.removeEventListener('focusout', onFocusOut, true);
    document.removeEventListener('input', onInput, true);
    window.removeEventListener('scroll', positionTooltip, true);
    window.removeEventListener('resize', positionTooltip);
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
  };
	}, []);

  return <SagaPanel />;
}

export default App;

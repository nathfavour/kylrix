'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

export interface FastDraftInputHandle {
  getValue: () => string;
  setValue: (value: string) => void;
  clear: () => void;
  focus: () => void;
}

interface FastDraftInputProps {
  initialValue?: string;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
  onEmptyChange?: (isEmpty: boolean) => void;
  onChange?: (value: string) => void;
}

export const FastDraftInput = forwardRef<FastDraftInputHandle, FastDraftInputProps>(function FastDraftInput(
  {
    initialValue = '',
    placeholder,
    rows = 3,
    autoFocus = false,
    onEmptyChange,
    onChange,
  },
  ref,
) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastEmptyRef = useRef<boolean>(!initialValue.trim());

  useEffect(() => {
    if (!autoFocus) return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [autoFocus]);

  const syncState = useCallback((value: string) => {
    const isEmpty = !value.trim();
    if (isEmpty !== lastEmptyRef.current) {
        lastEmptyRef.current = isEmpty;
        onEmptyChange?.(isEmpty);
    }
    onChange?.(value);
  }, [onEmptyChange, onChange]);

  useEffect(() => {
    onEmptyChange?.(lastEmptyRef.current);
  }, [onEmptyChange]);

  useImperativeHandle(ref, () => ({
    getValue: () => inputRef.current?.value || '',
    setValue: (value: string) => {
      const next = value ?? '';
      if (inputRef.current) {
        inputRef.current.value = next;
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
      syncState(next);
    },
    clear: () => {
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
      syncState('');
    },
    focus: () => inputRef.current?.focus(),
  }), [syncState]);

  return (
    <>
      <style>{`
        .fast-draft-textarea::placeholder {
          color: rgba(255, 255, 255, 0.36);
          opacity: 1;
        }
      `}</style>
      <textarea
        className="fast-draft-textarea"
        ref={inputRef}
        defaultValue={initialValue}
        placeholder={placeholder}
        rows={rows}
        onInput={(e: React.FormEvent<HTMLTextAreaElement>) => syncState(e.currentTarget.value)}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          resize: 'none',
          background: 'transparent',
          color: '#ffffff',
          font: 'inherit',
          fontSize: '1.1rem',
          fontWeight: 500,
          lineHeight: 1.6,
          padding: 0,
          minHeight: `${rows * 1.6}em`,
        }}
      />
    </>
  );
});


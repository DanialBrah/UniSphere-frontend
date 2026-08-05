import { describe, it, expect } from 'vitest'
import { applyMarkdown } from '../../../../features/news/utils/markdownActions'

describe('applyMarkdown — wrapping', () => {
  it('wraps a selection and keeps it selected', () => {
    const result = applyMarkdown('hello world', 6, 11, 'bold')
    expect(result.text).toBe('hello **world**')
    expect(result.text.slice(result.selectionStart, result.selectionEnd)).toBe('world')
  })

  it('inserts a placeholder at a bare caret and selects it', () => {
    const result = applyMarkdown('', 0, 0, 'bold')
    expect(result.text).toBe('**bold text**')
    expect(result.text.slice(result.selectionStart, result.selectionEnd)).toBe('bold text')
  })

  it('toggles an existing wrap off', () => {
    // Selection covers "world" inside the existing asterisks.
    const result = applyMarkdown('hello **world**', 8, 13, 'bold')
    expect(result.text).toBe('hello world')
  })

  it('handles italic and strikethrough markers of different lengths', () => {
    expect(applyMarkdown('abc', 0, 3, 'italic').text).toBe('*abc*')
    expect(applyMarkdown('abc', 0, 3, 'strikethrough').text).toBe('~~abc~~')
    expect(applyMarkdown('abc', 0, 3, 'code').text).toBe('`abc`')
  })
})

describe('applyMarkdown — line prefixes', () => {
  it('prefixes a single line', () => {
    expect(applyMarkdown('Title', 0, 5, 'h2').text).toBe('## Title')
  })

  it('prefixes every line of a multi-line selection', () => {
    const result = applyMarkdown('one\ntwo\nthree', 0, 13, 'bulletList')
    expect(result.text).toBe('- one\n- two\n- three')
  })

  it('numbers an ordered list incrementally', () => {
    const result = applyMarkdown('one\ntwo\nthree', 0, 13, 'numberedList')
    expect(result.text).toBe('1. one\n2. two\n3. three')
  })

  it('toggles a prefix off when every line already has it', () => {
    const result = applyMarkdown('- one\n- two', 0, 11, 'bulletList')
    expect(result.text).toBe('one\ntwo')
  })

  it('expands a caret-only position to cover the whole line', () => {
    // Caret sits mid-word; the prefix still lands at the start of the line.
    const result = applyMarkdown('hello world', 5, 5, 'quote')
    expect(result.text).toBe('> hello world')
  })
})

describe('applyMarkdown — link', () => {
  it('wraps the selection and puts the caret in the URL slot', () => {
    const result = applyMarkdown('click here', 0, 10, 'link')
    expect(result.text).toBe('[click here](https://)')
    expect(result.text.slice(result.selectionStart, result.selectionEnd)).toBe('https://')
  })

  it('uses a placeholder when nothing is selected', () => {
    expect(applyMarkdown('', 0, 0, 'link').text).toBe('[link text](https://)')
  })
})

describe('applyMarkdown — table block', () => {
  it('inserts a GFM table skeleton', () => {
    const result = applyMarkdown('', 0, 0, 'table')
    expect(result.text).toContain('| Column | Column |')
    expect(result.text).toContain('| --- | --- |')
  })

  it('separates the table from preceding text with a blank line', () => {
    const result = applyMarkdown('text', 4, 4, 'table')
    expect(result.text.startsWith('text\n\n|')).toBe(true)
  })
})

describe('applyMarkdown — bounds', () => {
  it('clamps out-of-range selections rather than producing undefined slices', () => {
    const result = applyMarkdown('abc', 99, 200, 'bold')
    expect(result.text).toBe('abc**bold text**')
  })

  it('handles a reversed selection by treating end as at least start', () => {
    const result = applyMarkdown('abc', 3, 1, 'bold')
    expect(result.text).toBe('abc**bold text**')
  })
})

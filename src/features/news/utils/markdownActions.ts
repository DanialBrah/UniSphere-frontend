export type MarkdownAction =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'h2'
  | 'h3'
  | 'quote'
  | 'code'
  | 'link'
  | 'bulletList'
  | 'numberedList'
  | 'table'

export interface MarkdownEditResult {
  text: string
  selectionStart: number
  selectionEnd: number
}

interface WrapSpec {
  kind: 'wrap'
  marker: string
  placeholder: string
}

interface PrefixSpec {
  kind: 'prefix'
  /** Static prefix, or a function for ordered lists where the number varies per line. */
  marker: string | ((index: number) => string)
  placeholder: string
}

interface BlockSpec {
  kind: 'block'
  template: string
}

type ActionSpec = WrapSpec | PrefixSpec | BlockSpec

const SPECS: Record<MarkdownAction, ActionSpec> = {
  bold: { kind: 'wrap', marker: '**', placeholder: 'bold text' },
  italic: { kind: 'wrap', marker: '*', placeholder: 'italic text' },
  strikethrough: { kind: 'wrap', marker: '~~', placeholder: 'struck text' },
  code: { kind: 'wrap', marker: '`', placeholder: 'code' },
  h2: { kind: 'prefix', marker: '## ', placeholder: 'Heading' },
  h3: { kind: 'prefix', marker: '### ', placeholder: 'Subheading' },
  quote: { kind: 'prefix', marker: '> ', placeholder: 'Quote' },
  bulletList: { kind: 'prefix', marker: '- ', placeholder: 'List item' },
  numberedList: {
    kind: 'prefix',
    marker: (index: number) => `${index + 1}. `,
    placeholder: 'List item',
  },
  link: { kind: 'wrap', marker: '', placeholder: 'link text' },
  table: {
    kind: 'block',
    template: '| Column | Column |\n| --- | --- |\n| Cell | Cell |',
  },
}

/** Extends a selection to cover the whole lines it touches, so prefixes land at line starts. */
function expandToLines(text: string, start: number, end: number): [number, number] {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  let lineEnd = text.indexOf('\n', end)
  if (lineEnd === -1) lineEnd = text.length
  return [lineStart, lineEnd]
}

function applyWrap(
  text: string,
  start: number,
  end: number,
  spec: WrapSpec,
): MarkdownEditResult {
  const selected = text.slice(start, end)
  const marker = spec.marker
  const markerLength = marker.length

  // Toggle off when the selection is already wrapped — clicking Bold twice should undo it.
  const before = text.slice(Math.max(0, start - markerLength), start)
  const after = text.slice(end, end + markerLength)
  if (markerLength > 0 && before === marker && after === marker) {
    return {
      text: text.slice(0, start - markerLength) + selected + text.slice(end + markerLength),
      selectionStart: start - markerLength,
      selectionEnd: end - markerLength,
    }
  }

  const body = selected || spec.placeholder
  const inserted = `${marker}${body}${marker}`
  return {
    text: text.slice(0, start) + inserted + text.slice(end),
    selectionStart: start + markerLength,
    selectionEnd: start + markerLength + body.length,
  }
}

function applyLink(text: string, start: number, end: number): MarkdownEditResult {
  const selected = text.slice(start, end) || 'link text'
  const inserted = `[${selected}](https://)`
  return {
    text: text.slice(0, start) + inserted + text.slice(end),
    // Select the URL — that's the part the author still has to fill in. The offset is the
    // opening "[", the link text, then "](" — three characters of syntax plus the text.
    selectionStart: start + selected.length + 3,
    selectionEnd: start + inserted.length - 1,
  }
}

function applyPrefix(
  text: string,
  start: number,
  end: number,
  spec: PrefixSpec,
): MarkdownEditResult {
  const [lineStart, lineEnd] = expandToLines(text, start, end)
  const block = text.slice(lineStart, lineEnd)
  const lines = block.length > 0 ? block.split('\n') : [spec.placeholder]

  const markerFor = (index: number) =>
    typeof spec.marker === 'function' ? spec.marker(index) : spec.marker

  // Toggle off when every line already carries the prefix.
  const allPrefixed = lines.every((line, i) => line.startsWith(markerFor(i)))
  const nextLines = allPrefixed
    ? lines.map((line, i) => line.slice(markerFor(i).length))
    : lines.map((line, i) => `${markerFor(i)}${line}`)

  const replacement = nextLines.join('\n')
  return {
    text: text.slice(0, lineStart) + replacement + text.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + replacement.length,
  }
}

function applyBlock(
  text: string,
  start: number,
  end: number,
  spec: BlockSpec,
): MarkdownEditResult {
  const needsLeadingBreak = start > 0 && text[start - 1] !== '\n'
  const inserted = `${needsLeadingBreak ? '\n\n' : ''}${spec.template}\n`
  return {
    text: text.slice(0, start) + inserted + text.slice(end),
    selectionStart: start + inserted.length,
    selectionEnd: start + inserted.length,
  }
}

/**
 * Pure selection maths for the editor toolbar, kept out of the component so it can be tested
 * without a DOM. Returns the new text plus where the selection should sit afterwards — the
 * caller restores it on the textarea, otherwise the caret jumps to the end on every click.
 */
export function applyMarkdown(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  action: MarkdownAction,
): MarkdownEditResult {
  const start = Math.max(0, Math.min(selectionStart, text.length))
  const end = Math.max(start, Math.min(selectionEnd, text.length))

  if (action === 'link') return applyLink(text, start, end)

  const spec = SPECS[action]
  switch (spec.kind) {
    case 'wrap':
      return applyWrap(text, start, end, spec)
    case 'prefix':
      return applyPrefix(text, start, end, spec)
    case 'block':
      return applyBlock(text, start, end, spec)
  }
}

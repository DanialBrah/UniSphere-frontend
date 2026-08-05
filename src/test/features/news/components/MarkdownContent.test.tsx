import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownContent } from '../../../../features/news/components/MarkdownContent'

/**
 * These are the tests that matter most in the News feature: article content is author-supplied
 * and rendered to every reader, so the escaping and the image allowlist are load-bearing.
 */
describe('MarkdownContent — XSS', () => {
  it('renders raw HTML as text instead of executing it', () => {
    // No rehype-raw is configured, which is precisely what makes this safe.
    const { container } = render(
      <MarkdownContent content={'<script>alert(1)</script>\n\nAfter'} />,
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.textContent).toContain('<script>alert(1)</script>')
  })

  it('does not emit an onerror-carrying img from raw HTML', () => {
    const { container } = render(
      <MarkdownContent content={'<img src=x onerror="alert(1)">'} />,
    )
    expect(container.querySelector('img')).toBeNull()
  })

  it('strips a javascript: link href', () => {
    const { container } = render(<MarkdownContent content="[click](javascript:alert(1))" />)
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('href') ?? '').not.toContain('javascript:')
  })

  it('gives external links noopener noreferrer', () => {
    const { container } = render(<MarkdownContent content="[docs](https://example.com)" />)
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('rel')).toContain('noopener')
    expect(anchor?.getAttribute('rel')).toContain('noreferrer')
    expect(anchor?.getAttribute('target')).toBe('_blank')
  })
})

describe('MarkdownContent — image host allowlist', () => {
  it('refuses to render an image from an arbitrary host', () => {
    // An off-origin <img> is an author-controlled outbound request from every reader's browser.
    const { container } = render(
      <MarkdownContent content="![pixel](https://evil.example/p.png)" />,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('pixel')).toBeInTheDocument()
  })

  it('renders an image served from the app’s own storage bucket', () => {
    const { container } = render(
      <MarkdownContent
        content="![cover](https://s3.us-west-004.backblazeb2.com/unisphere-posts/news/1/a.png)"
      />,
    )
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('alt')).toBe('cover')
  })

  it('renders a same-origin image', () => {
    const { container } = render(<MarkdownContent content="![local](/assets/a.png)" />)
    expect(container.querySelector('img')).not.toBeNull()
  })

  it('does not throw on a malformed image URL', () => {
    expect(() =>
      render(<MarkdownContent content="![broken](ht!tp://[not a url)" />),
    ).not.toThrow()
  })
})

describe('MarkdownContent — GFM rendering', () => {
  it('renders tables', () => {
    const { container } = render(
      <MarkdownContent content={'| A | B |\n| --- | --- |\n| 1 | 2 |'} />,
    )
    expect(container.querySelector('table')).not.toBeNull()
    expect(container.querySelectorAll('td')).toHaveLength(2)
  })

  it('renders strikethrough', () => {
    const { container } = render(<MarkdownContent content="~~gone~~" />)
    expect(container.querySelector('del')).not.toBeNull()
  })

  it('renders task list checkboxes as disabled', () => {
    const { container } = render(<MarkdownContent content={'- [x] done\n- [ ] todo'} />)
    const boxes = container.querySelectorAll('input[type="checkbox"]')
    expect(boxes.length).toBeGreaterThan(0)
    boxes.forEach((box) => expect(box).toBeDisabled())
  })

  it('renders headings and lists', () => {
    const { container } = render(
      <MarkdownContent content={'## Heading\n\n- one\n- two'} />,
    )
    expect(container.querySelector('h2')?.textContent).toBe('Heading')
    expect(container.querySelectorAll('li')).toHaveLength(2)
  })
})

describe('MarkdownContent — empty input', () => {
  it('renders nothing for blank content', () => {
    const { container } = render(<MarkdownContent content="   " />)
    expect(container.firstChild).toBeNull()
  })
})

import { useCursor } from '../cursor/CursorContext'

const LINKS = [
  { id: 'docs', label: 'Documentation', href: '#' },
  { id: 'playground', label: 'Playground', href: '#' },
  { id: 'showcase', label: 'Showcase', href: '#' },
  { id: 'feedback', label: 'Feedback', href: '#' },
]

export function FooterLinks() {
  const { activateTarget, deactivateTarget } = useCursor()

  return (
    <footer className="footer-links">
      <nav>
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            onPointerEnter={() => {
              activateTarget(link.id, { variant: 'link' })
            }}
            onPointerLeave={() => deactivateTarget(link.id)}
          >
            <span>{link.label}</span>
          </a>
        ))}
      </nav>
      <p className="footnote">Built for maximum pointer chaos.</p>
    </footer>
  )
}

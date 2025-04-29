import { Badge } from '@/components/ui/badge';
import { render } from '@testing-library/react';

describe('Badge component', () => {
  it('renders with default variant', () => {
    const { container } = render(<Badge>Test Badge</Badge>);
    const badge = container.firstChild;
    
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveClass('text-primary-foreground');
    expect(badge).toHaveTextContent('Test Badge');
  });

  it('renders with secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary Badge</Badge>);
    const badge = container.firstChild;
    
    expect(badge).toHaveClass('bg-secondary');
    expect(badge).toHaveClass('text-secondary-foreground');
    expect(badge).toHaveTextContent('Secondary Badge');
  });

  it('renders with destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Warning Badge</Badge>);
    const badge = container.firstChild;
    
    expect(badge).toHaveClass('bg-destructive');
    expect(badge).toHaveClass('text-destructive-foreground');
    expect(badge).toHaveTextContent('Warning Badge');
  });

  it('renders with additional className', () => {
    const { container } = render(<Badge className="custom-class">Custom Badge</Badge>);
    const badge = container.firstChild;
    
    expect(badge).toHaveClass('custom-class');
    expect(badge).toHaveTextContent('Custom Badge');
  });
});
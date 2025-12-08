import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loader from '../../components/Loader';

describe('Loader Component', () => {
  it('renders without crashing', () => {
    render(<Loader />);
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('renders with small size', () => {
    render(<Loader size="sm" />);
    const loader = document.querySelector('.w-5');
    expect(loader).toBeInTheDocument();
  });

  it('renders with medium size by default', () => {
    render(<Loader />);
    const loader = document.querySelector('.w-8');
    expect(loader).toBeInTheDocument();
  });

  it('renders with large size', () => {
    render(<Loader size="lg" />);
    const loader = document.querySelector('.w-12');
    expect(loader).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Loader className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});


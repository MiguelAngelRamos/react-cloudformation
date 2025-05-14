import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../App';

describe('App component', () => {
  it('renders correctly', () => {
    // Renderiza el componente App
    render(<App />);

    // Verifica que el texto "Vite + React" está presente en el documento
    expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument();

    // Verifica que el botón de conteo está presente y muestra el texto inicial "count is 0"
    expect(screen.getByText(/count is 0/i)).toBeInTheDocument();

    // Verifica que el enlace a Vite está presente y tiene el logo correcto
    const viteLogo = screen.getByAltText(/Vite logo/i);
    expect(viteLogo).toBeInTheDocument();
    expect(viteLogo.closest('a')).toHaveAttribute('href', 'https://vitejs.dev');

    // Verifica que el enlace a React está presente y tiene el logo correcto
    const reactLogo = screen.getByAltText(/React logo/i);
    expect(reactLogo).toBeInTheDocument();
    expect(reactLogo.closest('a')).toHaveAttribute('href', 'https://react.dev');
  });
});

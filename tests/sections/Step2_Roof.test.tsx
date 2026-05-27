import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Step2_Roof from '@/sections/configurator/Step2_Roof';
import type { WizardData } from '@/pages/Configurator';

const baseData: WizardData = {
  buildingType: 'einfamilien',
  ownership: 'eigentümer',
  roofTilt: 30,
  roofOrientation: 'S',
  roofArea: '80',
  shading: 'none',
  consumption: '4500',
  consumptionMethod: 'manual',
  storageSize: '10',
  wallbox: false,
  futureCar: false,
  heatPump: false,
  backupPower: false,
  energyApp: false,
  electricityPrice: '0.32',
  constructionYear: 'after2010',
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max@test.de',
  phone: '01711234567',
  zipCode: '80331',
  city: 'München',
  company: '',
  privacyConsent: true,
};

describe('Step2_Roof — Dachfläche Input-Validierung', () => {
  it('akzeptiert positive Zahlen', () => {
    const updateData = vi.fn();
    render(<Step2_Roof data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 60'), { target: { value: '120' } });
    expect(updateData).toHaveBeenCalledWith({ roofArea: '120' });
  });

  it('blockiert negative Zahlen — updateData wird nicht aufgerufen', () => {
    const updateData = vi.fn();
    render(<Step2_Roof data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 60'), { target: { value: '-180' } });
    expect(updateData).not.toHaveBeenCalled();
  });

  it('blockiert auch kleine negative Zahlen', () => {
    const updateData = vi.fn();
    render(<Step2_Roof data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 60'), { target: { value: '-1' } });
    expect(updateData).not.toHaveBeenCalled();
  });

  it('erlaubt 0 als Eingabe', () => {
    const updateData = vi.fn();
    render(<Step2_Roof data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 60'), { target: { value: '0' } });
    expect(updateData).toHaveBeenCalledWith({ roofArea: '0' });
  });

  it('erlaubt leeren String (Feld leeren)', () => {
    const updateData = vi.fn();
    render(<Step2_Roof data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 60'), { target: { value: '' } });
    expect(updateData).toHaveBeenCalledWith({ roofArea: '' });
  });

  it('input hat min="0" als HTML-Attribut', () => {
    const updateData = vi.fn();
    render(<Step2_Roof data={baseData} updateData={updateData} />);
    const input = screen.getByPlaceholderText('z.B. 60');
    expect(input).toHaveAttribute('min', '0');
  });
});

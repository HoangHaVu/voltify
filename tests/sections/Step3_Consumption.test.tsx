import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Step3_Consumption from '@/sections/configurator/Step3_Consumption';
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

describe('Step3_Consumption — Stromverbrauch Input-Validierung', () => {
  it('akzeptiert positiven Verbrauch', () => {
    const updateData = vi.fn();
    render(<Step3_Consumption data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 4000'), { target: { value: '3500' } });
    expect(updateData).toHaveBeenCalledWith(expect.objectContaining({ consumption: '3500' }));
  });

  it('blockiert negativen Verbrauch — updateData wird nicht aufgerufen', () => {
    const updateData = vi.fn();
    render(<Step3_Consumption data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 4000'), { target: { value: '-500' } });
    expect(updateData).not.toHaveBeenCalled();
  });

  it('erlaubt 0 als Verbrauch', () => {
    const updateData = vi.fn();
    render(<Step3_Consumption data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 4000'), { target: { value: '0' } });
    expect(updateData).toHaveBeenCalledWith(expect.objectContaining({ consumption: '0' }));
  });

  it('erlaubt leeren String beim Verbrauch', () => {
    const updateData = vi.fn();
    render(<Step3_Consumption data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 4000'), { target: { value: '' } });
    expect(updateData).toHaveBeenCalledWith(expect.objectContaining({ consumption: '' }));
  });

  it('Stromverbrauch-Input hat min="0" als HTML-Attribut', () => {
    const updateData = vi.fn();
    render(<Step3_Consumption data={baseData} updateData={updateData} />);
    expect(screen.getByPlaceholderText('z.B. 4000')).toHaveAttribute('min', '0');
  });
});

describe('Step3_Consumption — Strompreis Input-Validierung', () => {
  it('akzeptiert positiven Strompreis', () => {
    const updateData = vi.fn();
    render(<Step3_Consumption data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 0.32'), { target: { value: '0.28' } });
    expect(updateData).toHaveBeenCalledWith({ electricityPrice: '0.28' });
  });

  it('blockiert negativen Strompreis — updateData wird nicht aufgerufen', () => {
    const updateData = vi.fn();
    render(<Step3_Consumption data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 0.32'), { target: { value: '-0.10' } });
    expect(updateData).not.toHaveBeenCalled();
  });

  it('blockiert stark negativen Strompreis', () => {
    const updateData = vi.fn();
    render(<Step3_Consumption data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 0.32'), { target: { value: '-99' } });
    expect(updateData).not.toHaveBeenCalled();
  });

  it('erlaubt leeren String beim Strompreis', () => {
    const updateData = vi.fn();
    render(<Step3_Consumption data={baseData} updateData={updateData} />);
    fireEvent.change(screen.getByPlaceholderText('z.B. 0.32'), { target: { value: '' } });
    expect(updateData).toHaveBeenCalledWith({ electricityPrice: '' });
  });
});

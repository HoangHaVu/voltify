import { describe, it, expect } from 'vitest';
import { isOwner, isEmployee, isSuperEmployee, EMPLOYEE_ROLES, MANAGER_ROLES } from './auth';
import type { UserRole } from './auth';

describe('Role Helpers', () => {
  describe('isOwner', () => {
    it('gibt true für owner zurück', () => {
      expect(isOwner('owner')).toBe(true);
    });

    it('gibt false für andere Rollen zurück', () => {
      expect(isOwner('installer')).toBe(false);
      expect(isOwner('customer')).toBe(false);
      expect(isOwner('super_employee')).toBe(false);
    });
  });

  describe('isEmployee', () => {
    it('gibt true für alle Mitarbeiter-Rollen zurück', () => {
      EMPLOYEE_ROLES.forEach((role) => {
        expect(isEmployee(role as UserRole)).toBe(true);
      });
    });

    it('gibt false für owner und customer zurück', () => {
      expect(isEmployee('owner')).toBe(false);
      expect(isEmployee('customer')).toBe(false);
    });
  });

  describe('isSuperEmployee', () => {
    it('gibt true für super_employee zurück', () => {
      expect(isSuperEmployee('super_employee')).toBe(true);
    });

    it('gibt false für andere Rollen zurück', () => {
      expect(isSuperEmployee('owner')).toBe(false);
      expect(isSuperEmployee('installer')).toBe(false);
    });
  });
});

describe('Role Constants', () => {
  it('EMPLOYEE_ROLES enthält alle Mitarbeiter-Rollen', () => {
    expect(EMPLOYEE_ROLES).toContain('installer');
    expect(EMPLOYEE_ROLES).toContain('vertrieb');
    expect(EMPLOYEE_ROLES).toContain('projektleiter');
    expect(EMPLOYEE_ROLES).toContain('monteur');
    expect(EMPLOYEE_ROLES).toContain('backoffice');
    expect(EMPLOYEE_ROLES).toContain('super_employee');
    expect(EMPLOYEE_ROLES).not.toContain('owner');
    expect(EMPLOYEE_ROLES).not.toContain('customer');
  });

  it('MANAGER_ROLES enthält owner und super_employee', () => {
    expect(MANAGER_ROLES).toContain('owner');
    expect(MANAGER_ROLES).toContain('super_employee');
  });
});

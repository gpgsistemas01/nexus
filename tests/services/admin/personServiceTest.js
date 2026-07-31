import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PersonCreateDatabaseError, PersonUpdateDatabaseError } from '../../../src/errors/admin/personError.js';

const personCreate = vi.fn();
const personUpdate = vi.fn();
const personFindUnique = vi.fn();
const personFindMany = vi.fn();
const personCount = vi.fn();

vi.mock('../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  logServiceError: vi.fn()
}));

vi.mock('../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    person: {
      create: personCreate,
      update: personUpdate,
      findUnique: personFindUnique,
      findMany: personFindMany,
      count: personCount
    }
  })
}));

const {
  createPerson,
  findAllPersons,
  findPersonById,
  updatePerson
} = await import('../../../src/services/admin/person/personService.js');

describe('personService submit operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista personas con sus accesos', async () => {
    personFindMany.mockResolvedValue([
      {
        id: 'person-1',
        fullName: 'Persona Uno',
        accesses: [{
          department: { id: 'department-1', name: 'Ventas' },
          role: { id: 'role-1', name: 'Coordinador' }
        }]
      }
    ]);
    personCount.mockResolvedValueOnce(5).mockResolvedValueOnce(1);

    await expect(findAllPersons({
      departments: ['Ventas'],
      roles: ['Coordinador'],
      includeAccesses: true,
      search: 'persona',
      orderBy: 'fullName',
      orderDir: 'desc'
    })).resolves.toEqual({
      data: [{
        id: 'person-1',
        fullName: 'Persona Uno',
        accesses: [{
          department: { id: 'department-1', name: 'Ventas' },
          role: { id: 'role-1', name: 'Coordinador' }
        }]
      }],
      recordsTotal: 5,
      recordsFiltered: 1
    });

    expect(personFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        isActive: true,
        fullName: { contains: 'persona', mode: 'insensitive' },
        accesses: {
          some: {
            department: { name: { in: ['Ventas'] } },
            role: { name: { in: ['Coordinador'] } }
          }
        }
      }),
      orderBy: { fullName: 'desc' }
    }));
  });

  it('incluye accesos solamente cuando se solicitan al buscar por id', async () => {
    personFindUnique.mockResolvedValue({ id: 'person-1' });

    await findPersonById({ id: 'person-1' });
    await findPersonById({ id: 'person-1', includeAccesses: true });

    expect(personFindUnique.mock.calls[0][0].select).toEqual({ id: true, fullName: true });
    expect(personFindUnique.mock.calls[1][0].select).toEqual({
      id: true,
      fullName: true,
      accesses: { select: { department: true, role: true } }
    });
  });

  it('crea personas y relaciona departamentos enviados por submit', async () => {
    const personDto = {
      fullName: 'Persona Uno',
      accesses: [
        { roleId: 'role-1', departmentId: 'department-1' },
        { roleId: 'role-2', departmentId: 'department-2' }
      ]
    };
    const personWithAccesses = { id: 'person-1', fullName: 'Persona Uno', accesses: [] };

    personCreate.mockResolvedValue(personWithAccesses);

    await expect(createPerson({ personDto })).resolves.toEqual(personWithAccesses);
    expect(personCreate).toHaveBeenCalledWith({
      data: {
        fullName: 'Persona Uno',
        accesses: {
          createMany: {
            data: [
              { roleId: 'role-1', departmentId: 'department-1' },
              { roleId: 'role-2', departmentId: 'department-2' }
            ]
          }
        }
      },
      select: expect.any(Object)
    });
  });

  it('crea personas sin relaciones cuando no se envían departamentos', async () => {
    const createdPerson = { id: 'person-1', fullName: 'Persona Uno' };

    personCreate.mockResolvedValue(createdPerson);

    await expect(createPerson({ personDto: { fullName: 'Persona Uno', accesses: [] } })).resolves.toEqual(createdPerson);
    expect(personCreate).toHaveBeenCalledWith({
      data: { fullName: 'Persona Uno' },
      select: expect.any(Object)
    });
  });

  it('envuelve errores de creación en PersonCreateDatabaseError', async () => {
    personCreate.mockRejectedValue(new Error('db failed'));

    await expect(createPerson({ personDto: { fullName: 'Persona Uno' } })).rejects.toThrow(PersonCreateDatabaseError);
  });

  it('actualiza persona, limpia relaciones anteriores y crea las nuevas', async () => {
    const personDto = {
      fullName: 'Persona Editado',
      accesses: [{ roleId: 'role-2', departmentId: 'department-3' }]
    };
    const updatedPerson = { id: 'person-1', fullName: 'Persona Editado', accesses: [] };

    personUpdate.mockResolvedValue(updatedPerson);

    await expect(updatePerson({ id: 'person-1', personDto })).resolves.toEqual(updatedPerson);
    expect(personUpdate).toHaveBeenCalledWith({
      where: { id: 'person-1' },
      data: {
        fullName: 'Persona Editado',
        accesses: {
          deleteMany: {},
          createMany: {
            data: [{ roleId: 'role-2', departmentId: 'department-3' }]
          }
        }
      },
      select: expect.any(Object)
    });
  });

  it('envuelve errores de actualización en PersonUpdateDatabaseError', async () => {
    personUpdate.mockRejectedValue(new Error('db failed'));

    await expect(updatePerson({ id: 'person-1', personDto: { fullName: 'Persona' } })).rejects.toThrow(PersonUpdateDatabaseError);
  });
});

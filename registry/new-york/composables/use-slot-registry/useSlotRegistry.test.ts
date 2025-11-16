/**
 * Tests unitaires pour useSlotRegistry
 *
 * Ces tests servent également de documentation du comportement attendu.
 * Exécutez avec : pnpm test use-slot-registry
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, h, nextTick } from 'vue';
import { useSlotRegistry } from '../useSlotRegistry';

describe('useSlotRegistry', () => {
  describe('createSlotRegistry', () => {
    it('devrait créer un registre de slots vide', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      expect(registry.getAll()).toEqual([]);
      expect(registry.registry.value.size).toBe(0);
    });

    it('devrait accepter des options de tri par défaut', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry({
        defaultSort: { by: 'position', order: 'asc' },
      });

      // Enregistrer dans le désordre
      registry.checkIn('slot-3', { id: 'slot-3', position: 30 });
      registry.checkIn('slot-1', { id: 'slot-1', position: 10 });
      registry.checkIn('slot-2', { id: 'slot-2', position: 20 });

      const slots = registry.getSlots();
      expect(slots[0].position).toBe(10);
      expect(slots[1].position).toBe(20);
      expect(slots[2].position).toBe(30);
    });

    it('devrait hériter tous les événements de useCheckIn', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      const onCheckIn = vi.fn();
      const onCheckOut = vi.fn();

      registry.on('check-in', onCheckIn);
      registry.on('check-out', onCheckOut);

      registry.checkIn('slot-1', { id: 'slot-1' });
      expect(onCheckIn).toHaveBeenCalledTimes(1);

      registry.checkOut('slot-1');
      expect(onCheckOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('registerSlot', () => {
    it('devrait enregistrer un slot avec auto-register', () => {
      const { createSlotRegistry, registerSlot } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registerSlot(registry, {
        id: 'my-slot',
        autoRegister: true,
        component: { template: '<div>Test</div>' },
      });

      expect(registry.has('my-slot')).toBe(true);
    });

    it('devrait supporter les render functions', () => {
      const { createSlotRegistry, registerSlot } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      const renderFn = vi.fn(() => h('div', 'Hello'));

      registerSlot(registry, {
        id: 'slot-1',
        autoRegister: true,
        render: renderFn,
      });

      registry.renderSlots();
      expect(renderFn).toHaveBeenCalled();
    });

    it('devrait supporter les VNodes pré-générés', () => {
      const { createSlotRegistry, registerSlot } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      const vnode = h('div', 'Static');

      registerSlot(registry, {
        id: 'slot-1',
        autoRegister: true,
        vnode,
      });

      const rendered = registry.renderSlots();
      expect(rendered).toHaveLength(1);
    });

    it('devrait supporter les components avec props', () => {
      const { createSlotRegistry, registerSlot } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      const TestComponent = {
        props: ['message'],
        template: '<div>{{ message }}</div>',
      };

      registerSlot(registry, {
        id: 'slot-1',
        autoRegister: true,
        component: TestComponent,
        props: { message: 'Hello' },
      });

      expect(registry.has('slot-1')).toBe(true);
    });
  });

  describe('getSlots', () => {
    it('devrait filtrer par groupe', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registry.checkIn('slot-1', { id: 'slot-1', group: 'header' });
      registry.checkIn('slot-2', { id: 'slot-2', group: 'footer' });
      registry.checkIn('slot-3', { id: 'slot-3', group: 'header' });

      const headerSlots = registry.getSlots({ group: 'header' });
      expect(headerSlots).toHaveLength(2);
      expect(headerSlots.every((s) => s.group === 'header')).toBe(true);
    });

    it('devrait filtrer par visibilité', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registry.checkIn('slot-1', { id: 'slot-1', visible: true });
      registry.checkIn('slot-2', { id: 'slot-2', visible: false });
      registry.checkIn('slot-3', { id: 'slot-3', visible: () => true });

      const visibleSlots = registry.getSlots({ visible: true });
      expect(visibleSlots).toHaveLength(2);
    });

    it('devrait trier par position', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registry.checkIn('slot-1', { id: 'slot-1', position: 30 });
      registry.checkIn('slot-2', { id: 'slot-2', position: 10 });
      registry.checkIn('slot-3', { id: 'slot-3', position: 20 });

      const slots = registry.getSlots({ sortBy: 'position', order: 'asc' });
      expect(slots[0].position).toBe(10);
      expect(slots[1].position).toBe(20);
      expect(slots[2].position).toBe(30);
    });

    it('devrait trier par priorité', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registry.checkIn('slot-1', { id: 'slot-1', priority: 5 });
      registry.checkIn('slot-2', { id: 'slot-2', priority: 10 });
      registry.checkIn('slot-3', { id: 'slot-3', priority: 1 });

      const slots = registry.getSlots({ sortBy: 'priority', order: 'desc' });
      expect(slots[0].priority).toBe(10);
      expect(slots[1].priority).toBe(5);
      expect(slots[2].priority).toBe(1);
    });
  });

  describe('renderSlots', () => {
    it('devrait rendre tous les slots visibles', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registry.checkIn('slot-1', {
        id: 'slot-1',
        render: () => h('div', 'Slot 1'),
      });
      registry.checkIn('slot-2', {
        id: 'slot-2',
        render: () => h('div', 'Slot 2'),
      });

      const vnodes = registry.renderSlots();
      expect(vnodes).toHaveLength(2);
    });

    it('devrait passer le scope aux render functions', () => {
      interface MyScope {
        data: string;
      }

      const { createSlotRegistry } = useSlotRegistry<MyScope>();
      const { registry } = createSlotRegistry();

      const renderFn = vi.fn((scope?: MyScope) => {
        return h('div', scope?.data || 'No data');
      });

      registry.checkIn('slot-1', {
        id: 'slot-1',
        render: renderFn,
      });

      registry.renderSlots({ data: 'Test data' });
      expect(renderFn).toHaveBeenCalledWith({ data: 'Test data' });
    });

    it('ne devrait pas rendre les slots invisibles', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registry.checkIn('slot-1', {
        id: 'slot-1',
        visible: true,
        render: () => h('div', 'Visible'),
      });
      registry.checkIn('slot-2', {
        id: 'slot-2',
        visible: false,
        render: () => h('div', 'Invisible'),
      });

      const vnodes = registry.renderSlots();
      expect(vnodes).toHaveLength(1);
    });

    it('devrait gérer les fonctions de visibilité', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      const isVisible = ref(true);

      registry.checkIn('slot-1', {
        id: 'slot-1',
        visible: () => isVisible.value,
        render: () => h('div', 'Conditional'),
      });

      expect(registry.renderSlots()).toHaveLength(1);

      isVisible.value = false;
      expect(registry.renderSlots()).toHaveLength(0);
    });
  });

  describe('renderGroup', () => {
    it('devrait rendre uniquement le groupe spécifié', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registry.checkIn('slot-1', {
        id: 'slot-1',
        group: 'header',
        render: () => h('div', 'Header'),
      });
      registry.checkIn('slot-2', {
        id: 'slot-2',
        group: 'footer',
        render: () => h('div', 'Footer'),
      });

      const headerNodes = registry.renderGroup('header');
      expect(headerNodes).toHaveLength(1);

      const footerNodes = registry.renderGroup('footer');
      expect(footerNodes).toHaveLength(1);
    });

    it('devrait passer le scope au groupe', () => {
      interface MyScope {
        index: number;
      }

      const { createSlotRegistry } = useSlotRegistry<MyScope>();
      const { registry } = createSlotRegistry();

      const renderFn = vi.fn((scope?: MyScope) => {
        return h('div', `Index: ${scope?.index}`);
      });

      registry.checkIn('slot-1', {
        id: 'slot-1',
        group: 'items',
        render: renderFn,
      });

      registry.renderGroup('items', { index: 42 });
      expect(renderFn).toHaveBeenCalledWith({ index: 42 });
    });
  });

  describe('Scoped Slots', () => {
    it('devrait supporter les scoped slots typés', () => {
      interface BreadcrumbScope {
        isLast: boolean;
        index: number;
      }

      const { createSlotRegistry } = useSlotRegistry<BreadcrumbScope>();
      const { registry } = createSlotRegistry();

      registry.checkIn('crumb-1', {
        id: 'crumb-1',
        render: (scope) => {
          const nodes = [h('a', 'Home')];
          if (scope && !scope.isLast) {
            nodes.push(h('span', '/'));
          }
          return nodes;
        },
      });

      const vnodes1 = registry.renderSlots({ isLast: false, index: 0 });
      expect(vnodes1).toHaveLength(2); // Link + separator

      const vnodes2 = registry.renderSlots({ isLast: true, index: 1 });
      expect(vnodes2).toHaveLength(1); // Link only
    });
  });

  describe('Réactivité', () => {
    it('devrait réagir aux changements de visibilité', async () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      const isVisible = ref(true);

      registry.checkIn('slot-1', {
        id: 'slot-1',
        visible: () => isVisible.value,
        render: () => h('div', 'Test'),
      });

      expect(registry.renderSlots()).toHaveLength(1);

      isVisible.value = false;
      await nextTick();
      expect(registry.renderSlots()).toHaveLength(0);

      isVisible.value = true;
      await nextTick();
      expect(registry.renderSlots()).toHaveLength(1);
    });

    it('devrait réagir aux changements dans les render functions', async () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      const count = ref(0);

      registry.checkIn('slot-1', {
        id: 'slot-1',
        render: () => h('div', `Count: ${count.value}`),
      });

      count.value = 42;
      await nextTick();

      // La render function devrait utiliser la nouvelle valeur
      const vnodes = registry.renderSlots();
      expect(vnodes).toHaveLength(1);
    });
  });

  describe('Compatibilité avec useCheckIn', () => {
    it('devrait hériter toutes les méthodes de useCheckIn', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      // Toutes ces méthodes doivent exister
      expect(typeof registry.checkIn).toBe('function');
      expect(typeof registry.checkOut).toBe('function');
      expect(typeof registry.get).toBe('function');
      expect(typeof registry.getAll).toBe('function');
      expect(typeof registry.update).toBe('function');
      expect(typeof registry.has).toBe('function');
      expect(typeof registry.clear).toBe('function');
      expect(typeof registry.checkInMany).toBe('function');
      expect(typeof registry.checkOutMany).toBe('function');
      expect(typeof registry.updateMany).toBe('function');
      expect(typeof registry.on).toBe('function');
      expect(typeof registry.off).toBe('function');
      expect(typeof registry.emit).toBe('function');
    });

    it('devrait hériter les lifecycle hooks', () => {
      const onBeforeCheckIn = vi.fn(() => true);
      const onCheckIn = vi.fn();

      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry({
        onBeforeCheckIn,
        onCheckIn,
      });

      registry.checkIn('slot-1', { id: 'slot-1' });

      expect(onBeforeCheckIn).toHaveBeenCalled();
      expect(onCheckIn).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('devrait gérer les slots sans render/component/vnode', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registry.checkIn('empty-slot', { id: 'empty-slot' });

      const vnodes = registry.renderSlots();
      expect(vnodes).toHaveLength(0); // Pas de rendu si rien à rendre
    });

    it('devrait gérer les groupes inexistants', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registry.checkIn('slot-1', { id: 'slot-1', group: 'existing' });

      const vnodes = registry.renderGroup('non-existing');
      expect(vnodes).toHaveLength(0);
    });

    it('devrait gérer les positions non définies', () => {
      const { createSlotRegistry } = useSlotRegistry();
      const { registry } = createSlotRegistry();

      registry.checkIn('slot-1', { id: 'slot-1' }); // Pas de position
      registry.checkIn('slot-2', { id: 'slot-2', position: 10 });

      const slots = registry.getSlots({ sortBy: 'position', order: 'asc' });
      expect(slots[0].position).toBe(10);
      expect(slots[1].position).toBeUndefined();
    });
  });
});

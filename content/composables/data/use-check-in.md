---
title: useCheckIn
description: Generic check-in system for parent/child component registration pattern.
---

  <p class="text-pretty mt-4">Like an airport check-in desk: parent components provide a check-in counter<br>where child components register themselves with their data.</p>

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <airport-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed, provide } from "vue";
import { useCheckIn } from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import AirportPassenger from "./AirportPassenger.vue";

interface PassengerData {
  name: string;
  seat: string;
  baggage: number;
  fareClass: "Business" | "Premium" | "Eco";
  checkedInAt?: Date;
}

const flightNumber = ref("AF1234");
const gate = ref("A12");
const departureTime = ref("14:30");

type AircraftType = "Airbus A320" | "Boeing 737";
const aircraftType = ref<AircraftType>("Airbus A320");
const aircraftConfig: Record<
  AircraftType,
  {
    rows: { Business: number[]; Premium: number[]; Eco: number[] };
    letters: { Business: string[]; Premium: string[]; Eco: string[] };
    totalSeats: number;
  }
> = {
  "Airbus A320": {
    rows: {
      Business: [1, 2, 3, 4],
      Premium: [5, 6, 7, 8, 9],
      Eco: [
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
        28, 29, 30,
      ],
    },
    letters: {
      Business: ["A", "C", "D", "F"],
      Premium: ["A", "B", "C", "D", "E", "F"],
      Eco: ["A", "B", "C", "D", "E", "F"],
    },
    totalSeats: 174,
  },
  "Boeing 737": {
    rows: {
      Business: [1, 2, 3],
      Premium: [4, 5, 6, 7],
      Eco: [
        8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
        26, 27, 28, 29,
      ],
    },
    letters: {
      Business: ["A", "C", "D", "F"],
      Premium: ["A", "B", "C", "D", "E", "F"],
      Eco: ["A", "B", "C", "D", "E", "F"],
    },
    totalSeats: 162,
  },
};

const occupiedSeats = ref(new Set<string>());

const boardingGroups = ref({
  Business: "A",
  Premium: "B",
  Eco: "C",
});

const maxBaggageWeight = {
  Business: 40,
  Premium: 30,
  Eco: 23,
};

const addBaggage = (passengerId: string, weight: number = 10): boolean => {
  const passenger = airportDesk.desk.get(passengerId);
  if (!passenger) return false;

  const currentWeight = passenger.data.baggage;
  const maxWeight = maxBaggageWeight[passenger.data.fareClass];
  const newWeight = currentWeight + weight;

  if (newWeight > maxWeight) {
    console.log(
      `❌ ${passenger.data.name}: Cannot add ${weight}kg (max ${maxWeight}kg, current ${currentWeight}kg)`,
    );
    return false;
  }

  const success = airportDesk.desk.update(passengerId, { baggage: newWeight });
  if (success) {
    console.log(
      `➕ ${passenger.data.name}: Adding ${weight}kg of baggage (${currentWeight}kg → ${newWeight}kg)`,
    );
  }
  return success;
};

const removeBaggage = (passengerId: string, weight: number = 10): boolean => {
  const passenger = airportDesk.desk.get(passengerId);
  if (!passenger) return false;

  const currentWeight = passenger.data.baggage;
  const newWeight = Math.max(0, currentWeight - weight);

  const success = airportDesk.desk.update(passengerId, { baggage: newWeight });
  if (success) {
    console.log(
      `➖ ${passenger.data.name}: Removing ${weight}kg of baggage (${currentWeight}kg → ${newWeight}kg)`,
    );
  }
  return success;
};

const assignSeat = (
  passengerId: string,
  passengerName: string,
  fareClass: "Business" | "Premium" | "Eco" = "Eco",
) => {
  const config = aircraftConfig[aircraftType.value];
  const availableRows = config.rows[fareClass];
  const availableLetters = config.letters[fareClass];

  const possibleSeats: string[] = [];
  for (const row of availableRows) {
    for (const letter of availableLetters) {
      const seat = `${row}${letter}`;
      if (!occupiedSeats.value.has(seat)) {
        possibleSeats.push(seat);
      }
    }
  }

  if (possibleSeats.length === 0) {
    console.log(
      `❌ No seat available in ${fareClass} class for ${passengerName}`,
    );
    return null;
  }

  const newSeat =
    possibleSeats[Math.floor(Math.random() * possibleSeats.length)];

  if (!newSeat) {
    console.log(`❌ Error assigning seat for ${passengerName}`);
    return null;
  }

  const passenger = airportDesk.desk.get(passengerId);
  const oldSeat = passenger?.data.seat;

  if (passenger) {
    if (oldSeat) {
      occupiedSeats.value.delete(oldSeat);
    }

    occupiedSeats.value.add(newSeat);
    const success = airportDesk.desk.update(passengerId, { seat: newSeat });
    if (!success) {
      console.log(`❌ Failed to update seat for ${passengerName}`);
      return null;
    }
  }

  if (oldSeat) {
    console.log(
      `💺 The desk changed ${passengerName}'s seat: ${oldSeat} → ${newSeat}`,
    );
  } else {
    console.log(
      `💺 The desk assigned seat ${newSeat} to ${passengerName} (${fareClass})`,
    );
  }

  return newSeat;
};

const { createDesk } = useCheckIn<
  PassengerData,
  {
    flightNumber: typeof flightNumber;
    gate: typeof gate;
    departureTime: typeof departureTime;
    boardingGroups: typeof boardingGroups;
    maxBaggageWeight: typeof maxBaggageWeight;
    assignSeat: typeof assignSeat;
    addBaggage: typeof addBaggage;
    removeBaggage: typeof removeBaggage;
  }
>();

const airportDesk = createDesk({
  context: {
    flightNumber,
    gate,
    departureTime,
    boardingGroups,
    maxBaggageWeight,
    assignSeat,
    addBaggage,
    removeBaggage,
  },
  debug: false,
  onCheckIn: (id, data) => {
    if (!data.seat) {
      const assignedSeat = assignSeat(String(id), data.name, data.fareClass);
      console.log(
        `✅ ${data.name} has checked in at the desk with seat ${assignedSeat}!`,
      );
    }
    return true;
  },
  onCheckOut: (id) => {
    console.log(`🚪 Passenger ${id} has left the desk`);
    return true;
  },
});

provide("airportDesk", { deskSymbol: airportDesk.DeskInjectionKey });

const passengers = computed(() => {
  const all = airportDesk.desk.getAll();

  const fareOrder = { Business: 0, Premium: 1, Eco: 2 };
  return all.sort(
    (a, b) => fareOrder[a.data.fareClass] - fareOrder[b.data.fareClass],
  );
});

const stats = computed(() => {
  const config = aircraftConfig[aircraftType.value];
  return {
    total: passengers.value.length,
    groupA: passengers.value.filter(
      (p) => boardingGroups.value[p.data.fareClass] === "A",
    ).length,
    groupB: passengers.value.filter(
      (p) => boardingGroups.value[p.data.fareClass] === "B",
    ).length,
    groupC: passengers.value.filter(
      (p) => boardingGroups.value[p.data.fareClass] === "C",
    ).length,
    totalWeight: passengers.value.reduce((sum, p) => sum + p.data.baggage, 0),
    totalSeats: config.totalSeats,
    occupiedSeats: occupiedSeats.value.size,
    availableSeats: config.totalSeats - occupiedSeats.value.size,
  };
});

const boardGroup = (group: "A" | "B" | "C") => {
  const groupPassengers = passengers.value
    .filter((p) => boardingGroups.value[p.data.fareClass] === group)
    .map((p) => p.id);

  console.log(
    `📢 Boarding group ${group}: ${groupPassengers.length} passengers`,
  );
};

const passengersList = ref([
  { id: "passenger-1", name: "Sophie Martin", fareClass: "Business" as const },
  { id: "passenger-2", name: "Jean Dupont", fareClass: "Premium" as const },
  { id: "passenger-3", name: "Marie Lambert", fareClass: "Business" as const },
  { id: "passenger-4", name: "Pierre Dubois", fareClass: "Eco" as const },
  { id: "passenger-5", name: "Claire Bernard", fareClass: "Premium" as const },
]);

const changeGate = () => {
  const gates = ["A12", "B5", "C8", "D3"];
  const currentIndex = gates.indexOf(gate.value);
  const newGate = gates[(currentIndex + 1) % gates.length];
  if (newGate) gate.value = newGate;
};

const changeAircraft = () => {
  const types: AircraftType[] = ["Airbus A320", "Boeing 737"];
  const currentIndex = types.indexOf(aircraftType.value);
  const nextType = types[(currentIndex + 1) % types.length];
  if (!nextType) return;

  aircraftType.value = nextType;

  occupiedSeats.value.clear();

  passengers.value.forEach((p) => {
    assignSeat(String(p.id), p.data.name, p.data.fareClass);
  });

  console.log(`✈️ Aircraft change: ${aircraftType.value}`);
};
</script>

<template>
  <div class="space-y-6">
    <div class="bg-primary/10 p-4 rounded-lg border-2 border-primary">
      <h3 class="text-lg font-bold mb-3">✈️ Flight Display - Check-in Desk</h3>
      <div class="grid grid-cols-4 gap-4 text-sm">
        <div>
          <div class="text-muted-foreground">Flight</div>
          <div class="font-mono font-bold">{{ flightNumber }}</div>
        </div>
        <div>
          <div class="text-muted-foreground">Aircraft</div>
          <div class="font-mono font-bold text-xs">{{ aircraftType }}</div>
        </div>
        <div>
          <div class="text-muted-foreground">Gate</div>
          <div class="font-mono font-bold">{{ gate }}</div>
        </div>
        <div>
          <div class="text-muted-foreground">Departure</div>
          <div class="font-mono font-bold">{{ departureTime }}</div>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <button
          @click="changeGate"
          class="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
        >
          🔄 Change Gate
        </button>
        <button
          @click="changeAircraft"
          class="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90"
        >
          ✈️ Change Aircraft
        </button>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div class="bg-muted p-4 rounded-lg">
        <h4 class="font-semibold mb-2 text-sm">📊 Passengers</h4>
        <div class="text-2xl font-bold">{{ stats.total }}</div>
      </div>
      <div class="bg-muted p-4 rounded-lg">
        <h4 class="font-semibold mb-2 text-sm">💺 Seats</h4>
        <div class="text-2xl font-bold">
          {{ stats.occupiedSeats }}/{{ stats.totalSeats }}
        </div>
        <div class="text-xs text-muted-foreground mt-1">
          {{ stats.availableSeats }} available
        </div>
      </div>
      <div class="bg-muted p-4 rounded-lg">
        <h4 class="font-semibold mb-2 text-sm">🧳 Baggage</h4>
        <div class="text-2xl font-bold">{{ stats.totalWeight }}kg</div>
      </div>
      <div class="bg-muted p-4 rounded-lg">
        <h4 class="font-semibold mb-2 text-sm">✈️ Capacity</h4>
        <div class="text-lg font-bold">
          {{ Math.round((stats.occupiedSeats / stats.totalSeats) * 100) }}%
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h4 class="font-semibold">Boarding Groups</h4>
      <div class="flex gap-4">
        <div
          class="flex-1 p-3 bg-green-100 dark:bg-green-900/20 rounded border border-green-300 dark:border-green-700"
        >
          <div class="text-sm text-muted-foreground">Business</div>
          <div class="text-2xl font-bold">{{ stats.groupA }}</div>
          <button
            @click="boardGroup('A')"
            :disabled="stats.groupA === 0"
            class="mt-2 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎫 Board
          </button>
        </div>
        <div
          class="flex-1 p-3 bg-blue-100 dark:bg-blue-900/20 rounded border border-blue-300 dark:border-blue-700"
        >
          <div class="text-sm text-muted-foreground">Premium</div>
          <div class="text-2xl font-bold">{{ stats.groupB }}</div>
          <button
            @click="boardGroup('B')"
            :disabled="stats.groupB === 0"
            class="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎫 Board
          </button>
        </div>
        <div
          class="flex-1 p-3 bg-orange-100 dark:bg-orange-900/20 rounded border border-orange-300 dark:border-orange-700"
        >
          <div class="text-sm text-muted-foreground">Eco</div>
          <div class="text-2xl font-bold">{{ stats.groupC }}</div>
          <button
            @click="boardGroup('C')"
            :disabled="stats.groupC === 0"
            class="mt-2 px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎫 Board
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h4 class="font-semibold">🛂 Check-in Desk</h4>
      <div class="space-y-2">
        <AirportPassenger
          v-for="passenger in passengersList"
          :key="passenger.id"
          :id="passenger.id"
          :name="passenger.name"
          :fare-class="passenger.fareClass"
        />
      </div>
    </div>

    <div class="text-xs text-muted-foreground space-y-1 border-t pt-4">
      <div><strong>💡 Metaphor:</strong></div>
      <div>• <strong>Desk</strong> = Airport check-in desk</div>
      <div>
        • <strong>Check-in</strong> = Passenger registers with their data (name,
        seat, baggage)
      </div>
      <div>
        • <strong>Check-out</strong> = Passenger leaves the desk (component
        unmounted)
      </div>
      <div>
        • <strong>Extra context</strong> = Shared flight info (number, gate,
        time)
      </div>
      <div>
        • <strong>Registry</strong> = List of registered passengers sorted by
        group
      </div>
    </div>
  </div>
</template>
```
  :::
::

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-check-in/useCheckIn.ts"}

```ts [src/composables/use-check-in/useCheckIn.ts]
import {
  ref,
  provide,
  inject,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  watch,
  computed,
  triggerRef,
  nextTick,
  type InjectionKey,
  type Ref,
  type ComputedRef,
} from "vue";

export type DeskEventType = "check-in" | "check-out" | "update" | "clear";

export type DeskEventCallback<T = any> = (payload: {
  id?: string | number;
  data?: T;
  timestamp: number;
}) => void;

export interface CheckInItem<T = any> {
  id: string | number;
  data: T;
  timestamp?: number;
  meta?: Record<string, any>;
}

export interface CheckInDesk<
  T = any,
  TContext extends Record<string, any> = {},
> {
  registry: Ref<Map<string | number, CheckInItem<T>>>;
  checkIn: (
    id: string | number,
    data: T,
    meta?: Record<string, any>,
  ) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: {
    sortBy?: keyof T | "timestamp" | string;
    order?: "asc" | "desc";
    group?: string;
    filter?: (item: CheckInItem<T>) => boolean;
  }) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: Record<string, any> }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => void;

  on: (event: DeskEventType, callback: DeskEventCallback<T>) => () => void;

  off: (event: DeskEventType, callback: DeskEventCallback<T>) => void;

  emit: (
    event: DeskEventType,
    payload: { id?: string | number; data?: T },
  ) => void;

  getGroup: (
    group: string,
    options?: {
      sortBy?: keyof T | "timestamp" | string;
      order?: "asc" | "desc";
    },
  ) => ComputedRef<CheckInItem<T>[]>;

  items: ComputedRef<CheckInItem<T>[]>;
}

export interface CheckInDeskOptions<
  T = any,
  TContext extends Record<string, any> = {},
> {
  context?: TContext;

  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;

  onCheckIn?: (id: string | number, data: T) => void;

  onBeforeCheckOut?: (id: string | number) => void | boolean;

  onCheckOut?: (id: string | number) => void;

  debug?: boolean;
}

export interface CheckInOptions<T = any> {
  required?: boolean;

  autoCheckIn?: boolean;

  id?: string | number;

  data?: T | (() => T) | (() => Promise<T>);

  generateId?: () => string | number;

  watchData?: boolean;

  shallow?: boolean;

  watchCondition?: (() => boolean) | Ref<boolean>;

  meta?: Record<string, any>;

  group?: string;

  position?: number;

  priority?: number;

  debug?: boolean;
}

const NoOpDebug = (_message: string, ..._args: any[]) => {};

const Debug = (message: string, ...args: any[]) => {
  console.log(`[useCheckIn] ${message}`, ...args);
};

const instanceIdMap = new WeakMap<object, string>();

const customIdMap = new Map<string, string>();
let instanceCounter = 0;

export const useCheckIn = <
  T = any,
  TContext extends Record<string, any> = {},
>() => {
  const createDeskContext = <
    T = any,
    TContext extends Record<string, any> = {},
  >(
    options?: CheckInDeskOptions<T, TContext>,
  ): CheckInDesk<T, TContext> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(
      new Map(),
    ) as Ref<Map<string | number, CheckInItem<T>>>;

    const debug = options?.debug ? Debug : NoOpDebug;

    const eventListeners = new Map<DeskEventType, Set<DeskEventCallback<T>>>();

    const emit = (
      event: DeskEventType,
      payload: { id?: string | number; data?: T },
    ) => {
      const listeners = eventListeners.get(event);
      if (!listeners) return;

      const eventPayload = {
        ...payload,
        timestamp: Date.now(),
      };

      debug(`[Event] ${event}`, eventPayload);
      listeners.forEach((callback) => callback(eventPayload));
    };

    const on = (event: DeskEventType, callback: DeskEventCallback<T>) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      eventListeners.get(event)!.add(callback);

      debug(
        `[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`,
      );

      return () => off(event, callback);
    };

    const off = (event: DeskEventType, callback: DeskEventCallback<T>) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        debug(
          `[Event] Listener removed for '${event}', remaining: ${listeners.size}`,
        );
      }
    };

    const checkIn = (
      id: string | number,
      data: T,
      meta?: Record<string, any>,
    ): boolean => {
      debug("checkIn", { id, data, meta });

      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug("checkIn cancelled by onBeforeCheckIn", id);
          return false;
        }
      }

      registry.value.set(id, {
        id,
        data: data as any,
        timestamp: Date.now(),
        meta,
      });
      triggerRef(registry);

      emit("check-in", { id, data });

      options?.onCheckIn?.(id, data);

      if (options?.debug) {
        debug("Registry state after check-in:", {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const checkOut = (id: string | number): boolean => {
      debug("checkOut", id);

      const existed = registry.value.has(id);
      if (!existed) return false;

      if (options?.onBeforeCheckOut) {
        const result = options.onBeforeCheckOut(id);
        if (result === false) {
          debug("checkOut cancelled by onBeforeCheckOut", id);
          return false;
        }
      }

      registry.value.delete(id);
      triggerRef(registry);

      emit("check-out", { id });

      options?.onCheckOut?.(id);

      if (options?.debug) {
        debug("Registry state after check-out:", {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const get = (id: string | number) => registry.value.get(id);

    const getAll = (options?: {
      sortBy?: keyof T | "timestamp" | string;
      order?: "asc" | "desc";
      group?: string;
      filter?: (item: CheckInItem<T>) => boolean;
    }) => {
      let items = Array.from(registry.value.values());

      if (options?.group !== undefined) {
        items = items.filter((item) => item.meta?.group === options.group);
      }

      if (options?.filter) {
        items = items.filter(options.filter);
      }

      if (!options?.sortBy) return items;

      return items.sort((a, b) => {
        let aVal: any, bVal: any;

        if (options.sortBy === "timestamp") {
          aVal = a.timestamp || 0;
          bVal = b.timestamp || 0;
        } else if (
          typeof options.sortBy === "string" &&
          options.sortBy.startsWith("meta.")
        ) {
          const metaKey = options.sortBy.slice(5);
          aVal = a.meta?.[metaKey];
          bVal = b.meta?.[metaKey];
        } else {
          const key = options.sortBy as keyof T;
          aVal = a.data[key];
          bVal = b.data[key];
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return options.order === "desc" ? -comparison : comparison;
      });
    };

    const update = (id: string | number, data: Partial<T>): boolean => {
      const existing = registry.value.get(id);
      if (!existing) {
        debug("update failed: item not found", id);
        return false;
      }

      if (typeof existing.data === "object" && typeof data === "object") {
        const previousData = { ...existing.data };

        Object.assign(existing.data as object, data);
        triggerRef(registry);

        emit("update", { id, data: existing.data });

        if (options?.debug) {
          debug("update diff:", {
            id,
            before: previousData,
            after: existing.data,
            changes: data,
          });
        }

        return true;
      }

      return false;
    };

    const has = (id: string | number) => registry.value.has(id);

    const clear = () => {
      debug("clear");
      const count = registry.value.size;
      registry.value.clear();
      triggerRef(registry);

      emit("clear", {});

      debug(`Cleared ${count} items from registry`);
    };

    const checkInMany = (
      items: Array<{
        id: string | number;
        data: T;
        meta?: Record<string, any>;
      }>,
    ) => {
      debug("checkInMany", items.length, "items");
      items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
    };

    const checkOutMany = (ids: Array<string | number>) => {
      debug("checkOutMany", ids.length, "items");
      ids.forEach((id) => checkOut(id));
    };

    const updateMany = (
      updates: Array<{ id: string | number; data: Partial<T> }>,
    ) => {
      debug("updateMany", updates.length, "items");
      updates.forEach(({ id, data }) => update(id, data));
    };

    const getGroup = (
      group: string,
      sortOptions?: {
        sortBy?: keyof T | "timestamp" | string;
        order?: "asc" | "desc";
      },
    ) => {
      return computed(() => getAll({ ...sortOptions, group }));
    };

    const items = computed(() => getAll());

    return {
      registry,
      checkIn,
      checkOut,
      get,
      getAll,
      update,
      has,
      clear,
      checkInMany,
      checkOutMany,
      updateMany,
      on,
      off,
      emit,
      getGroup,
      items,
    };
  };

  const createDesk = (options?: CheckInDeskOptions<T, TContext>) => {
    const DeskInjectionKey = Symbol("CheckInDesk") as InjectionKey<
      CheckInDesk<T, TContext> & TContext
    >;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);

    if (options?.debug) {
      Debug("Desk opened with injection key:", DeskInjectionKey.description);
    }

    return {
      desk: fullContext,
      DeskInjectionKey,
    };
  };

  const checkIn = <
    TDesk extends CheckInDesk<T, TContext> & TContext = CheckInDesk<
      T,
      TContext
    > &
      TContext,
  >(
    parentDeskOrSymbol:
      | (CheckInDesk<T, TContext> & TContext)
      | InjectionKey<CheckInDesk<T, TContext> & TContext>
      | null
      | undefined,
    checkInOptions?: CheckInOptions<T>,
  ) => {
    const debug = checkInOptions?.debug ? Debug : NoOpDebug;

    if (!parentDeskOrSymbol) {
      debug("[useCheckIn] No parent desk provided - skipping check-in");

      return {
        desk: null as TDesk | null,
        checkOut: () => {},
        updateSelf: () => {},
      };
    }

    let desk: (CheckInDesk<T, TContext> & TContext) | null | undefined;

    if (typeof parentDeskOrSymbol === "symbol") {
      desk = inject(parentDeskOrSymbol);
      if (!desk) {
        debug("[useCheckIn] Could not inject desk from symbol");

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else {
      desk = parentDeskOrSymbol;
    }

    const itemId = checkInOptions?.id || `item-${Date.now()}-${Math.random()}`;
    let isCheckedIn = ref(false);
    let conditionStopHandle: (() => void) | null = null;

    const getCurrentData = async (): Promise<T> => {
      if (!checkInOptions?.data) return undefined as T;

      const dataValue =
        typeof checkInOptions.data === "function"
          ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
          : checkInOptions.data;

      return dataValue instanceof Promise ? await dataValue : dataValue;
    };

    const performCheckIn = async (): Promise<boolean> => {
      if (isCheckedIn.value) return true;

      const data = await getCurrentData();

      const meta = {
        ...checkInOptions?.meta,
        ...(checkInOptions?.group !== undefined && {
          group: checkInOptions.group,
        }),
        ...(checkInOptions?.position !== undefined && {
          position: checkInOptions.position,
        }),
        ...(checkInOptions?.priority !== undefined && {
          priority: checkInOptions.priority,
        }),
      };

      const success = desk!.checkIn(itemId, data, meta);

      if (success) {
        isCheckedIn.value = true;
        debug(`[useCheckIn] Checked in: ${itemId}`, data);
      } else {
        debug(`[useCheckIn] Check-in cancelled for: ${itemId}`);
      }

      return success;
    };

    const performCheckOut = () => {
      if (!isCheckedIn.value) return;

      desk!.checkOut(itemId);
      isCheckedIn.value = false;

      debug(`[useCheckIn] Checked out: ${itemId}`);
    };

    if (checkInOptions?.watchCondition) {
      const condition = checkInOptions.watchCondition;

      const shouldBeCheckedIn =
        typeof condition === "function" ? condition() : condition.value;
      if (shouldBeCheckedIn && checkInOptions?.autoCheckIn !== false) {
        performCheckIn();
      }

      conditionStopHandle = watch(
        () => (typeof condition === "function" ? condition() : condition.value),
        async (shouldCheckIn) => {
          if (shouldCheckIn && !isCheckedIn.value) {
            await performCheckIn();
          } else if (!shouldCheckIn && isCheckedIn.value) {
            performCheckOut();
          }
        },
      );
    } else if (checkInOptions?.autoCheckIn !== false) {
      performCheckIn();
    }

    let watchStopHandle: (() => void) | null = null;
    if (checkInOptions?.watchData && checkInOptions?.data) {
      const watchOptions = checkInOptions.shallow
        ? { deep: false }
        : { deep: true };

      watchStopHandle = watch(
        () => {
          if (!checkInOptions.data) return undefined;
          return typeof checkInOptions.data === "function"
            ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
            : checkInOptions.data;
        },
        async (newData) => {
          if (isCheckedIn.value && newData !== undefined) {
            const resolvedData =
              newData instanceof Promise ? await newData : newData;
            desk!.update(itemId, resolvedData);

            debug(`[useCheckIn] Updated data for: ${itemId}`, resolvedData);
          }
        },
        watchOptions,
      );
    }

    onUnmounted(() => {
      performCheckOut();

      if (watchStopHandle) {
        watchStopHandle();
      }

      if (conditionStopHandle) {
        conditionStopHandle();
      }
    });

    return {
      desk: desk as TDesk,
      checkOut: performCheckOut,
      updateSelf: async (newData?: T) => {
        if (!isCheckedIn.value) return;

        const data = newData !== undefined ? newData : await getCurrentData();
        desk!.update(itemId, data);

        debug(`[useCheckIn] Manual update for: ${itemId}`, data);
      },
    };
  };

  const generateId = (prefix = "item"): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      const id = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join(
        "",
      );
      return `${prefix}-${id}`;
    }

    const isDev =
      typeof process !== "undefined" && process.env?.NODE_ENV === "development";
    if (isDev) {
      console.warn(
        "[useCheckIn] crypto API not available, using Math.random fallback. " +
          "Consider upgrading to a modern environment.",
      );
    }
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${timestamp}-${random}`;
  };

  const memoizedId = (
    instanceOrId: object | string | number | null | undefined,
    prefix = "item",
  ): string => {
    if (typeof instanceOrId === "string" || typeof instanceOrId === "number") {
      const key = `${prefix}-${instanceOrId}`;
      let id = customIdMap.get(key);
      if (!id) {
        id = String(instanceOrId);
        customIdMap.set(key, id);
      }
      return id;
    }

    if (instanceOrId && typeof instanceOrId === "object") {
      let id = instanceIdMap.get(instanceOrId);
      if (!id) {
        id = `${prefix}-${++instanceCounter}`;
        instanceIdMap.set(instanceOrId, id);
      }
      return id;
    }

    const isDev =
      typeof process !== "undefined" && process.env?.NODE_ENV === "development";
    if (isDev) {
      console.warn(
        `[useCheckIn] memoizedId: no instance or custom ID provided. ` +
          `Generated cryptographically secure ID. ` +
          `Consider passing getCurrentInstance() or a custom ID (nanoid, uuid, props.id, etc.).`,
      );
    }
    return generateId(prefix);
  };

  const standaloneDesk = <T = any,>(options?: CheckInDeskOptions<T>) => {
    return createDeskContext<T>(options);
  };

  const isCheckedIn = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    id: string | number | Ref<string | number>,
  ): ComputedRef<boolean> => {
    return computed(() => {
      const itemId = typeof id === "object" && "value" in id ? id.value : id;
      return desk.has(itemId);
    });
  };

  const getRegistry = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    options?: { sortBy?: keyof T | "timestamp"; order?: "asc" | "desc" },
  ): ComputedRef<CheckInItem<T>[]> => {
    return computed(() => desk.getAll(options));
  };

  return {
    createDesk,
    checkIn,
    generateId,
    memoizedId,
    standaloneDesk,
    isCheckedIn,
    getRegistry,
  };
};
```
:::

## API
::hr-underline
::

  ### Returns

Return both the desk and its symbol for children to inject

| Property | Type | Description |
|----------|------|-------------|
| `createDesk`{.primary .text-primary} | `any` | — |
| `checkIn`{.primary .text-primary} | `any` | — |
| `generateId`{.primary .text-primary} | `any` | — |
| `memoizedId`{.primary .text-primary} | `any` | — |
| `standaloneDesk`{.primary .text-primary} | `any` | — |
| `isCheckedIn`{.primary .text-primary} | `Ref<any>` | — |
| `getRegistry`{.primary .text-primary} | `any` | — |

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `DeskEventType`{.primary .text-primary} | `type` | — |
| `DeskEventCallback`{.primary .text-primary} | `type` | — |
| `CheckInItem`{.primary .text-primary} | `interface` | — |
| `CheckInDesk`{.primary .text-primary} | `interface` | — |
| `CheckInDeskOptions`{.primary .text-primary} | `interface` | — |
| `CheckInOptions`{.primary .text-primary} | `interface` | — |

---

  ## Examples
  ::hr-underline
  ::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <form-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import FormContainer from "./FormContainer.vue";
import FormField from "./FormField.vue";

const formData = ref({
  name: "",
  email: "",
  password: "",
  message: "",
});

const submittedData = ref<Record<string, any> | null>(null);

const handleSubmit = (values: Record<string, any>) => {
  console.log("Form submitted:", values);
  submittedData.value = values;
};

const handleChange = (values: Record<string, any>) => {
  console.log("Form changed:", values);
};

const validateEmail = (value: string) => {
  if (value && !value.includes("@")) {
    return "Invalid email format";
  }
};

const validatePassword = (value: string) => {
  if (value && value.length < 6) {
    return "Password must be at least 6 characters";
  }
};

const resetForm = () => {
  formData.value = {
    name: "",
    email: "",
    password: "",
    message: "",
  };
  submittedData.value = null;
};
</script>

<template>
  <div class="demo-container">
    <h2>Form Pattern Demo</h2>
    <p>
      Les FormField s'enregistrent et sont validés automatiquement par le
      FormContainer.
    </p>

    <FormContainer @submit="handleSubmit" @change="handleChange">
      <FormField
        id="name"
        name="name"
        label="Name"
        type="text"
        v-model="formData.name"
        required
        :position="1"
      />

      <FormField
        id="email"
        name="email"
        label="Email"
        type="email"
        v-model="formData.email"
        required
        :position="2"
        :validate="validateEmail"
      />

      <FormField
        id="password"
        name="password"
        label="Password"
        type="password"
        v-model="formData.password"
        required
        :position="3"
        :validate="validatePassword"
      />

      <FormField
        id="message"
        name="message"
        label="Message"
        type="textarea"
        v-model="formData.message"
        :position="4"
      />

      <template #actions>
        <div class="actions">
          <button type="submit" class="submit-button">Submit</button>
          <button type="button" class="reset-button" @click="resetForm">
            Reset
          </button>
        </div>
      </template>
    </FormContainer>

    <div class="state-display">
      <h3>Current Form Data:</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>

      <div v-if="submittedData" class="submitted-data">
        <h3>Submitted Data:</h3>
        <pre>{{ JSON.stringify(submittedData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.submit-button,
.reset-button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button {
  background: #3b82f6;
  color: white;
}

.submit-button:hover {
  background: #2563eb;
}

.reset-button {
  background: #e5e7eb;
  color: #374151;
}

.reset-button:hover {
  background: #d1d5db;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.state-display pre {
  font-family: monospace;
  font-size: 0.75rem;
  margin: 0.5rem 0;
  white-space: pre-wrap;
  background: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.submitted-data {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <breadcrumb-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import BreadcrumbContainer from "./BreadcrumbContainer.vue";
import BreadcrumbItem from "./BreadcrumbItem.vue";

const currentPath = ref(["home", "projects", "assembler-ui"]);

const navigateTo = (segment: string) => {
  console.log("Navigate to:", segment);
  const index = currentPath.value.indexOf(segment);
  if (index !== -1) {
    currentPath.value = currentPath.value.slice(0, index + 1);
  }
};

const goToRoot = () => {
  currentPath.value = ["home"];
};

const addLevel = () => {
  currentPath.value.push(`level-${currentPath.value.length}`);
};
</script>

<template>
  <div class="demo-container">
    <h2>Breadcrumb Pattern Demo</h2>
    <p>
      Les BreadcrumbItem s'enregistrent automatiquement dans le
      BreadcrumbContainer.
    </p>

    <BreadcrumbContainer separator="›">
      <BreadcrumbItem
        v-for="(segment, index) in currentPath"
        :key="segment"
        :id="segment"
        :label="segment.charAt(0).toUpperCase() + segment.slice(1)"
        :href="`/${currentPath.slice(0, index + 1).join('/')}`"
        :icon="index === 0 ? '🏠' : undefined"
        :disabled="index === currentPath.length - 1"
        :position="index"
        @click="navigateTo(segment)"
      />
    </BreadcrumbContainer>

    <div class="controls">
      <button @click="goToRoot" class="control-button">Reset to Home</button>
      <button @click="addLevel" class="control-button">Add Level</button>
    </div>

    <div class="state-display">
      <h3>Current Path:</h3>
      <pre>{{ currentPath.join(" > ") }}</pre>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.control-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.control-button:hover {
  background: #f3f4f6;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.state-display pre {
  font-family: monospace;
  margin: 0;
  white-space: pre-wrap;
}
</style>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <context-menu-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import ContextMenuProvider from "./ContextMenuProvider.vue";
import ContextMenuItem from "./ContextMenuItem.vue";

const showMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const lastAction = ref("");

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault();
  menuX.value = event.clientX;
  menuY.value = event.clientY;
  showMenu.value = true;
};

const closeMenu = () => {
  showMenu.value = false;
};

const handleAction = (action: string) => {
  lastAction.value = action;
  console.log("Action:", action);
};
</script>

<template>
  <div class="demo-container">
    <h2>Context Menu Pattern Demo</h2>
    <p>
      Faites un clic droit dans la zone ci-dessous pour afficher le menu
      contextuel.
    </p>

    <ContextMenuProvider
      :show="showMenu"
      :x="menuX"
      :y="menuY"
      @close="closeMenu"
    >
      <ContextMenuItem
        id="open"
        label="Open"
        icon="📂"
        :position="1"
        @click="handleAction('open')"
      />
      <ContextMenuItem
        id="copy"
        label="Copy"
        icon="📋"
        :position="2"
        @click="handleAction('copy')"
      />
      <ContextMenuItem
        id="paste"
        label="Paste"
        icon="📄"
        :position="3"
        @click="handleAction('paste')"
      />
      <ContextMenuItem
        id="rename"
        label="Rename"
        icon="✏️"
        :position="4"
        @click="handleAction('rename')"
      />

      <ContextMenuItem
        id="delete"
        label="Delete"
        icon="🗑️"
        danger
        :position="1"
        @click="handleAction('delete')"
      />
    </ContextMenuProvider>

    <div class="context-area" @contextmenu="handleContextMenu">
      Right-click here to open the context menu
    </div>

    <div class="state-display">
      <h3>Last Action:</h3>
      <pre>{{ lastAction || "None" }}</pre>
      <p class="hint">Menu Position: ({{ menuX }}, {{ menuY }})</p>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.context-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  border: 2px dashed #d1d5db;
  border-radius: 0.375rem;
  background: #f9fafb;
  cursor: context-menu;
  user-select: none;
  transition: all 0.2s;
  font-size: 1.125rem;
  color: #6b7280;
}

.context-area:hover {
  border-color: #9ca3af;
  background: #f3f4f6;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.state-display pre {
  font-family: monospace;
  margin: 0.5rem 0;
}

.state-display .hint {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <notification-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import NotificationProvider from "./NotificationProvider.vue";
import NotificationItem from "./NotificationItem.vue";

const notifications = ref<
  Array<{
    id: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    duration: number;
  }>
>([]);

let notificationCounter = 0;

const addNotification = (
  type: "info" | "success" | "warning" | "error",
  duration = 5000,
) => {
  const id = `notif-${++notificationCounter}`;
  const messages = {
    info: "This is an informational message",
    success: "Operation completed successfully!",
    warning: "Please be careful with this action",
    error: "An error occurred during the operation",
  };

  notifications.value.push({
    id,
    message: messages[type],
    type,
    duration,
  });

  if (duration > 0) {
    setTimeout(() => {
      const index = notifications.value.findIndex((n) => n.id === id);
      if (index !== -1) {
        notifications.value.splice(index, 1);
      }
    }, duration);
  }
};

const handleDismiss = (id: string) => {
  console.log("Notification dismissed:", id);
  const index = notifications.value.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};
</script>

<template>
  <div class="demo-container">
    <h2>Notification Pattern Demo</h2>
    <p>
      Les NotificationItem s'enregistrent et sont auto-removed après leur durée.
    </p>

    <NotificationProvider position="top-right">
      <NotificationItem
        v-for="notif in notifications"
        :key="notif.id"
        :id="notif.id"
        :message="notif.message"
        :type="notif.type"
        :duration="notif.duration"
        @dismiss="handleDismiss(notif.id)"
      />
    </NotificationProvider>

    <div class="controls">
      <h3>Add Notification:</h3>
      <div class="button-group">
        <button @click="addNotification('info')" class="btn btn-info">
          Info
        </button>
        <button @click="addNotification('success')" class="btn btn-success">
          Success
        </button>
        <button @click="addNotification('warning')" class="btn btn-warning">
          Warning
        </button>
        <button @click="addNotification('error')" class="btn btn-error">
          Error
        </button>
      </div>
      <button @click="addNotification('info', 0)" class="btn btn-persistent">
        Add Persistent (no auto-dismiss)
      </button>
    </div>

    <div class="state-display">
      <h3>Active Notifications:</h3>
      <pre>{{ notifications.length }} notification(s)</pre>
      <ul v-if="notifications.length > 0">
        <li v-for="notif in notifications" :key="notif.id">
          {{ notif.type }}: {{ notif.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.controls h3 {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin: 0;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  font-weight: 500;
}

.btn-info {
  background: #3b82f6;
}

.btn-info:hover {
  background: #2563eb;
}

.btn-success {
  background: #22c55e;
}

.btn-success:hover {
  background: #16a34a;
}

.btn-warning {
  background: #f59e0b;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-error {
  background: #ef4444;
}

.btn-error:hover {
  background: #dc2626;
}

.btn-persistent {
  background: #6b7280;
}

.btn-persistent:hover {
  background: #4b5563;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.state-display pre {
  font-family: monospace;
  margin: 0.5rem 0;
}

.state-display ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.state-display li {
  font-family: monospace;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}
</style>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <accordion-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed, provide } from "vue";
import { useCheckIn } from "../useCheckIn";
import AccordionItem from "./AccordionDemoItem.vue";

interface AccordionItemData {
  title: string;
  open?: boolean;
}

const { createDesk } = useCheckIn<AccordionItemData>();

const openItems = ref<Set<string | number>>(new Set());
const allowMultiple = ref(false);

const { desk, DeskInjectionKey: accordionDesk } = createDesk({
  context: {
    openItems,
    toggle: (id: string | number) => {
      if (openItems.value.has(id)) {
        openItems.value.delete(id);
      } else {
        if (!allowMultiple.value) {
          openItems.value.clear();
        }
        openItems.value.add(id);
      }

      openItems.value = new Set(openItems.value);
    },
    isOpen: (id: string | number) => openItems.value.has(id),
  },
  onCheckIn: (id, data) => {
    if (data.open) {
      if (!allowMultiple.value) {
        openItems.value.clear();
      }
      openItems.value.add(id);
      openItems.value = new Set(openItems.value);
    }
    return true;
  },
});

provide("accordionDesk", { deskSymbol: accordionDesk });

const itemCount = computed(() => desk.getAll().length);
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useCheckIn - Accordion Demo</h2>
      <p class="text-muted-foreground">
        Collapsible sections with check-in desk state management
      </p>
    </div>

    <div class="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <label class="flex items-center gap-2">
        <input v-model="allowMultiple" type="checkbox" class="rounded" />
        <span class="text-sm font-medium">Allow multiple open</span>
      </label>
      <span class="text-sm text-muted-foreground"
        >{{ itemCount }} items registered</span
      >
    </div>

    <div class="border border-border rounded-lg divide-y divide-border">
      <AccordionItem id="item1" title="What is useCheckIn?" :open="true">
        <p class="text-muted-foreground">
          <strong>useCheckIn</strong> is a generic composable for managing
          parent-child component relationships using Vue's provide/inject
          pattern. Parent components open a "check-in desk" where children check
          in with their data, like passengers at an airport.
        </p>
      </AccordionItem>

      <AccordionItem id="item2" title="How does it work?">
        <ul class="space-y-2 text-muted-foreground list-disc list-inside">
          <li>
            Parent component opens a check-in desk using
            <code>createDesk()</code>
          </li>
          <li>
            Child components check in using <code>checkIn()</code> with
            auto-registration
          </li>
          <li>Desk maintains a reactive Map of all checked-in items</li>
          <li>
            Changes propagate automatically through Vue's reactivity system
          </li>
        </ul>
      </AccordionItem>

      <AccordionItem id="item3" title="What are the benefits?">
        <div class="space-y-2 text-muted-foreground">
          <p><strong>Benefits include:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li>Type-safe with full TypeScript support</li>
            <li>Auto-cleanup when components unmount</li>
            <li>Flexible extra context for custom logic</li>
            <li>Automatic reactivity updates</li>
            <li>Reusable across different component types</li>
          </ul>
        </div>
      </AccordionItem>

      <AccordionItem id="item4" title="Common use cases">
        <div class="space-y-2 text-muted-foreground">
          <p>Common patterns that benefit from this approach:</p>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li>Tabs / Tab Panels</li>
            <li>Accordions / Collapsible sections</li>
            <li>Dropdown menus with items</li>
            <li>Form field registration</li>
            <li>Wizard steps</li>
            <li>List items with selection state</li>
          </ul>
        </div>
      </AccordionItem>
    </div>

    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <p>
          <strong>Open Items:</strong>
          {{ Array.from(openItems).join(", ") || "None" }}
        </p>
        <p><strong>Allow Multiple:</strong> {{ allowMultiple }}</p>
        <p>
          <strong>All Items:</strong>
          {{
            desk
              .getAll()
              .map((i) => `${i.id}: "${i.data.title}"`)
              .join(", ")
          }}
        </p>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <tabs-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed, provide, type Ref } from "vue";
import { useCheckIn } from "../useCheckIn";
import TabPanel from "./TabPanel.vue";

interface TabItemData {
  label: string;
  disabled?: boolean;
  icon?: string;
}

const activeTab = ref<string>("tab1");
const tabCount = ref(0);

const { createDesk } = useCheckIn<
  TabItemData,
  {
    activeTab: Ref<string>;
    setActive: (id: string) => void;
  }
>();

const { desk, DeskInjectionKey: tabsDesk } = createDesk({
  context: {
    activeTab,
    setActive: (id: string) => {
      const tab = desk.get(id as string);
      if (tab && !tab.data.disabled) {
        activeTab.value = id as string;
      }
    },
  },
});

desk.on("check-in", (id, data) => {
  tabCount.value++;
  if (tabCount.value === 1) {
    activeTab.value = id as string;
  }
});

desk.on("check-out", (id) => {
  tabCount.value--;
});

provide("tabsDesk", { deskSymbol: tabsDesk });

const allTabs = computed(() => desk.getAll());
const activeTabData = computed(() => desk.get(activeTab.value));
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useCheckIn - Tabs Demo</h2>
      <p class="text-muted-foreground">
        Tabs system using parent provide / child inject pattern
      </p>
    </div>

    <div class="border-b border-border">
      <div class="flex gap-2">
        <button
          v-for="tab in allTabs"
          :key="tab.id"
          :class="[
            'px-4 py-2 font-medium transition-colors border-b-2',
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
            tab.data.disabled && 'opacity-50 cursor-not-allowed',
          ]"
          :disabled="tab.data.disabled"
          @click="desk.setActive(tab.id as string)"
        >
          <span v-if="tab.data.icon" class="mr-2">{{ tab.data.icon }}</span>
          {{ tab.data.label }}
        </button>
      </div>
    </div>

    <div class="p-4 border border-border rounded-lg">
      <TabPanel id="tab1" label="Profile" icon="👤">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Profile Settings</h3>
          <p class="text-muted-foreground">Manage your profile information.</p>
        </div>
      </TabPanel>

      <TabPanel id="tab2" label="Settings" icon="⚙️">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Settings</h3>
          <p class="text-muted-foreground">Configure your preferences.</p>
        </div>
      </TabPanel>

      <TabPanel id="tab3" label="Security" icon="🔒">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Security</h3>
          <p class="text-muted-foreground">Keep your account secure.</p>
        </div>
      </TabPanel>
    </div>

    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <p><strong>Active Tab:</strong> {{ activeTab }}</p>
        <p><strong>Active Label:</strong> {{ activeTabData?.data.label }}</p>
        <p><strong>Total Tabs:</strong> {{ tabCount }}</p>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <toolbar-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import ToolbarContainer from "./ToolbarContainer.vue";
import ToolbarButton from "./ToolbarButton.vue";

const showSearch = ref(false);
const isEditMode = ref(false);

const handleSave = () => {
  console.log("Save clicked");
};

const handleUndo = () => {
  console.log("Undo clicked");
};

const handleRedo = () => {
  console.log("Redo clicked");
};

const toggleSearch = () => {
  showSearch.value = !showSearch.value;
};

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const handleSettings = () => {
  console.log("Settings clicked");
};
</script>

<template>
  <div class="demo-container">
    <h2>Toolbar Pattern Demo</h2>
    <p>
      Les ToolbarButton sont dans le slot de ToolbarContainer et s'enregistrent
      automatiquement.
    </p>

    <ToolbarContainer desk-id="main-toolbar">
      <ToolbarButton
        id="save"
        label="Save"
        icon="💾"
        group="start"
        :position="1"
        @click="handleSave"
      />
      <ToolbarButton
        id="undo"
        label="Undo"
        icon="↶"
        group="start"
        :position="2"
        :disabled="!isEditMode"
        @click="handleUndo"
      />
      <ToolbarButton
        id="redo"
        label="Redo"
        icon="↷"
        group="start"
        :position="3"
        :disabled="!isEditMode"
        @click="handleRedo"
      />

      <ToolbarButton
        id="edit"
        :label="isEditMode ? 'View Mode' : 'Edit Mode'"
        icon="✏️"
        group="main"
        :position="1"
        @click="toggleEditMode"
      />

      <ToolbarButton
        id="search"
        :label="showSearch ? 'Hide Search' : 'Search'"
        icon="🔍"
        group="end"
        :position="1"
        @click="toggleSearch"
      />
      <ToolbarButton
        id="settings"
        label="Settings"
        icon="⚙️"
        group="end"
        :position="2"
        @click="handleSettings"
      />
    </ToolbarContainer>

    <div class="state-display">
      <h3>État actuel:</h3>
      <ul>
        <li>Edit Mode: {{ isEditMode ? "ON" : "OFF" }}</li>
        <li>Search: {{ showSearch ? "Visible" : "Hidden" }}</li>
        <li>Undo/Redo: {{ isEditMode ? "Enabled" : "Disabled" }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.state-display ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.state-display li {
  padding: 0.25rem 0;
  font-family: monospace;
}
</style>
```
  :::
::

::tip
You can copy and adapt this template for any composable documentation.
::

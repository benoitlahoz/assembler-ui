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
  onUnmounted,
  watch,
  computed,
  triggerRef,
  type InjectionKey,
  type Ref,
  type ComputedRef,
} from "vue";
import type { CheckInPlugin } from "./types";

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
  readonly registry: Ref<Map<string | number, CheckInItem<T>>>;
  checkIn: (
    id: string | number,
    data: T,
    meta?: Record<string, any>,
  ) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: {
    sortBy?: keyof T | "timestamp";
    order?: "asc" | "desc";
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
  plugins?: CheckInPlugin<T>[];
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
  let debug = NoOpDebug;

  const createDeskContext = <
    T = any,
    TContext extends Record<string, any> = {},
  >(
    options?: CheckInDeskOptions<T, TContext>,
  ): CheckInDesk<T, TContext> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(
      new Map(),
    ) as Ref<Map<string | number, CheckInItem<T>>>;

    debug = options?.debug ? Debug : NoOpDebug;

    const eventListeners = new Map<DeskEventType, Set<DeskEventCallback<T>>>();

    const pluginCleanups: Array<() => void> = [];

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

      if (options?.plugins) {
        for (const plugin of options.plugins) {
          if (plugin.onBeforeCheckIn) {
            const result = plugin.onBeforeCheckIn(id, data);
            if (result === false) {
              debug("checkIn cancelled by plugin:", plugin.name);
              return false;
            }
          }
        }
      }

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

      if (options?.plugins) {
        for (const plugin of options.plugins) {
          if (plugin.onBeforeCheckOut) {
            const result = plugin.onBeforeCheckOut(id);
            if (result === false) {
              debug("checkOut cancelled by plugin:", plugin.name);
              return false;
            }
          }
        }
      }

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

    const getAll = (sortOptions?: {
      sortBy?: keyof T | "timestamp";
      order?: "asc" | "desc";
    }) => {
      const items = Array.from(registry.value.values());

      if (!sortOptions?.sortBy) return items;

      return items.sort((a, b) => {
        let aVal: any, bVal: any;

        if (sortOptions.sortBy === "timestamp") {
          aVal = a.timestamp || 0;
          bVal = b.timestamp || 0;
        } else {
          const key = sortOptions.sortBy as keyof T;
          aVal = a.data[key];
          bVal = b.data[key];
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortOptions.order === "desc" ? -comparison : comparison;
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

      pluginCleanups.forEach((cleanup) => cleanup());
      pluginCleanups.length = 0;

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

    const desk: CheckInDesk<T, TContext> = {
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
    };

    if (options?.plugins) {
      options.plugins.forEach((plugin) => {
        debug("Installing plugin:", plugin.name);

        if (plugin.install) {
          const cleanup = plugin.install(desk);
          if (cleanup) {
            pluginCleanups.push(cleanup);
          }
        }

        if (plugin.onCheckIn) {
          desk.on("check-in", ({ id, data }) => {
            plugin.onCheckIn!(id!, data!);
          });
        }

        if (plugin.onCheckOut) {
          desk.on("check-out", ({ id }) => {
            plugin.onCheckOut!(id!);
          });
        }

        if (plugin.methods) {
          Object.entries(plugin.methods).forEach(([name, method]) => {
            (desk as any)[name] = (...args: any[]) => method(desk, ...args);
          });
        }

        if (plugin.computed) {
          Object.entries(plugin.computed).forEach(([name, getter]) => {
            Object.defineProperty(desk, name, {
              get: () => getter(desk),
              enumerable: true,
              configurable: true,
            });
          });
        }
      });
    }

    return desk;
  };

  const createDesk = (
    injectionKey: string = "checkInDesk",
    options?: CheckInDeskOptions<T, TContext>,
  ) => {
    const DeskInjectionKey = Symbol(
      `CheckInDesk:${injectionKey}`,
    ) as InjectionKey<CheckInDesk<T, TContext> & TContext>;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);

    provide(injectionKey, DeskInjectionKey);

    if (options?.debug) {
      Debug("Desk opened with injection key:", injectionKey);
    }

    return {
      desk: fullContext,
      injectionKey,
    };
  };

  const checkIn = <
    TDesk extends CheckInDesk<T, TContext> & TContext = CheckInDesk<
      T,
      TContext
    > &
      TContext,
  >(
    parentDeskOrKey:
      | (CheckInDesk<T, TContext> & TContext)
      | InjectionKey<CheckInDesk<T, TContext> & TContext>
      | string
      | null
      | undefined,
    checkInOptions?: CheckInOptions<T>,
  ) => {
    if (!parentDeskOrKey) {
      debug("[useCheckIn] No parent desk provided - skipping check-in");

      return {
        desk: null as TDesk | null,
        checkOut: () => {},
        updateSelf: () => {},
      };
    }

    let desk: (CheckInDesk<T, TContext> & TContext) | null | undefined;

    if (typeof parentDeskOrKey === "symbol") {
      desk = inject(parentDeskOrKey);
      if (!desk) {
        debug("[useCheckIn] Could not inject desk from symbol");

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else if (typeof parentDeskOrKey === "string") {
      const injectionKey =
        inject<InjectionKey<CheckInDesk<T, TContext> & TContext>>(
          parentDeskOrKey,
        );
      if (!injectionKey) {
        debug("[useCheckIn] Could not find desk with key:", parentDeskOrKey);

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
      desk = inject(injectionKey);
      if (!desk) {
        debug("[useCheckIn] Could not inject desk from key:", parentDeskOrKey);

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else {
      desk = parentDeskOrKey;
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
      const success = desk!.checkIn(itemId, data, checkInOptions?.meta);

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

    debug(
      `[useCheckIn] memoizedId: no instance or custom ID provided. ` +
        `Generated cryptographically secure ID. ` +
        `Consider passing getCurrentInstance() or a custom ID (nanoid, uuid, props.id, etc.).`,
    );
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

  const clearIdCache = (resetCounter = false) => {
    const customIdCount = customIdMap.size;
    customIdMap.clear();

    if (resetCounter) {
      instanceCounter = 0;
    }

    debug(
      `[useCheckIn] Cleared ${customIdCount} custom IDs from cache` +
        (resetCounter ? " and reset counter" : ""),
    );
  };

  return {
    createDesk,
    checkIn,
    generateId,
    memoizedId,
    standaloneDesk,
    isCheckedIn,
    getRegistry,
    clearIdCache,
  };
};

export type { CheckInPlugin } from "./types";
export {
  createActiveItemPlugin,
  createValidationPlugin,
  createLoggerPlugin,
  createHistoryPlugin,
  type ValidationOptions,
  type LoggerOptions,
  type HistoryOptions,
  type HistoryEntry,
} from "./plugins";
```

```ts [src/composables/use-check-in/index.ts]
export { useCheckIn } from "./useCheckIn";

export type {
  DeskEventType,
  DeskEventCallback,
  CheckInItem,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
} from "./useCheckIn";

export type { CheckInPlugin } from "./types";

export {
  createActiveItemPlugin,
  createValidationPlugin,
  createLoggerPlugin,
  createHistoryPlugin,
} from "./plugins";

export type {
  ValidationOptions,
  LoggerOptions,
  HistoryOptions,
  HistoryEntry,
} from "./plugins";
```

```ts [src/composables/use-check-in/types.ts]
import type { CheckInDesk } from "./useCheckIn";

export interface CheckInPlugin<T = any> {
  name: string;

  version?: string;

  install?: (desk: CheckInDesk<T>) => void | (() => void);

  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;

  onCheckIn?: (id: string | number, data: T) => void;

  onBeforeCheckOut?: (id: string | number) => void | boolean;

  onCheckOut?: (id: string | number) => void;

  methods?: Record<string, (desk: CheckInDesk<T>, ...args: any[]) => any>;

  computed?: Record<string, (desk: CheckInDesk<T>) => any>;
}
```

```ts [src/composables/use-check-in/plugins/activeItem.ts]
import { ref } from "vue";
import type { CheckInPlugin } from "../types";
import type { CheckInDesk } from "../useCheckIn";

export const createActiveItemPlugin = <T = any,>(): CheckInPlugin<T> => ({
  name: "active-item",
  version: "1.0.0",

  install: (desk) => {
    const activeId = ref<string | number | null>(null);
    (desk as any).activeId = activeId;

    return () => {
      activeId.value = null;
    };
  },

  methods: {
    setActive(desk: CheckInDesk<T>, id: string | number | null) {
      const deskWithActive = desk as any;
      const previousId = deskWithActive.activeId?.value;

      if (id === null) {
        deskWithActive.activeId.value = null;

        desk.emit("active-changed" as any, {
          id: undefined,
          data: undefined,
        });
        return true;
      }

      if (!desk.has(id)) return false;

      deskWithActive.activeId.value = id;
      desk.emit("active-changed" as any, {
        id,
        data: desk.get(id)?.data,
      });
      return true;
    },

    getActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      const id = deskWithActive.activeId?.value;
      return id ? desk.get(id) : null;
    },

    clearActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      return deskWithActive.setActive?.(null);
    },
  },

  computed: {
    hasActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      return deskWithActive.activeId?.value !== null;
    },
  },
});
```

```ts [src/composables/use-check-in/plugins/example.ts]
import {
  useCheckIn,
  createActiveItemPlugin,
  createLoggerPlugin,
} from "../../useCheckIn";

interface DrawingHandler {
  type: "marker" | "circle" | "polyline" | "polygon" | "rectangle";
  enable: () => void;
  disable: () => void;
  supportsRepeatMode?: boolean;
}

const { createDesk } = useCheckIn<DrawingHandler>();

const { desk } = createDesk("drawingHandlers", {
  debug: true,

  plugins: [
    createActiveItemPlugin(),

    createLoggerPlugin({
      prefix: "[FeaturesEditor]",
      verbose: true,
    }),
  ],
});

desk.checkIn("marker", {
  type: "marker",
  enable: () => console.log("Marker drawing enabled"),
  disable: () => console.log("Marker drawing disabled"),
  supportsRepeatMode: true,
});

desk.checkIn("circle", {
  type: "circle",
  enable: () => console.log("Circle drawing enabled"),
  disable: () => console.log("Circle drawing disabled"),
  supportsRepeatMode: true,
});

(desk as any).setActive("marker");

const activeHandler = (desk as any).getActive();
console.log(activeHandler?.data.type);

(desk as any).setActive("circle");

watch(
  () => (desk as any).activeId?.value,
  (activeId) => {
    console.log("Active handler changed:", activeId);

    if (activeId) {
      const handler = desk.get(activeId);
      handler?.data.enable();
    }
  },
);
```

```ts [src/composables/use-check-in/plugins/history.ts]
import { ref } from "vue";
import type { CheckInPlugin } from "../types";
import type { CheckInDesk, CheckInItem } from "../useCheckIn";

export interface HistoryEntry<T = any> {
  action: "check-in" | "check-out" | "update";
  id: string | number;
  data?: T;
  timestamp: number;
}

export interface HistoryOptions {
  maxHistory?: number;
}

export const createHistoryPlugin = <T = any,>(
  options?: HistoryOptions,
): CheckInPlugin<T> => {
  const maxHistory = options?.maxHistory || 50;

  return {
    name: "history",
    version: "1.0.0",

    install: (desk) => {
      const history = ref<HistoryEntry<T>[]>([]);

      (desk as any).history = history;

      const unsubCheckIn = desk.on("check-in", ({ id, data, timestamp }) => {
        history.value.push({
          action: "check-in",
          id: id!,
          data: data as any,
          timestamp,
        });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      const unsubCheckOut = desk.on("check-out", ({ id, timestamp }) => {
        history.value.push({ action: "check-out", id: id!, timestamp });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      const unsubUpdate = desk.on("update", ({ id, data, timestamp }) => {
        history.value.push({
          action: "update",
          id: id!,
          data: data as any,
          timestamp,
        });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      return () => {
        unsubCheckIn();
        unsubCheckOut();
        unsubUpdate();
        history.value = [];
      };
    },

    methods: {
      getHistory(desk: CheckInDesk<T>): HistoryEntry<T>[] {
        return (desk as any).history?.value || [];
      },

      clearHistory(desk: CheckInDesk<T>) {
        const deskWithHistory = desk as any;
        if (deskWithHistory.history) {
          deskWithHistory.history.value = [];
        }
      },

      getLastHistory(desk: CheckInDesk<T>, count: number): HistoryEntry<T>[] {
        const history = (desk as any).history?.value || [];
        return history.slice(-count);
      },

      getHistoryByAction(
        desk: CheckInDesk<T>,
        action: "check-in" | "check-out" | "update",
      ): HistoryEntry<T>[] {
        const history = (desk as any).history?.value || [];
        return history.filter(
          (entry: HistoryEntry<T>) => entry.action === action,
        );
      },
    },
  };
};
```

```ts [src/composables/use-check-in/plugins/index.ts]
export { createActiveItemPlugin } from "./activeItem";
export { createValidationPlugin, type ValidationOptions } from "./validation";
export { createLoggerPlugin, type LoggerOptions } from "./logger";
export {
  createHistoryPlugin,
  type HistoryOptions,
  type HistoryEntry,
} from "./history";
```

```ts [src/composables/use-check-in/plugins/logger.ts]
import type { CheckInPlugin } from "../types";

export interface LoggerOptions {
  prefix?: string;

  logLevel?: "info" | "debug";

  verbose?: boolean;
}

export const createLoggerPlugin = <T = any,>(
  options?: LoggerOptions,
): CheckInPlugin<T> => {
  const prefix = options?.prefix || "[CheckIn]";
  const verbose = options?.verbose ?? false;

  return {
    name: "logger",
    version: "1.0.0",

    onCheckIn: (id, data) => {
      if (verbose) {
        console.log(`${prefix} ✅ Item checked in:`, { id, data });
      } else {
        console.log(`${prefix} ✅ Item checked in:`, id);
      }
    },

    onCheckOut: (id) => {
      console.log(`${prefix} ❌ Item checked out:`, id);
    },
  };
};
```

```ts [src/composables/use-check-in/plugins/validation.ts]
import type { CheckInPlugin } from "../types";

export interface ValidationOptions<T = any> {
  required?: (keyof T)[];

  validate?: (data: T) => boolean | string;
}

export const createValidationPlugin = <T = any,>(
  options: ValidationOptions<T>,
): CheckInPlugin<T> => ({
  name: "validation",
  version: "1.0.0",

  onBeforeCheckIn: (id, data) => {
    if (options.required) {
      for (const field of options.required) {
        if (data[field] === undefined || data[field] === null) {
          console.error(
            `[Validation Plugin] Field '${String(field)}' is required for item ${id}`,
          );
          return false;
        }
      }
    }

    if (options.validate) {
      const result = options.validate(data);
      if (result === false) {
        console.error(`[Validation Plugin] Validation failed for item ${id}`);
        return false;
      }
      if (typeof result === "string") {
        console.error(`[Validation Plugin] ${result}`);
        return false;
      }
    }

    return true;
  },
});
```

```ts [src/composables/use-check-in/index.ts]
export { useCheckIn } from "./useCheckIn";

export type {
  DeskEventType,
  DeskEventCallback,
  CheckInItem,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
} from "./useCheckIn";

export type { CheckInPlugin } from "./types";

export {
  createActiveItemPlugin,
  createValidationPlugin,
  createLoggerPlugin,
  createHistoryPlugin,
} from "./plugins";

export type {
  ValidationOptions,
  LoggerOptions,
  HistoryOptions,
  HistoryEntry,
} from "./plugins";
```

```ts [src/composables/use-check-in/useCheckIn.ts]
import {
  ref,
  provide,
  inject,
  onUnmounted,
  watch,
  computed,
  triggerRef,
  type InjectionKey,
  type Ref,
  type ComputedRef,
} from "vue";
import type { CheckInPlugin } from "./types";

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
  readonly registry: Ref<Map<string | number, CheckInItem<T>>>;
  checkIn: (
    id: string | number,
    data: T,
    meta?: Record<string, any>,
  ) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: {
    sortBy?: keyof T | "timestamp";
    order?: "asc" | "desc";
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
  plugins?: CheckInPlugin<T>[];
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
  let debug = NoOpDebug;

  const createDeskContext = <
    T = any,
    TContext extends Record<string, any> = {},
  >(
    options?: CheckInDeskOptions<T, TContext>,
  ): CheckInDesk<T, TContext> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(
      new Map(),
    ) as Ref<Map<string | number, CheckInItem<T>>>;

    debug = options?.debug ? Debug : NoOpDebug;

    const eventListeners = new Map<DeskEventType, Set<DeskEventCallback<T>>>();

    const pluginCleanups: Array<() => void> = [];

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

      if (options?.plugins) {
        for (const plugin of options.plugins) {
          if (plugin.onBeforeCheckIn) {
            const result = plugin.onBeforeCheckIn(id, data);
            if (result === false) {
              debug("checkIn cancelled by plugin:", plugin.name);
              return false;
            }
          }
        }
      }

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

      if (options?.plugins) {
        for (const plugin of options.plugins) {
          if (plugin.onBeforeCheckOut) {
            const result = plugin.onBeforeCheckOut(id);
            if (result === false) {
              debug("checkOut cancelled by plugin:", plugin.name);
              return false;
            }
          }
        }
      }

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

    const getAll = (sortOptions?: {
      sortBy?: keyof T | "timestamp";
      order?: "asc" | "desc";
    }) => {
      const items = Array.from(registry.value.values());

      if (!sortOptions?.sortBy) return items;

      return items.sort((a, b) => {
        let aVal: any, bVal: any;

        if (sortOptions.sortBy === "timestamp") {
          aVal = a.timestamp || 0;
          bVal = b.timestamp || 0;
        } else {
          const key = sortOptions.sortBy as keyof T;
          aVal = a.data[key];
          bVal = b.data[key];
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortOptions.order === "desc" ? -comparison : comparison;
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

      pluginCleanups.forEach((cleanup) => cleanup());
      pluginCleanups.length = 0;

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

    const desk: CheckInDesk<T, TContext> = {
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
    };

    if (options?.plugins) {
      options.plugins.forEach((plugin) => {
        debug("Installing plugin:", plugin.name);

        if (plugin.install) {
          const cleanup = plugin.install(desk);
          if (cleanup) {
            pluginCleanups.push(cleanup);
          }
        }

        if (plugin.onCheckIn) {
          desk.on("check-in", ({ id, data }) => {
            plugin.onCheckIn!(id!, data!);
          });
        }

        if (plugin.onCheckOut) {
          desk.on("check-out", ({ id }) => {
            plugin.onCheckOut!(id!);
          });
        }

        if (plugin.methods) {
          Object.entries(plugin.methods).forEach(([name, method]) => {
            (desk as any)[name] = (...args: any[]) => method(desk, ...args);
          });
        }

        if (plugin.computed) {
          Object.entries(plugin.computed).forEach(([name, getter]) => {
            Object.defineProperty(desk, name, {
              get: () => getter(desk),
              enumerable: true,
              configurable: true,
            });
          });
        }
      });
    }

    return desk;
  };

  const createDesk = (
    injectionKey: string = "checkInDesk",
    options?: CheckInDeskOptions<T, TContext>,
  ) => {
    const DeskInjectionKey = Symbol(
      `CheckInDesk:${injectionKey}`,
    ) as InjectionKey<CheckInDesk<T, TContext> & TContext>;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);

    provide(injectionKey, DeskInjectionKey);

    if (options?.debug) {
      Debug("Desk opened with injection key:", injectionKey);
    }

    return {
      desk: fullContext,
      injectionKey,
    };
  };

  const checkIn = <
    TDesk extends CheckInDesk<T, TContext> & TContext = CheckInDesk<
      T,
      TContext
    > &
      TContext,
  >(
    parentDeskOrKey:
      | (CheckInDesk<T, TContext> & TContext)
      | InjectionKey<CheckInDesk<T, TContext> & TContext>
      | string
      | null
      | undefined,
    checkInOptions?: CheckInOptions<T>,
  ) => {
    if (!parentDeskOrKey) {
      debug("[useCheckIn] No parent desk provided - skipping check-in");

      return {
        desk: null as TDesk | null,
        checkOut: () => {},
        updateSelf: () => {},
      };
    }

    let desk: (CheckInDesk<T, TContext> & TContext) | null | undefined;

    if (typeof parentDeskOrKey === "symbol") {
      desk = inject(parentDeskOrKey);
      if (!desk) {
        debug("[useCheckIn] Could not inject desk from symbol");

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else if (typeof parentDeskOrKey === "string") {
      const injectionKey =
        inject<InjectionKey<CheckInDesk<T, TContext> & TContext>>(
          parentDeskOrKey,
        );
      if (!injectionKey) {
        debug("[useCheckIn] Could not find desk with key:", parentDeskOrKey);

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
      desk = inject(injectionKey);
      if (!desk) {
        debug("[useCheckIn] Could not inject desk from key:", parentDeskOrKey);

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else {
      desk = parentDeskOrKey;
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
      const success = desk!.checkIn(itemId, data, checkInOptions?.meta);

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

    debug(
      `[useCheckIn] memoizedId: no instance or custom ID provided. ` +
        `Generated cryptographically secure ID. ` +
        `Consider passing getCurrentInstance() or a custom ID (nanoid, uuid, props.id, etc.).`,
    );
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

  const clearIdCache = (resetCounter = false) => {
    const customIdCount = customIdMap.size;
    customIdMap.clear();

    if (resetCounter) {
      instanceCounter = 0;
    }

    debug(
      `[useCheckIn] Cleared ${customIdCount} custom IDs from cache` +
        (resetCounter ? " and reset counter" : ""),
    );
  };

  return {
    createDesk,
    checkIn,
    generateId,
    memoizedId,
    standaloneDesk,
    isCheckedIn,
    getRegistry,
    clearIdCache,
  };
};

export type { CheckInPlugin } from "./types";
export {
  createActiveItemPlugin,
  createValidationPlugin,
  createLoggerPlugin,
  createHistoryPlugin,
  type ValidationOptions,
  type LoggerOptions,
  type HistoryOptions,
  type HistoryEntry,
} from "./plugins";
```

```ts [src/composables/use-check-in/types.ts]
import type { CheckInDesk } from "./useCheckIn";

export interface CheckInPlugin<T = any> {
  name: string;

  version?: string;

  install?: (desk: CheckInDesk<T>) => void | (() => void);

  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;

  onCheckIn?: (id: string | number, data: T) => void;

  onBeforeCheckOut?: (id: string | number) => void | boolean;

  onCheckOut?: (id: string | number) => void;

  methods?: Record<string, (desk: CheckInDesk<T>, ...args: any[]) => any>;

  computed?: Record<string, (desk: CheckInDesk<T>) => any>;
}
```

```ts [src/composables/use-check-in/plugins/activeItem.ts]
import { ref } from "vue";
import type { CheckInPlugin } from "../types";
import type { CheckInDesk } from "../useCheckIn";

export const createActiveItemPlugin = <T = any,>(): CheckInPlugin<T> => ({
  name: "active-item",
  version: "1.0.0",

  install: (desk) => {
    const activeId = ref<string | number | null>(null);
    (desk as any).activeId = activeId;

    return () => {
      activeId.value = null;
    };
  },

  methods: {
    setActive(desk: CheckInDesk<T>, id: string | number | null) {
      const deskWithActive = desk as any;
      const previousId = deskWithActive.activeId?.value;

      if (id === null) {
        deskWithActive.activeId.value = null;

        desk.emit("active-changed" as any, {
          id: undefined,
          data: undefined,
        });
        return true;
      }

      if (!desk.has(id)) return false;

      deskWithActive.activeId.value = id;
      desk.emit("active-changed" as any, {
        id,
        data: desk.get(id)?.data,
      });
      return true;
    },

    getActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      const id = deskWithActive.activeId?.value;
      return id ? desk.get(id) : null;
    },

    clearActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      return deskWithActive.setActive?.(null);
    },
  },

  computed: {
    hasActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      return deskWithActive.activeId?.value !== null;
    },
  },
});
```

```ts [src/composables/use-check-in/plugins/example.ts]
import {
  useCheckIn,
  createActiveItemPlugin,
  createLoggerPlugin,
} from "../../useCheckIn";

interface DrawingHandler {
  type: "marker" | "circle" | "polyline" | "polygon" | "rectangle";
  enable: () => void;
  disable: () => void;
  supportsRepeatMode?: boolean;
}

const { createDesk } = useCheckIn<DrawingHandler>();

const { desk } = createDesk("drawingHandlers", {
  debug: true,

  plugins: [
    createActiveItemPlugin(),

    createLoggerPlugin({
      prefix: "[FeaturesEditor]",
      verbose: true,
    }),
  ],
});

desk.checkIn("marker", {
  type: "marker",
  enable: () => console.log("Marker drawing enabled"),
  disable: () => console.log("Marker drawing disabled"),
  supportsRepeatMode: true,
});

desk.checkIn("circle", {
  type: "circle",
  enable: () => console.log("Circle drawing enabled"),
  disable: () => console.log("Circle drawing disabled"),
  supportsRepeatMode: true,
});

(desk as any).setActive("marker");

const activeHandler = (desk as any).getActive();
console.log(activeHandler?.data.type);

(desk as any).setActive("circle");

watch(
  () => (desk as any).activeId?.value,
  (activeId) => {
    console.log("Active handler changed:", activeId);

    if (activeId) {
      const handler = desk.get(activeId);
      handler?.data.enable();
    }
  },
);
```

```ts [src/composables/use-check-in/plugins/history.ts]
import { ref } from "vue";
import type { CheckInPlugin } from "../types";
import type { CheckInDesk, CheckInItem } from "../useCheckIn";

export interface HistoryEntry<T = any> {
  action: "check-in" | "check-out" | "update";
  id: string | number;
  data?: T;
  timestamp: number;
}

export interface HistoryOptions {
  maxHistory?: number;
}

export const createHistoryPlugin = <T = any,>(
  options?: HistoryOptions,
): CheckInPlugin<T> => {
  const maxHistory = options?.maxHistory || 50;

  return {
    name: "history",
    version: "1.0.0",

    install: (desk) => {
      const history = ref<HistoryEntry<T>[]>([]);

      (desk as any).history = history;

      const unsubCheckIn = desk.on("check-in", ({ id, data, timestamp }) => {
        history.value.push({
          action: "check-in",
          id: id!,
          data: data as any,
          timestamp,
        });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      const unsubCheckOut = desk.on("check-out", ({ id, timestamp }) => {
        history.value.push({ action: "check-out", id: id!, timestamp });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      const unsubUpdate = desk.on("update", ({ id, data, timestamp }) => {
        history.value.push({
          action: "update",
          id: id!,
          data: data as any,
          timestamp,
        });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      return () => {
        unsubCheckIn();
        unsubCheckOut();
        unsubUpdate();
        history.value = [];
      };
    },

    methods: {
      getHistory(desk: CheckInDesk<T>): HistoryEntry<T>[] {
        return (desk as any).history?.value || [];
      },

      clearHistory(desk: CheckInDesk<T>) {
        const deskWithHistory = desk as any;
        if (deskWithHistory.history) {
          deskWithHistory.history.value = [];
        }
      },

      getLastHistory(desk: CheckInDesk<T>, count: number): HistoryEntry<T>[] {
        const history = (desk as any).history?.value || [];
        return history.slice(-count);
      },

      getHistoryByAction(
        desk: CheckInDesk<T>,
        action: "check-in" | "check-out" | "update",
      ): HistoryEntry<T>[] {
        const history = (desk as any).history?.value || [];
        return history.filter(
          (entry: HistoryEntry<T>) => entry.action === action,
        );
      },
    },
  };
};
```

```ts [src/composables/use-check-in/plugins/index.ts]
export { createActiveItemPlugin } from "./activeItem";
export { createValidationPlugin, type ValidationOptions } from "./validation";
export { createLoggerPlugin, type LoggerOptions } from "./logger";
export {
  createHistoryPlugin,
  type HistoryOptions,
  type HistoryEntry,
} from "./history";
```

```ts [src/composables/use-check-in/plugins/logger.ts]
import type { CheckInPlugin } from "../types";

export interface LoggerOptions {
  prefix?: string;

  logLevel?: "info" | "debug";

  verbose?: boolean;
}

export const createLoggerPlugin = <T = any,>(
  options?: LoggerOptions,
): CheckInPlugin<T> => {
  const prefix = options?.prefix || "[CheckIn]";
  const verbose = options?.verbose ?? false;

  return {
    name: "logger",
    version: "1.0.0",

    onCheckIn: (id, data) => {
      if (verbose) {
        console.log(`${prefix} ✅ Item checked in:`, { id, data });
      } else {
        console.log(`${prefix} ✅ Item checked in:`, id);
      }
    },

    onCheckOut: (id) => {
      console.log(`${prefix} ❌ Item checked out:`, id);
    },
  };
};
```

```ts [src/composables/use-check-in/plugins/validation.ts]
import type { CheckInPlugin } from "../types";

export interface ValidationOptions<T = any> {
  required?: (keyof T)[];

  validate?: (data: T) => boolean | string;
}

export const createValidationPlugin = <T = any,>(
  options: ValidationOptions<T>,
): CheckInPlugin<T> => ({
  name: "validation",
  version: "1.0.0",

  onBeforeCheckIn: (id, data) => {
    if (options.required) {
      for (const field of options.required) {
        if (data[field] === undefined || data[field] === null) {
          console.error(
            `[Validation Plugin] Field '${String(field)}' is required for item ${id}`,
          );
          return false;
        }
      }
    }

    if (options.validate) {
      const result = options.validate(data);
      if (result === false) {
        console.error(`[Validation Plugin] Validation failed for item ${id}`);
        return false;
      }
      if (typeof result === "string") {
        console.error(`[Validation Plugin] ${result}`);
        return false;
      }
    }

    return true;
  },
});
```
:::

## API
::hr-underline
::

  ### Returns

Return the desk and the simple injection key

| Property | Type | Description |
|----------|------|-------------|
| `createDesk`{.primary .text-primary} | `any` | — |
| `checkIn`{.primary .text-primary} | `any` | — |
| `generateId`{.primary .text-primary} | `any` | — |
| `memoizedId`{.primary .text-primary} | `any` | — |
| `standaloneDesk`{.primary .text-primary} | `any` | — |
| `isCheckedIn`{.primary .text-primary} | `Ref<any>` | — |
| `getRegistry`{.primary .text-primary} | `any` | — |
| `clearIdCache`{.primary .text-primary} | `any` | — |

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

## index
::hr-underline
::

---

## types
::hr-underline
::

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `CheckInPlugin`{.primary .text-primary} | `interface` | — |

---

## plugins/activeItem
::hr-underline
::

---

## plugins/example
::hr-underline
::

---

## plugins/history
::hr-underline
::

---

## index
::hr-underline
::

---

## plugins/logger
::hr-underline
::

---

## plugins/validation
::hr-underline
::

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
import { Button } from "~/components/ui/button";
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
          <Button type="submit">Submit</Button>
          <Button type="button" variant="outline" @click="resetForm"
            >Reset</Button
          >
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
  color: hsl(var(--muted-foreground));
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: hsl(var(--muted) / 0.3);
  border-radius: var(--radius);
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
}

.state-display pre {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  margin: 0.5rem 0;
  white-space: pre-wrap;
  background: hsl(var(--background));
  padding: 0.5rem;
  border-radius: var(--radius);
}

.submitted-data {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid hsl(var(--border));
}
</style>
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
    <active-item-plugin-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { watch, computed } from "vue";
import { useCheckIn, createActiveItemPlugin } from "../index";
import { Button } from "@/components/ui/button";

interface TabData {
  label: string;
  content: string;
}

const { createDesk } = useCheckIn<TabData>();
const { desk } = createDesk("tabsDesk", {
  plugins: [createActiveItemPlugin()],
  debug: true,
});

const deskWithActive = desk as typeof desk & {
  activeId: { value: string | number | null };
  setActive: (id: string | number | null) => boolean;
  getActive: () => any;
  clearActive: () => void;
  hasActive: boolean;
};

desk.checkIn("tab1", { label: "Tab 1", content: "Content for tab 1" });
desk.checkIn("tab2", { label: "Tab 2", content: "Content for tab 2" });
desk.checkIn("tab3", { label: "Tab 3", content: "Content for tab 3" });

deskWithActive.setActive("tab1");

const tabs = computed(() => desk.getAll());

const activeTab = computed(() => {
  const active = deskWithActive.getActive();
  return active?.data;
});

watch(
  () => deskWithActive.activeId.value,
  (id) => {
    console.log("Active tab changed:", id);
  },
);

const handleTabClick = (id: string | number) => {
  deskWithActive.setActive(id);
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto p-6 space-y-4">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Active Item Plugin Demo</h2>
      <p class="text-sm text-muted-foreground">
        This demo shows how the
        <code class="bg-muted px-1 rounded">createActiveItemPlugin</code>
        manages an active item in a tabs-like interface.
      </p>
    </div>

    <div class="border rounded-lg overflow-hidden">
      <div class="flex border-b bg-muted/30">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="px-4 py-2 font-medium transition-colors hover:bg-muted/50"
          :class="{
            'border-b-2 border-primary bg-background':
              deskWithActive.activeId.value === tab.id,
            'text-muted-foreground': deskWithActive.activeId.value !== tab.id,
          }"
          @click="handleTabClick(tab.id)"
        >
          {{ tab.data.label }}
        </button>
      </div>

      <div class="p-6">
        <div v-if="activeTab">
          <h3 class="text-lg font-semibold mb-2">{{ activeTab.label }}</h3>
          <p class="text-muted-foreground">{{ activeTab.content }}</p>
        </div>
        <div v-else class="text-muted-foreground">No tab selected</div>
      </div>
    </div>

    <div class="space-y-2 p-4 bg-muted/30 rounded-lg">
      <h3 class="font-semibold">Plugin Methods Used:</h3>
      <ul class="text-sm space-y-1 list-disc list-inside text-muted-foreground">
        <li>
          <code class="bg-background px-1 rounded">setActive(id)</code> - Set
          the active tab
        </li>
        <li>
          <code class="bg-background px-1 rounded">getActive()</code> - Get
          current active tab data
        </li>
        <li>
          <code class="bg-background px-1 rounded">activeId</code> - Reactive
          ref of active ID
        </li>
        <li>
          <code class="bg-background px-1 rounded">hasActive</code> - Computed
          boolean ({{ deskWithActive.hasActive }})
        </li>
      </ul>
    </div>

    <div class="flex gap-2">
      <Button variant="outline" @click="deskWithActive.clearActive?.()">
        Clear Active
      </Button>
      <Button
        variant="outline"
        @click="
          () => {
            desk.checkIn('tab4', {
              label: 'Tab 4',
              content: 'New tab content',
            });
            deskWithActive.setActive('tab4');
          }
        "
      >
        Add New Tab
      </Button>
    </div>
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <history-plugin-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useCheckIn, createHistoryPlugin, type HistoryEntry } from "../index";
import { Button } from "@/components/ui/button";

interface TaskData {
  title: string;
  completed: boolean;
}

const { createDesk } = useCheckIn<TaskData>();
const { desk } = createDesk("tasksDesk", {
  plugins: [createHistoryPlugin({ maxHistory: 50 })],
  debug: true,
});

const deskWithHistory = desk as typeof desk & {
  history: { value: HistoryEntry<TaskData>[] };
  getHistory: () => HistoryEntry<TaskData>[];
  clearHistory: () => void;
  getLastHistory: (count: number) => HistoryEntry<TaskData>[];
  getHistoryByAction: (
    action: "check-in" | "check-out" | "update",
  ) => HistoryEntry<TaskData>[];
};

desk.checkIn("task1", { title: "Learn useCheckIn", completed: false });
desk.checkIn("task2", { title: "Build a demo", completed: false });
desk.checkIn("task3", { title: "Write documentation", completed: false });

const tasks = ref(desk.getAll());

const history = computed(() => deskWithHistory.getHistory());
const checkInHistory = computed(() =>
  deskWithHistory.getHistoryByAction("check-in"),
);
const checkOutHistory = computed(() =>
  deskWithHistory.getHistoryByAction("check-out"),
);
const updateHistory = computed(() =>
  deskWithHistory.getHistoryByAction("update"),
);

const newTaskTitle = ref("");
const addTask = () => {
  if (!newTaskTitle.value.trim()) return;

  const taskId = `task-${Date.now()}`;
  desk.checkIn(taskId, {
    title: newTaskTitle.value,
    completed: false,
  });

  newTaskTitle.value = "";
  tasks.value = desk.getAll();
};

const toggleTask = (id: string | number) => {
  const task = desk.get(id);
  if (task) {
    desk.update(id, { completed: !task.data.completed });
    tasks.value = desk.getAll();
  }
};

const removeTask = (id: string | number) => {
  desk.checkOut(id);
  tasks.value = desk.getAll();
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

const getActionIcon = (action: string) => {
  switch (action) {
    case "check-in":
      return "➕";
    case "check-out":
      return "➖";
    case "update":
      return "✏️";
    default:
      return "•";
  }
};
</script>

<template>
  <div class="w-full max-w-4xl mx-auto p-6 space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">History Plugin Demo</h2>
      <p class="text-sm text-muted-foreground">
        This demo shows how the
        <code class="bg-muted px-1 rounded">createHistoryPlugin</code>
        tracks all check-in, check-out, and update operations.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="border rounded-lg p-6 space-y-4">
        <h3 class="text-lg font-semibold">Tasks</h3>

        <div class="flex gap-2">
          <input
            v-model="newTaskTitle"
            type="text"
            placeholder="New task..."
            class="flex-1 px-3 py-2 border rounded-md"
            @keyup.enter="addTask"
          />
          <Button @click="addTask">Add</Button>
        </div>

        <div class="space-y-2">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center gap-2 p-2 hover:bg-muted/30 rounded"
          >
            <input
              type="checkbox"
              :checked="task.data.completed"
              class="w-4 h-4"
              @change="toggleTask(task.id)"
            />
            <span
              class="flex-1"
              :class="{
                'line-through text-muted-foreground': task.data.completed,
              }"
            >
              {{ task.data.title }}
            </span>
            <Button variant="ghost" size="sm" @click="removeTask(task.id)">
              ×
            </Button>
          </div>

          <div
            v-if="tasks.length === 0"
            class="text-center py-8 text-muted-foreground"
          >
            No tasks yet
          </div>
        </div>

        <div class="pt-4 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="
              desk.clear();
              tasks = [];
            "
          >
            Clear All Tasks
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="deskWithHistory.clearHistory()"
          >
            Clear History
          </Button>
        </div>
      </div>

      <div class="border rounded-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Operation History</h3>
          <span class="text-sm text-muted-foreground"
            >{{ history.length }} entries</span
          >
        </div>

        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2 bg-green-50 rounded border border-green-200">
            <div class="text-2xl font-bold text-green-700">
              {{ checkInHistory.length }}
            </div>
            <div class="text-xs text-green-600">Check-ins</div>
          </div>
          <div class="p-2 bg-blue-50 rounded border border-blue-200">
            <div class="text-2xl font-bold text-blue-700">
              {{ updateHistory.length }}
            </div>
            <div class="text-xs text-blue-600">Updates</div>
          </div>
          <div class="p-2 bg-red-50 rounded border border-red-200">
            <div class="text-2xl font-bold text-red-700">
              {{ checkOutHistory.length }}
            </div>
            <div class="text-xs text-red-600">Check-outs</div>
          </div>
        </div>

        <div class="space-y-1 max-h-96 overflow-y-auto">
          <div
            v-for="(entry, index) in [...history].reverse()"
            :key="index"
            class="flex items-start gap-2 p-2 text-sm hover:bg-muted/30 rounded"
          >
            <span class="text-lg">{{ getActionIcon(entry.action) }}</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium capitalize">{{ entry.action }}</div>
              <div
                v-if="entry.data"
                class="text-xs text-muted-foreground truncate"
              >
                {{ entry.data.title }}
              </div>
              <div class="text-xs text-muted-foreground">
                {{ formatTime(entry.timestamp) }}
              </div>
            </div>
          </div>

          <div
            v-if="history.length === 0"
            class="text-center py-8 text-muted-foreground"
          >
            No history yet
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2 p-4 bg-muted/30 rounded-lg">
      <h3 class="font-semibold">Plugin Methods & Properties:</h3>
      <div class="grid md:grid-cols-2 gap-2">
        <ul
          class="text-sm space-y-1 list-disc list-inside text-muted-foreground"
        >
          <li>
            <code class="bg-background px-1 rounded">getHistory()</code> - Get
            full history
          </li>
          <li>
            <code class="bg-background px-1 rounded">clearHistory()</code> -
            Clear all history
          </li>
          <li>
            <code class="bg-background px-1 rounded">getLastHistory(n)</code> -
            Get last N entries
          </li>
        </ul>
        <ul
          class="text-sm space-y-1 list-disc list-inside text-muted-foreground"
        >
          <li>
            <code class="bg-background px-1 rounded">getHistoryByAction()</code>
            - Filter by action
          </li>
          <li>
            <code class="bg-background px-1 rounded">history</code> - Reactive
            history array
          </li>
          <li>
            <code class="bg-background px-1 rounded">maxHistory</code> - Limit:
            50 entries
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <logger-plugin-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useCheckIn, createLoggerPlugin } from "../index";
import { Button } from "@/components/ui/button";

interface MessageData {
  text: string;
  sender: string;
}

const { createDesk } = useCheckIn<MessageData>();
const { desk } = createDesk("messagesDesk", {
  plugins: [
    createLoggerPlugin({
      prefix: "[ChatDemo]",
      verbose: true,
    }),
  ],
  debug: true,
});

const messages = ref(desk.getAll());

const newMessage = ref("");
const sender = ref("User");

const consoleLogs = ref<string[]>([]);

const originalLog = console.log;
console.log = (...args: any[]) => {
  const message = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
    .join(" ");

  if (message.includes("[ChatDemo]") || message.includes("[useCheckIn]")) {
    consoleLogs.value.unshift(message);
    if (consoleLogs.value.length > 20) {
      consoleLogs.value.pop();
    }
  }

  originalLog.apply(console, args);
};

const addMessage = () => {
  if (!newMessage.value.trim()) return;

  const messageId = `msg-${Date.now()}`;
  desk.checkIn(messageId, {
    text: newMessage.value,
    sender: sender.value,
  });

  newMessage.value = "";
  messages.value = desk.getAll();
};

const removeMessage = (id: string | number) => {
  desk.checkOut(id);
  messages.value = desk.getAll();
};

const editMessage = (id: string | number) => {
  const newText = prompt("Edit message:");
  if (newText) {
    desk.update(id, { text: newText });
    messages.value = desk.getAll();
  }
};

const clearConsole = () => {
  consoleLogs.value = [];
};

desk.checkIn("msg1", {
  text: "Hello! Logger plugin is active.",
  sender: "System",
});
desk.checkIn("msg2", {
  text: "Check the console on the right →",
  sender: "System",
});
messages.value = desk.getAll();
</script>

<template>
  <div class="w-full max-w-6xl mx-auto p-6 space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Logger Plugin Demo</h2>
      <p class="text-sm text-muted-foreground">
        This demo shows how the
        <code class="bg-muted px-1 rounded">createLoggerPlugin</code> logs all
        operations to the console.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="border rounded-lg p-6 space-y-4">
        <h3 class="text-lg font-semibold">Messages</h3>

        <div class="space-y-2">
          <div class="flex gap-2">
            <select v-model="sender" class="px-3 py-2 border rounded-md">
              <option>User</option>
              <option>Admin</option>
              <option>System</option>
            </select>
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type a message..."
              class="flex-1 px-3 py-2 border rounded-md"
              @keyup.enter="addMessage"
            />
            <Button @click="addMessage">Send</Button>
          </div>
        </div>

        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="message in messages"
            :key="message.id"
            class="p-3 bg-muted/30 rounded-lg space-y-2"
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="font-semibold text-sm">
                  {{ message.data.sender }}
                </div>
                <div class="text-muted-foreground">{{ message.data.text }}</div>
              </div>
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="editMessage(message.id)"
                >
                  ✏️
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="removeMessage(message.id)"
                >
                  ×
                </Button>
              </div>
            </div>
          </div>

          <div
            v-if="messages.length === 0"
            class="text-center py-8 text-muted-foreground"
          >
            No messages yet
          </div>
        </div>

        <div class="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            @click="
              desk.clear();
              messages = [];
            "
          >
            Clear Messages
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="
              desk.checkIn(`msg-${Date.now()}`, {
                text: 'Batch operation test',
                sender: 'System',
              });
              messages = desk.getAll();
            "
          >
            Add Test Message
          </Button>
        </div>
      </div>

      <div class="border rounded-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Console Logs</h3>
          <Button variant="outline" size="sm" @click="clearConsole">
            Clear Console
          </Button>
        </div>

        <div
          class="bg-black text-green-400 font-mono text-xs p-4 rounded-lg max-h-96 overflow-y-auto space-y-1"
        >
          <div
            v-for="(log, index) in consoleLogs"
            :key="index"
            class="whitespace-pre-wrap break-all"
          >
            {{ log }}
          </div>

          <div v-if="consoleLogs.length === 0" class="text-green-600">
            Waiting for operations...
          </div>
        </div>

        <div class="space-y-2 p-4 bg-muted/30 rounded-lg">
          <h4 class="font-semibold text-sm">Logger Configuration:</h4>
          <ul
            class="text-xs space-y-1 list-disc list-inside text-muted-foreground"
          >
            <li>
              <code class="bg-background px-1 rounded">prefix</code>:
              '[ChatDemo]'
            </li>
            <li>
              <code class="bg-background px-1 rounded">verbose</code>: true
              (shows full data)
            </li>
            <li>Logs on: check-in, check-out operations</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="space-y-2 p-4 bg-muted/30 rounded-lg">
      <h3 class="font-semibold">What Gets Logged:</h3>
      <div class="grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <div class="font-medium mb-1">Check-in Operations</div>
          <ul class="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Item ID</li>
            <li>Full data (verbose mode)</li>
            <li>Timestamp</li>
          </ul>
        </div>
        <div>
          <div class="font-medium mb-1">Check-out Operations</div>
          <ul class="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Item ID</li>
            <li>Removal confirmation</li>
          </ul>
        </div>
        <div>
          <div class="font-medium mb-1">Debug Mode</div>
          <ul class="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Plugin installation</li>
            <li>Registry state</li>
            <li>Event emissions</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <validation-plugin-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import { useCheckIn, createValidationPlugin } from "../index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

interface User {
  name: string;
  email: string;
  age: number;
}

const { createDesk } = useCheckIn<User>();
const { desk } = createDesk("usersDesk", {
  plugins: [
    createValidationPlugin({
      required: ["name", "email", "age"],
      validate: (data) => {
        if (!data.email.includes("@")) {
          return "Email must contain @";
        }

        if (data.age < 18) {
          return "User must be at least 18 years old";
        }

        if (data.name.length < 2) {
          return "Name must be at least 2 characters";
        }

        return true;
      },
    }),
  ],
  debug: true,
});

const formName = ref("");
const formEmail = ref("");
const formAge = ref<number | undefined>(undefined);
const validationMessage = ref("");
const successMessage = ref("");

const users = ref(desk.getAll());

const handleSubmit = () => {
  validationMessage.value = "";
  successMessage.value = "";

  const userId = `user-${Date.now()}`;
  const success = desk.checkIn(userId, {
    name: formName.value,
    email: formEmail.value,
    age: formAge.value!,
  });

  if (success) {
    successMessage.value = `User "${formName.value}" added successfully!`;

    formName.value = "";
    formEmail.value = "";
    formAge.value = undefined;

    users.value = desk.getAll();
  } else {
    validationMessage.value = "Validation failed. Check console for details.";
  }
};

const testCases = [
  {
    label: "Valid User",
    data: { name: "John Doe", email: "john@example.com", age: 25 },
    shouldPass: true,
  },
  {
    label: "Missing Email @",
    data: { name: "Jane", email: "jane.example.com", age: 30 },
    shouldPass: false,
  },
  {
    label: "Age < 18",
    data: { name: "Bob", email: "bob@example.com", age: 16 },
    shouldPass: false,
  },
  {
    label: "Name Too Short",
    data: { name: "A", email: "a@example.com", age: 20 },
    shouldPass: false,
  },
];

const runTest = (testCase: (typeof testCases)[0]) => {
  validationMessage.value = "";
  successMessage.value = "";

  const success = desk.checkIn(`test-${Date.now()}`, testCase.data);

  if (success) {
    successMessage.value = `✅ Test passed: ${testCase.label}`;
    users.value = desk.getAll();
  } else {
    validationMessage.value = `❌ Test failed as expected: ${testCase.label}`;
  }
};
</script>

<template>
  <div class="w-full max-w-3xl mx-auto p-6 space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Validation Plugin Demo</h2>
      <p class="text-sm text-muted-foreground">
        This demo shows how the
        <code class="bg-muted px-1 rounded">createValidationPlugin</code>
        validates data before check-in.
      </p>
    </div>

    <div class="border rounded-lg p-6 space-y-4">
      <h3 class="text-lg font-semibold">Add New User</h3>

      <div class="grid gap-4">
        <div class="space-y-2">
          <Label for="name">Name (min 2 chars)</Label>
          <Input id="name" v-model="formName" placeholder="Enter name" />
        </div>

        <div class="space-y-2">
          <Label for="email">Email (must contain @)</Label>
          <Input
            id="email"
            v-model="formEmail"
            type="email"
            placeholder="Enter email"
          />
        </div>

        <div class="space-y-2">
          <Label for="age">Age (min 18)</Label>
          <Input
            id="age"
            v-model.number="formAge"
            type="number"
            placeholder="Enter age"
          />
        </div>

        <Button @click="handleSubmit"> Add User </Button>

        <div
          v-if="successMessage"
          class="p-3 bg-green-50 text-green-800 rounded border border-green-200"
        >
          {{ successMessage }}
        </div>

        <div
          v-if="validationMessage"
          class="p-3 bg-red-50 text-red-800 rounded border border-red-200"
        >
          {{ validationMessage }}
        </div>
      </div>
    </div>

    <div class="border rounded-lg p-6 space-y-4">
      <h3 class="text-lg font-semibold">Validation Test Cases</h3>
      <p class="text-sm text-muted-foreground">
        Click to test different validation scenarios
      </p>

      <div class="grid gap-2">
        <Button
          v-for="(testCase, index) in testCases"
          :key="index"
          variant="outline"
          class="justify-start"
          @click="runTest(testCase)"
        >
          <span class="font-mono text-xs mr-2">
            {{ testCase.shouldPass ? "✅" : "❌" }}
          </span>
          {{ testCase.label }}:
          <span class="ml-2 text-xs text-muted-foreground">
            {{ testCase.data.name }} / {{ testCase.data.email }} /
            {{ testCase.data.age }}
          </span>
        </Button>
      </div>
    </div>

    <div class="border rounded-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">
          Validated Users ({{ users.length }})
        </h3>
        <Button
          variant="outline"
          size="sm"
          @click="
            desk.clear();
            users = [];
          "
        >
          Clear All
        </Button>
      </div>

      <div
        v-if="users.length === 0"
        class="text-center py-8 text-muted-foreground"
      >
        No users added yet
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center justify-between p-3 bg-muted/30 rounded"
        >
          <div>
            <div class="font-medium">{{ user.data.name }}</div>
            <div class="text-sm text-muted-foreground">
              {{ user.data.email }} · {{ user.data.age }} years old
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            @click="
              desk.checkOut(user.id);
              users = desk.getAll();
            "
          >
            Remove
          </Button>
        </div>
      </div>
    </div>

    <div class="space-y-2 p-4 bg-muted/30 rounded-lg">
      <h3 class="font-semibold">Validation Rules:</h3>
      <ul class="text-sm space-y-1 list-disc list-inside text-muted-foreground">
        <li>
          <code class="bg-background px-1 rounded">required</code>: ['name',
          'email', 'age']
        </li>
        <li>
          <code class="bg-background px-1 rounded">validate</code>: Custom
          validation function
        </li>
        <li>Email must contain '@'</li>
        <li>Age must be ≥ 18</li>
        <li>Name must be ≥ 2 characters</li>
      </ul>
    </div>
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <combined-plugins-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  useCheckIn,
  createActiveItemPlugin,
  createValidationPlugin,
  createLoggerPlugin,
  createHistoryPlugin,
  type HistoryEntry,
} from "../index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

interface Product {
  name: string;
  price: number;
  stock: number;
}

const { createDesk } = useCheckIn<Product>();
const { desk } = createDesk("productsDesk", {
  plugins: [
    createActiveItemPlugin(),

    createValidationPlugin({
      required: ["name", "price", "stock"],
      validate: (data) => {
        if (data.price <= 0) return "Price must be positive";
        if (data.stock < 0) return "Stock cannot be negative";
        if (data.name.length < 3) return "Name must be at least 3 characters";
        return true;
      },
    }),

    createLoggerPlugin({
      prefix: "[ProductsDemo]",
      verbose: false,
    }),

    createHistoryPlugin({ maxHistory: 30 }),
  ],
  debug: false,
});

const enhancedDesk = desk as typeof desk & {
  activeId: { value: string | number | null };
  setActive: (id: string | number | null) => boolean;
  getActive: () => any;
  clearActive: () => void;
  hasActive: boolean;
  history: { value: HistoryEntry<Product>[] };
  getHistory: () => HistoryEntry<Product>[];
  clearHistory: () => void;
};

const initialProducts = [
  { id: "prod1", name: "Laptop", price: 999, stock: 10 },
  { id: "prod2", name: "Mouse", price: 29, stock: 50 },
  { id: "prod3", name: "Keyboard", price: 79, stock: 25 },
];

initialProducts.forEach((p) =>
  desk.checkIn(p.id, { name: p.name, price: p.price, stock: p.stock }),
);

const products = ref(desk.getAll());
const formName = ref("");
const formPrice = ref<number | undefined>(undefined);
const formStock = ref<number | undefined>(undefined);
const statusMessage = ref("");

const history = computed(() => enhancedDesk.getHistory());
const activeProduct = computed(() => {
  const active = enhancedDesk.getActive();
  return active?.data;
});

watch(
  () => enhancedDesk.activeId.value,
  (id) => {
    if (id) {
      const product = desk.get(id);
      statusMessage.value = `Selected: ${product?.data.name}`;
    } else {
      statusMessage.value = "";
    }
  },
);

const addProduct = () => {
  if (
    !formName.value ||
    formPrice.value === undefined ||
    formStock.value === undefined
  ) {
    statusMessage.value = "❌ Please fill all fields";
    return;
  }

  const productId = `prod-${Date.now()}`;
  const success = desk.checkIn(productId, {
    name: formName.value,
    price: formPrice.value,
    stock: formStock.value,
  });

  if (success) {
    statusMessage.value = `✅ Product "${formName.value}" added`;
    formName.value = "";
    formPrice.value = undefined;
    formStock.value = undefined;
    products.value = desk.getAll();
    enhancedDesk.setActive(productId);
  } else {
    statusMessage.value = "❌ Validation failed";
  }
};

const updateStock = (id: string | number, change: number) => {
  const product = desk.get(id);
  if (product) {
    const newStock = Math.max(0, product.data.stock + change);
    desk.update(id, { stock: newStock });
    products.value = desk.getAll();
  }
};

const removeProduct = (id: string | number) => {
  desk.checkOut(id);
  products.value = desk.getAll();
  if (enhancedDesk.activeId.value === id) {
    enhancedDesk.clearActive();
  }
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

const getActionColor = (action: string) => {
  switch (action) {
    case "check-in":
      return "bg-green-100 text-green-800 border-green-200";
    case "check-out":
      return "bg-red-100 text-red-800 border-red-200";
    case "update":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
</script>

<template>
  <div class="w-full max-w-7xl mx-auto p-6 space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Combined Plugins Demo</h2>
      <p class="text-sm text-muted-foreground">
        This demo shows all 4 plugins working together: Active Item + Validation
        + Logger + History
      </p>
    </div>

    <div v-if="statusMessage" class="p-3 bg-muted rounded-lg text-sm">
      {{ statusMessage }}
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="border rounded-lg p-6 space-y-4">
          <h3 class="text-lg font-semibold">Add Product</h3>
          <div class="grid md:grid-cols-3 gap-4">
            <Input
              v-model="formName"
              placeholder="Product name (min 3 chars)"
            />
            <Input
              v-model.number="formPrice"
              type="number"
              placeholder="Price (> 0)"
            />
            <Input
              v-model.number="formStock"
              type="number"
              placeholder="Stock (≥ 0)"
            />
          </div>
          <Button class="w-full" @click="addProduct"> Add Product </Button>
        </div>

        <div class="border rounded-lg p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              Products ({{ products.length }})
            </h3>
            <Button
              variant="outline"
              size="sm"
              @click="
                desk.clear();
                products = [];
              "
            >
              Clear All
            </Button>
          </div>

          <div class="grid gap-3">
            <div
              v-for="product in products"
              :key="product.id"
              class="p-4 border rounded-lg cursor-pointer transition-colors"
              :class="{
                'border-primary bg-primary/5':
                  enhancedDesk.activeId.value === product.id,
                'hover:bg-muted/30': enhancedDesk.activeId.value !== product.id,
              }"
              @click="enhancedDesk.setActive(product.id)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-semibold">{{ product.data.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    ${{ product.data.price.toFixed(2) }} · Stock:
                    {{ product.data.stock }}
                  </div>
                </div>
                <div class="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click.stop="updateStock(product.id, -1)"
                    :disabled="product.data.stock === 0"
                  >
                    -
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click.stop="updateStock(product.id, 1)"
                  >
                    +
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click.stop="removeProduct(product.id)"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </div>

            <div
              v-if="products.length === 0"
              class="text-center py-8 text-muted-foreground"
            >
              No products yet
            </div>
          </div>
        </div>

        <div
          v-if="activeProduct"
          class="border rounded-lg p-6 space-y-2 bg-primary/5"
        >
          <h3 class="text-lg font-semibold">Active Product Details</h3>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div class="text-sm text-muted-foreground">Name</div>
              <div class="font-medium">{{ activeProduct.name }}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Price</div>
              <div class="font-medium">
                ${{ activeProduct.price.toFixed(2) }}
              </div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Stock</div>
              <div class="font-medium">{{ activeProduct.stock }} units</div>
            </div>
          </div>
        </div>
      </div>

      <div class="border rounded-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">History</h3>
          <Button
            variant="outline"
            size="sm"
            @click="enhancedDesk.clearHistory()"
          >
            Clear
          </Button>
        </div>

        <div class="text-xs text-muted-foreground">
          {{ history.length }} operations tracked
        </div>

        <div class="space-y-2 max-h-[600px] overflow-y-auto">
          <div
            v-for="(entry, index) in [...history].reverse()"
            :key="index"
            class="p-2 rounded border text-xs"
            :class="getActionColor(entry.action)"
          >
            <div class="font-semibold capitalize">{{ entry.action }}</div>
            <div v-if="entry.data" class="truncate">{{ entry.data.name }}</div>
            <div class="text-xs opacity-70">
              {{ formatTime(entry.timestamp) }}
            </div>
          </div>

          <div
            v-if="history.length === 0"
            class="text-center py-8 text-muted-foreground text-sm"
          >
            No history
          </div>
        </div>
      </div>
    </div>

    <div class="border rounded-lg p-6 space-y-4">
      <h3 class="text-lg font-semibold">Active Plugins</h3>
      <div class="grid md:grid-cols-4 gap-4">
        <div class="p-4 bg-green-50 border border-green-200 rounded">
          <div class="font-semibold text-green-900">✓ Active Item</div>
          <div class="text-xs text-green-700 mt-1">
            Tracking selected product
          </div>
        </div>
        <div class="p-4 bg-blue-50 border border-blue-200 rounded">
          <div class="font-semibold text-blue-900">✓ Validation</div>
          <div class="text-xs text-blue-700 mt-1">Price > 0, Stock ≥ 0</div>
        </div>
        <div class="p-4 bg-purple-50 border border-purple-200 rounded">
          <div class="font-semibold text-purple-900">✓ Logger</div>
          <div class="text-xs text-purple-700 mt-1">
            Console logging enabled
          </div>
        </div>
        <div class="p-4 bg-orange-50 border border-orange-200 rounded">
          <div class="font-semibold text-orange-900">✓ History</div>
          <div class="text-xs text-orange-700 mt-1">
            {{ history.length }} / 30 entries
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tip
You can copy and adapt this template for any composable documentation.
::

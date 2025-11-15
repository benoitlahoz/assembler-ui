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

  airportDesk.desk.update(passengerId, { baggage: newWeight });
  console.log(
    `➕ ${passenger.data.name}: Adding ${weight}kg of baggage (${currentWeight}kg → ${newWeight}kg)`,
  );
  return true;
};

const removeBaggage = (passengerId: string, weight: number = 10): boolean => {
  const passenger = airportDesk.desk.get(passengerId);
  if (!passenger) return false;

  const currentWeight = passenger.data.baggage;
  const newWeight = Math.max(0, currentWeight - weight);

  airportDesk.desk.update(passengerId, { baggage: newWeight });
  console.log(
    `➖ ${passenger.data.name}: Removing ${weight}kg of baggage (${currentWeight}kg → ${newWeight}kg)`,
  );
  return true;
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
    airportDesk.desk.update(passengerId, { seat: newSeat });
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

const { openDesk } = useCheckIn<
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

const airportDesk = openDesk({
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
  },
  onCheckOut: (id) => {
    console.log(`🚪 Passenger ${id} has left the desk`);
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
  checkIn: (id: string | number, data: T, meta?: Record<string, any>) => void;
  checkOut: (id: string | number) => void;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: {
    sortBy?: keyof T | "timestamp";
    order?: "asc" | "desc";
  }) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => void;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: Record<string, any> }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
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

    const checkIn = (
      id: string | number,
      data: T,
      meta?: Record<string, any>,
    ) => {
      debug("checkIn", { id, data, meta });

      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug("checkIn cancelled by onBeforeCheckIn", id);
          return;
        }
      }

      registry.value.set(id, {
        id,
        data: data as any,
        timestamp: Date.now(),
        meta,
      });
      triggerRef(registry);

      options?.onCheckIn?.(id, data);
    };

    const checkOut = (id: string | number) => {
      debug("checkOut", id);

      const existed = registry.value.has(id);
      if (!existed) return;

      if (options?.onBeforeCheckOut) {
        const result = options.onBeforeCheckOut(id);
        if (result === false) {
          debug("checkOut cancelled by onBeforeCheckOut", id);
          return;
        }
      }

      registry.value.delete(id);
      triggerRef(registry);

      options?.onCheckOut?.(id);
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

    const update = (id: string | number, data: Partial<T>) => {
      const existing = registry.value.get(id);
      if (
        existing &&
        typeof existing.data === "object" &&
        typeof data === "object"
      ) {
        checkIn(id, { ...existing.data, ...data } as T, existing.meta);
      }
    };

    const has = (id: string | number) => registry.value.has(id);

    const clear = () => {
      debug("clear");
      registry.value.clear();
      triggerRef(registry);
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
    };
  };

  const openDesk = (options?: CheckInDeskOptions<T, TContext>) => {
    const DeskInjectionKey = Symbol("CheckInDesk") as InjectionKey<
      CheckInDesk<T, TContext> & TContext
    >;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);

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

    const performCheckIn = async () => {
      if (isCheckedIn.value) return;

      const data = await getCurrentData();
      desk!.checkIn(itemId, data, checkInOptions?.meta);
      isCheckedIn.value = true;

      debug(`[useCheckIn] Checked in: ${itemId}`, data);
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

  const generateId = (prefix = "passenger"): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    openDesk,
    checkIn,
    generateId,
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
| `openDesk`{.primary .text-primary} | `any` | — |
| `checkIn`{.primary .text-primary} | `any` | — |
| `generateId`{.primary .text-primary} | `any` | — |
| `standaloneDesk`{.primary .text-primary} | `any` | — |
| `isCheckedIn`{.primary .text-primary} | `Ref<any>` | — |
| `getRegistry`{.primary .text-primary} | `any` | — |

  ### Types
| Name | Type | Description |
|------|------|-------------|
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
import { ref, computed, provide } from "vue";
import { useCheckIn } from "../useCheckIn";
import FormField from "./FormField.vue";

interface FormFieldData {
  name: string;
  label: string;
  value: any;
  required?: boolean;
}

const { openDesk } = useCheckIn<FormFieldData>();

const formData = ref<Record<string, any>>({});
const errors = ref<Record<string, string>>({});

const { desk, DeskInjectionKey: formDesk } = openDesk({
  context: {
    updateValue: (name: string, value: any) => {
      formData.value[name] = value;
      if (errors.value[name]) {
        delete errors.value[name];
        errors.value = { ...errors.value };
      }
    },
    getValue: (name: string) => formData.value[name],
    setError: (name: string, error: string) => {
      errors.value[name] = error;
      errors.value = { ...errors.value };
    },
    getError: (name: string) => errors.value[name],
  },
  onCheckIn: (id, data) => {
    if (data.value !== undefined) {
      formData.value[data.name] = data.value;
    }
  },
  onCheckOut: (id) => {},
});

provide("formDesk", { deskSymbol: formDesk });

const allFields = computed(() => desk.getAll());
const isValid = computed(() => Object.keys(errors.value).length === 0);
const fieldCount = computed(() => allFields.value.length);

const validateForm = () => {
  errors.value = {};
  allFields.value.forEach((field) => {
    if (field.data.required && !formData.value[field.data.name]) {
      errors.value[field.data.name] = `${field.data.label} is required`;
    }
  });
  errors.value = { ...errors.value };
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (validateForm()) {
    alert(`Form submitted!\n\n${JSON.stringify(formData.value, null, 2)}`);
  }
};

const resetForm = () => {
  formData.value = {};
  errors.value = {};
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useCheckIn - Form Demo</h2>
      <p class="text-muted-foreground">
        Form fields check in with parent for centralized state management
      </p>
    </div>

    <div class="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <span class="text-sm font-medium">{{ fieldCount }} fields</span>
      <span
        :class="[
          'text-sm font-medium',
          isValid ? 'text-green-600' : 'text-red-600',
        ]"
      >
        {{ isValid ? "✓ Valid" : "✗ Invalid" }}
      </span>
    </div>

    <form
      @submit.prevent="handleSubmit"
      class="space-y-4 p-6 border border-border rounded-lg"
    >
      <FormField
        name="username"
        label="Username"
        :required="true"
        placeholder="Enter username"
      />
      <FormField
        name="email"
        label="Email"
        type="email"
        :required="true"
        placeholder="email@example.com"
      />
      <FormField
        name="bio"
        label="Bio"
        type="textarea"
        placeholder="Tell us about yourself..."
      />

      <div class="flex gap-2 pt-4">
        <button
          type="submit"
          class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Submit
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
        >
          Reset
        </button>
      </div>
    </form>

    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <pre class="bg-background p-2 rounded">{{
          JSON.stringify(formData, null, 2)
        }}</pre>
        <p>
          <strong>Fields:</strong>
          {{ allFields.map((f) => f.data.name).join(", ") }}
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

const { openDesk } = useCheckIn<AccordionItemData>();

const openItems = ref<Set<string | number>>(new Set());
const allowMultiple = ref(false);

const { desk, DeskInjectionKey: accordionDesk } = openDesk({
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
            Parent component opens a check-in desk using <code>openDesk()</code>
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

const { openDesk } = useCheckIn<
  TabItemData,
  {
    activeTab: Ref<string>;
    setActive: (id: string) => void;
  }
>();

const { desk, DeskInjectionKey: tabsDesk } = openDesk({
  context: {
    activeTab,
    setActive: (id: string) => {
      const tab = desk.get(id as string);
      if (tab && !tab.data.disabled) {
        activeTab.value = id as string;
      }
    },
  },
  onCheckIn: (id, data) => {
    tabCount.value++;
    if (tabCount.value === 1) {
      activeTab.value = id as string;
    }
  },
  onCheckOut: (id) => {
    tabCount.value--;
  },
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
import { ref, computed, provide } from "vue";
import { useCheckIn } from "../useCheckIn";
import ToolbarButton from "./ToolbarButton.vue";
import ToolbarSeparator from "./ToolbarSeparator.vue";

interface ToolItemData {
  label: string;
  icon?: string;
  type: "button" | "toggle" | "separator";
  active?: boolean;
  disabled?: boolean;
}

const { openDesk } = useCheckIn<ToolItemData>();

const activeTool = ref<string | number | null>(null);
const clickHistory = ref<Array<{ id: string | number; time: number }>>([]);

const { desk, DeskInjectionKey: toolbarDesk } = openDesk({
  context: {
    activeTool,
    handleClick: (id: string | number, type: "button" | "toggle") => {
      clickHistory.value.push({ id, time: Date.now() });

      if (type === "toggle") {
        activeTool.value = activeTool.value === id ? null : id;
      } else {
        console.log(`Button clicked: ${id}`);
      }
    },
    isActive: (id: string | number) => activeTool.value === id,
  },
  onCheckIn: (id, data) => {},
});

provide("toolbarDesk", { deskSymbol: toolbarDesk });

const allTools = computed(() =>
  desk.getAll().sort((a, b) => String(a.id).localeCompare(String(b.id))),
);

const lastAction = computed(() => {
  const last = clickHistory.value[clickHistory.value.length - 1];
  if (!last) return "None";
  const tool = desk.get(last.id);
  return `${tool?.data.label || last.id} at ${new Date(last.time).toLocaleTimeString()}`;
});
</script>

<template>
  <div class="w-full max-w-4xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useCheckIn - Toolbar Demo</h2>
      <p class="text-muted-foreground">
        Dynamic toolbar with buttons, toggles, and separators managed by
        check-in desk
      </p>
    </div>

    <div class="border border-border rounded-lg p-2 bg-background">
      <div class="flex items-center gap-1">
        <ToolbarButton id="new" label="New" icon="📄" type="button" />
        <ToolbarButton id="open" label="Open" icon="📂" type="button" />
        <ToolbarButton id="save" label="Save" icon="💾" type="button" />

        <ToolbarSeparator id="sep1" />

        <ToolbarButton id="bold" label="Bold" icon="B" type="toggle" />
        <ToolbarButton id="italic" label="Italic" icon="I" type="toggle" />
        <ToolbarButton
          id="underline"
          label="Underline"
          icon="U"
          type="toggle"
        />

        <ToolbarSeparator id="sep2" />

        <ToolbarButton
          id="align-left"
          label="Align Left"
          icon="⬅️"
          type="toggle"
        />
        <ToolbarButton
          id="align-center"
          label="Align Center"
          icon="⏸️"
          type="toggle"
        />
        <ToolbarButton
          id="align-right"
          label="Align Right"
          icon="➡️"
          type="toggle"
        />

        <ToolbarSeparator id="sep3" />

        <ToolbarButton
          id="disabled"
          label="Disabled"
          icon="🚫"
          type="button"
          :disabled="true"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="p-4 border border-border rounded-lg">
        <h3 class="font-semibold mb-2">Active Toggles</h3>
        <div class="text-sm text-muted-foreground">
          {{ activeTool ? desk.get(activeTool)?.data.label : "None" }}
        </div>
      </div>

      <div class="p-4 border border-border rounded-lg">
        <h3 class="font-semibold mb-2">Last Action</h3>
        <div class="text-sm text-muted-foreground">
          {{ lastAction }}
        </div>
      </div>
    </div>

    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <p><strong>Total Tools:</strong> {{ allTools.length }}</p>
        <p>
          <strong>Registered IDs:</strong>
          {{ allTools.map((t) => t.id).join(", ") }}
        </p>
        <p><strong>Click History:</strong> {{ clickHistory.length }} clicks</p>
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

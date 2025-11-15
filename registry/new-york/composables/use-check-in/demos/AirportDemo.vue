<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import { useCheckIn } from '~~/registry/new-york/composables/use-check-in/useCheckIn';
import AirportPassenger from './AirportPassenger.vue';

interface PassengerData {
  name: string;
  seat: string;
  baggage: number;
  fareClass: 'Business' | 'Premium' | 'Eco';
  checkedInAt?: Date;
}

// The airport check-in desk
const flightNumber = ref('AF1234');
const gate = ref('A12');
const departureTime = ref('14:30');

// Aircraft type and seat configuration
type AircraftType = 'Airbus A320' | 'Boeing 737';
const aircraftType = ref<AircraftType>('Airbus A320');
const aircraftConfig: Record<
  AircraftType,
  {
    rows: { Business: number[]; Premium: number[]; Eco: number[] };
    letters: { Business: string[]; Premium: string[]; Eco: string[] };
    totalSeats: number;
  }
> = {
  'Airbus A320': {
    rows: {
      Business: [1, 2, 3, 4],
      Premium: [5, 6, 7, 8, 9],
      Eco: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    },
    letters: {
      Business: ['A', 'C', 'D', 'F'],
      Premium: ['A', 'B', 'C', 'D', 'E', 'F'],
      Eco: ['A', 'B', 'C', 'D', 'E', 'F'],
    },
    totalSeats: 174,
  },
  'Boeing 737': {
    rows: {
      Business: [1, 2, 3],
      Premium: [4, 5, 6, 7],
      Eco: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    },
    letters: {
      Business: ['A', 'C', 'D', 'F'],
      Premium: ['A', 'B', 'C', 'D', 'E', 'F'],
      Eco: ['A', 'B', 'C', 'D', 'E', 'F'],
    },
    totalSeats: 162,
  },
};

// Already occupied seats (to avoid duplicates)
const occupiedSeats = ref(new Set<string>());

// Mapping of fare classes to boarding groups
const boardingGroups = ref({
  Business: 'A',
  Premium: 'B',
  Eco: 'C',
});

// Maximum baggage weight by fare class (in kg)
const maxBaggageWeight = {
  Business: 40,
  Premium: 30,
  Eco: 23,
};

// Function to add baggage (checks maximum weight)
const addBaggage = (passengerId: string, weight: number = 10): boolean => {
  const passenger = airportDesk.desk.get(passengerId);
  if (!passenger) return false;

  const currentWeight = passenger.data.baggage;
  const maxWeight = maxBaggageWeight[passenger.data.fareClass];
  const newWeight = currentWeight + weight;

  if (newWeight > maxWeight) {
    console.log(
      `❌ ${passenger.data.name}: Cannot add ${weight}kg (max ${maxWeight}kg, current ${currentWeight}kg)`
    );
    return false;
  }

  // Using update() to update baggage
  airportDesk.desk.update(passengerId, { baggage: newWeight });
  console.log(
    `➕ ${passenger.data.name}: Adding ${weight}kg of baggage (${currentWeight}kg → ${newWeight}kg)`
  );
  return true;
};

// Function to remove baggage
const removeBaggage = (passengerId: string, weight: number = 10): boolean => {
  const passenger = airportDesk.desk.get(passengerId);
  if (!passenger) return false;

  const currentWeight = passenger.data.baggage;
  const newWeight = Math.max(0, currentWeight - weight);

  // Using update() to update baggage
  airportDesk.desk.update(passengerId, { baggage: newWeight });
  console.log(
    `➖ ${passenger.data.name}: Removing ${weight}kg of baggage (${currentWeight}kg → ${newWeight}kg)`
  );
  return true;
};

// Function to assign a new seat (desk's responsibility)
const assignSeat = (
  passengerId: string,
  passengerName: string,
  fareClass: 'Business' | 'Premium' | 'Eco' = 'Eco'
) => {
  const config = aircraftConfig[aircraftType.value];
  const availableRows = config.rows[fareClass];
  const availableLetters = config.letters[fareClass];

  // Generate all possible combinations for this class
  const possibleSeats: string[] = [];
  for (const row of availableRows) {
    for (const letter of availableLetters) {
      const seat = `${row}${letter}`;
      if (!occupiedSeats.value.has(seat)) {
        possibleSeats.push(seat);
      }
    }
  }

  // If no seat available
  if (possibleSeats.length === 0) {
    console.log(`❌ No seat available in ${fareClass} class for ${passengerName}`);
    return null;
  }

  // Choose a random seat from available ones
  const newSeat = possibleSeats[Math.floor(Math.random() * possibleSeats.length)];

  if (!newSeat) {
    console.log(`❌ Error assigning seat for ${passengerName}`);
    return null;
  }

  const passenger = airportDesk.desk.get(passengerId);
  const oldSeat = passenger?.data.seat;

  // Direct registry update to avoid re-triggering onCheckIn
  if (passenger) {
    // Release the old seat
    if (oldSeat) {
      occupiedSeats.value.delete(oldSeat);
    }

    // Occupy the new seat
    occupiedSeats.value.add(newSeat);
    airportDesk.desk.update(passengerId, { seat: newSeat });
  }

  if (oldSeat) {
    console.log(`💺 The desk changed ${passengerName}'s seat: ${oldSeat} → ${newSeat}`);
  } else {
    console.log(`💺 The desk assigned seat ${newSeat} to ${passengerName} (${fareClass})`);
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

// Opening the check-in desk with flight information
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
    // The desk automatically assigns a seat ONLY during initial check-in
    // (if the passenger doesn't already have a seat)
    if (!data.seat) {
      const assignedSeat = assignSeat(String(id), data.name, data.fareClass);
      console.log(`✅ ${data.name} has checked in at the desk with seat ${assignedSeat}!`);
    }
  },
  onCheckOut: (id) => {
    console.log(`🚪 Passenger ${id} has left the desk`);
  },
});

// Provide the deskSymbol so children can inject it
provide('airportDesk', { deskSymbol: airportDesk.DeskInjectionKey });

// List of registered passengers
const passengers = computed(() => {
  const all = airportDesk.desk.getAll();
  // Sort by fare class (Business > Premium > Eco)
  const fareOrder = { Business: 0, Premium: 1, Eco: 2 };
  return all.sort((a, b) => fareOrder[a.data.fareClass] - fareOrder[b.data.fareClass]);
});

// Flight statistics
const stats = computed(() => {
  const config = aircraftConfig[aircraftType.value];
  return {
    total: passengers.value.length,
    groupA: passengers.value.filter((p) => boardingGroups.value[p.data.fareClass] === 'A').length,
    groupB: passengers.value.filter((p) => boardingGroups.value[p.data.fareClass] === 'B').length,
    groupC: passengers.value.filter((p) => boardingGroups.value[p.data.fareClass] === 'C').length,
    totalWeight: passengers.value.reduce((sum, p) => sum + p.data.baggage, 0),
    totalSeats: config.totalSeats,
    occupiedSeats: occupiedSeats.value.size,
    availableSeats: config.totalSeats - occupiedSeats.value.size,
  };
});

// Boarding all passengers from a group
const boardGroup = (group: 'A' | 'B' | 'C') => {
  const groupPassengers = passengers.value
    .filter((p) => boardingGroups.value[p.data.fareClass] === group)
    .map((p) => p.id);

  console.log(`📢 Boarding group ${group}: ${groupPassengers.length} passengers`);
};

// Initial passenger list (base data)
const passengersList = ref([
  { id: 'passenger-1', name: 'Sophie Martin', fareClass: 'Business' as const },
  { id: 'passenger-2', name: 'Jean Dupont', fareClass: 'Premium' as const },
  { id: 'passenger-3', name: 'Marie Lambert', fareClass: 'Business' as const },
  { id: 'passenger-4', name: 'Pierre Dubois', fareClass: 'Eco' as const },
  { id: 'passenger-5', name: 'Claire Bernard', fareClass: 'Premium' as const },
]);

// Change gate
const changeGate = () => {
  const gates = ['A12', 'B5', 'C8', 'D3'];
  const currentIndex = gates.indexOf(gate.value);
  const newGate = gates[(currentIndex + 1) % gates.length];
  if (newGate) gate.value = newGate;
};

// Change aircraft type (resets seats)
const changeAircraft = () => {
  const types: AircraftType[] = ['Airbus A320', 'Boeing 737'];
  const currentIndex = types.indexOf(aircraftType.value);
  const nextType = types[(currentIndex + 1) % types.length];
  if (!nextType) return;

  aircraftType.value = nextType;

  // Reset occupied seats
  occupiedSeats.value.clear();

  // Reassign all seats
  passengers.value.forEach((p) => {
    assignSeat(String(p.id), p.data.name, p.data.fareClass);
  });

  console.log(`✈️ Aircraft change: ${aircraftType.value}`);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Flight display panel -->
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

    <!-- Check-in statistics -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-muted p-4 rounded-lg">
        <h4 class="font-semibold mb-2 text-sm">📊 Passengers</h4>
        <div class="text-2xl font-bold">{{ stats.total }}</div>
      </div>
      <div class="bg-muted p-4 rounded-lg">
        <h4 class="font-semibold mb-2 text-sm">💺 Seats</h4>
        <div class="text-2xl font-bold">{{ stats.occupiedSeats }}/{{ stats.totalSeats }}</div>
        <div class="text-xs text-muted-foreground mt-1">{{ stats.availableSeats }} available</div>
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

    <!-- Boarding groups -->
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

    <!-- Passenger list (auto check-in via their components) -->
    <!-- The desk is injected via provide/inject by openDesk -->
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

    <!-- Legend -->
    <div class="text-xs text-muted-foreground space-y-1 border-t pt-4">
      <div><strong>💡 Metaphor:</strong></div>
      <div>• <strong>Desk</strong> = Airport check-in desk</div>
      <div>
        • <strong>Check-in</strong> = Passenger registers with their data (name, seat, baggage)
      </div>
      <div>• <strong>Check-out</strong> = Passenger leaves the desk (component unmounted)</div>
      <div>• <strong>Extra context</strong> = Shared flight info (number, gate, time)</div>
      <div>• <strong>Registry</strong> = List of registered passengers sorted by group</div>
    </div>
  </div>
</template>

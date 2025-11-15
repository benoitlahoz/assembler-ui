<script setup lang="ts">
import { ref, computed, inject, type InjectionKey } from 'vue';
import {
  useCheckIn,
  type CheckInDesk,
} from '~~/registry/new-york/composables/use-check-in/useCheckIn';

interface PassengerData {
  name: string;
  seat: string;
  baggage: number;
  fareClass: 'Business' | 'Premium' | 'Eco';
  checkedInAt?: Date;
}

// Retrieve the desk Symbol provided by the parent
const airportDesk = inject<{ deskSymbol: InjectionKey<CheckInDesk<PassengerData>> }>(
  'airportDesk'
)!;

const props = defineProps<{
  id: string;
  name: string;
  fareClass: 'Business' | 'Premium' | 'Eco';
}>();

const isCheckedIn = ref(true);
const checkInTime = ref<Date>(new Date());

const { checkIn } = useCheckIn<PassengerData>();

// The passenger checks in at the desk using the injected deskSymbol
const { desk } = checkIn(airportDesk?.deskSymbol, {
  required: true,
  autoCheckIn: true,
  id: props.id,
  data: {
    name: props.name,
    seat: '', // The seat will be assigned by the desk via onCheckIn
    baggage: 0, // The passenger starts without baggage
    fareClass: props.fareClass,
    checkedInAt: checkInTime.value,
  },
});

if (!desk) {
  throw new Error('AirportPassenger must be used within a desk context');
}

// Access context via the desk (merged in openDesk)
const context = {
  flightNumber: (desk as any).flightNumber,
  gate: (desk as any).gate,
  departureTime: (desk as any).departureTime,
  boardingGroups: (desk as any).boardingGroups,
};

console.log(
  `🚶 ${props.name} arrives at the desk... Class ${props.fareClass} (Group ${context.boardingGroups.value[props.fareClass]})`
);

// The seat is managed only by the desk - we read it directly
const currentSeat = computed(() => desk.get(props.id)?.data.seat || '');

// Baggage weight is managed by the desk
const currentBaggageWeight = computed(() => desk.get(props.id)?.data.baggage || 0);

// Maximum weight for this class
const maxWeight = computed(() => (desk as any).maxBaggageWeight[props.fareClass]);

// Check if we can add baggage
const canAddBaggage = computed(() => currentBaggageWeight.value < maxWeight.value);

// Add baggage
const handleAddBaggage = () => {
  (desk as any).addBaggage(props.id, 10);
};

// Remove baggage
const handleRemoveBaggage = () => {
  (desk as any).removeBaggage(props.id, 10);
};

// Access flight information shared via injected extraContext
const flightInfo = computed(() => ({
  flightNumber: context.flightNumber,
  gate: context.gate,
  departureTime: context.departureTime,
}));

// Calculate the boarding group from the fare class
const boardingGroup = computed(() => context.boardingGroups.value[props.fareClass]);

// Color badge according to fare class
const groupColor = computed(() => {
  switch (props.fareClass) {
    case 'Business':
      return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
    case 'Premium':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
    case 'Eco':
      return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700';
  }
});

// Temporarily unregister
const toggleCheckIn = () => {
  if (!desk) return;

  if (isCheckedIn.value) {
    const previousSeat = currentSeat.value;
    desk.checkOut(props.id);
    isCheckedIn.value = false;
    console.log(`❌ ${props.name} cancelled their check-in and released seat ${previousSeat}`);
  } else {
    // The seat will be automatically assigned by the desk's onCheckIn
    desk.checkIn(props.id, {
      name: props.name,
      seat: '', // Will be assigned by the desk via onCheckIn
      baggage: 0, // The passenger starts again without baggage
      fareClass: props.fareClass,
      checkedInAt: new Date(),
    });
    isCheckedIn.value = true;
    checkInTime.value = new Date();
    console.log(`✅ ${props.name} re-checks in at the desk`);
  }
};
</script>

<template>
  <div
    class="flex items-center gap-3 p-3 rounded-lg border transition-all"
    :class="
      isCheckedIn
        ? 'bg-card border-border'
        : 'bg-muted/50 border-dashed border-muted-foreground/30 opacity-60'
    "
  >
    <!-- Check-in status -->
    <div class="text-2xl">
      {{ isCheckedIn ? '✅' : '⏳' }}
    </div>

    <!-- Passenger info -->
    <div class="flex-1 space-y-1">
      <div class="flex items-center gap-2">
        <span class="font-semibold">{{ name }}</span>
        <span class="px-2 py-0.5 rounded text-xs font-medium border" :class="groupColor">
          {{ fareClass }} (Groupe {{ boardingGroup }})
        </span>
      </div>
      <div class="text-sm text-muted-foreground">💺 Seat {{ currentSeat || '—' }}</div>
      <div class="text-sm flex items-center gap-2">
        <span class="text-muted-foreground"
          >🧳 {{ currentBaggageWeight }}kg / {{ maxWeight }}kg</span
        >
        <span
          v-if="currentBaggageWeight >= maxWeight"
          class="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium"
        >
          Max reached
        </span>
      </div>
      <div v-if="isCheckedIn && checkInTime" class="text-xs text-muted-foreground">
        ⏰ Checked in at
        {{ checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}
      </div>
      <div class="text-xs text-muted-foreground">
        ✈️ Flight {{ flightInfo.flightNumber.value }} • 🚪 Gate {{ flightInfo.gate.value }} • 🕐
        {{ flightInfo.departureTime.value }}
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-1">
      <!-- Baggage management -->
      <div v-if="isCheckedIn" class="flex gap-1">
        <button
          @click="handleRemoveBaggage"
          :disabled="currentBaggageWeight === 0"
          class="px-2 py-1 rounded text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Remove 10kg"
        >
          ➖
        </button>
        <button
          @click="handleAddBaggage"
          :disabled="!canAddBaggage"
          class="px-2 py-1 rounded text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed"
          :title="canAddBaggage ? 'Add 10kg' : 'Maximum weight reached'"
        >
          ➕
        </button>
      </div>

      <!-- Check-in / Check-out -->
      <button
        @click="toggleCheckIn"
        class="px-3 py-1 rounded text-xs font-medium"
        :class="
          isCheckedIn
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        "
      >
        {{ isCheckedIn ? '❌ Cancel' : '✅ Check In' }}
      </button>
    </div>
  </div>
</template>

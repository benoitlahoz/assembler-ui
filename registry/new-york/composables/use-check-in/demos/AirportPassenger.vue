<script setup lang="ts">
import { ref, computed, inject, type InjectionKey } from 'vue';
import { useCheckIn, type CheckInDesk } from '../useCheckIn';

interface PassengerData {
  name: string;
  seat: string;
  baggage: number;
  fareClass: 'Business' | 'Premium' | 'Eco';
  checkedInAt?: Date;
}

// Récupère le Symbol du desk fourni par le parent
const airportDesk = inject<{ deskSymbol: InjectionKey<CheckInDesk<PassengerData>> }>(
  'airportDesk'
)!;

const props = defineProps<{
  id: string;
  name: string;
  baggage: number;
  fareClass: 'Business' | 'Premium' | 'Eco';
}>();

const isCheckedIn = ref(true);
const checkInTime = ref<Date>(new Date());

const { checkIn } = useCheckIn<PassengerData>();

// Le passager s'enregistre au comptoir en utilisant le deskSymbol injecté
const { desk } = checkIn(airportDesk?.deskSymbol, {
  required: true,
  autoCheckIn: true,
  id: props.id,
  data: {
    name: props.name,
    seat: '', // Le siège sera assigné par le desk via onCheckIn
    baggage: props.baggage,
    fareClass: props.fareClass,
    checkedInAt: checkInTime.value,
  },
});

if (!desk) {
  throw new Error('AirportPassenger doit être utilisé dans un contexte de desk');
}

// Accéder à extraContext via le desk (mergé dans openDesk)
const extraContext = {
  flightNumber: (desk as any).flightNumber,
  gate: (desk as any).gate,
  departureTime: (desk as any).departureTime,
  boardingGroups: (desk as any).boardingGroups,
};

console.log(
  `🚶 ${props.name} se présente au comptoir... Classe ${props.fareClass} (Groupe ${extraContext.boardingGroups.value[props.fareClass]})`
);

// Le siège est géré uniquement par le desk - on le lit directement
const currentSeat = computed(() => desk.get(props.id)?.data.seat || '');

// Accès aux infos du vol partagées via extraContext injecté
const flightInfo = computed(() => ({
  flightNumber: extraContext.flightNumber,
  gate: extraContext.gate,
  departureTime: extraContext.departureTime,
}));

// Calculer le boarding group à partir de la classe tarifaire
const boardingGroup = computed(() => extraContext.boardingGroups.value[props.fareClass]);

// Badge de couleur selon la classe tarifaire
// Badge de couleur selon la classe tarifaire
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

// Se désinscrire temporairement
const toggleCheckIn = () => {
  if (!desk) return;

  if (isCheckedIn.value) {
    const previousSeat = currentSeat.value;
    desk.checkOut(props.id);
    isCheckedIn.value = false;
    console.log(`❌ ${props.name} a annulé son enregistrement et libéré le siège ${previousSeat}`);
  } else {
    // Le siège sera assigné automatiquement par onCheckIn du desk
    desk.checkIn(props.id, {
      name: props.name,
      seat: '', // Sera assigné par le desk via onCheckIn
      baggage: props.baggage,
      fareClass: props.fareClass,
      checkedInAt: new Date(),
    });
    isCheckedIn.value = true;
    checkInTime.value = new Date();
    console.log(`✅ ${props.name} se ré-enregistre au comptoir`);
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
    <!-- Statut d'enregistrement -->
    <div class="text-2xl">
      {{ isCheckedIn ? '✅' : '⏳' }}
    </div>

    <!-- Infos passager -->
    <div class="flex-1 space-y-1">
      <div class="flex items-center gap-2">
        <span class="font-semibold">{{ name }}</span>
        <span class="px-2 py-0.5 rounded text-xs font-medium border" :class="groupColor">
          {{ fareClass }} (Groupe {{ boardingGroup }})
        </span>
      </div>
      <div class="text-sm text-muted-foreground">
        💺 Siège {{ currentSeat || '—' }} • 🧳 {{ baggage }} bagage{{ baggage > 1 ? 's' : '' }}
      </div>
      <div v-if="isCheckedIn && checkInTime" class="text-xs text-muted-foreground">
        ⏰ Enregistré à
        {{ checkInTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
      </div>
      <div class="text-xs text-muted-foreground">
        ✈️ Vol {{ flightInfo.flightNumber.value }} • 🚪 Porte {{ flightInfo.gate.value }} • 🕐
        {{ flightInfo.departureTime.value }}
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        @click="toggleCheckIn"
        class="px-3 py-1 rounded text-xs font-medium"
        :class="
          isCheckedIn
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        "
      >
        {{ isCheckedIn ? '❌ Annuler' : "✅ S'enregistrer" }}
      </button>
    </div>
  </div>
</template>

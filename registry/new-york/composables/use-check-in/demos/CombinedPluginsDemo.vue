<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  useCheckIn,
  createActiveItemPlugin,
  createValidationPlugin,
  createLoggerPlugin,
  createHistoryPlugin,
  type HistoryEntry,
} from '../index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';

interface Product {
  name: string;
  price: number;
  stock: number;
}

// Create desk with ALL plugins combined
const { createDesk } = useCheckIn<Product>();
const { desk } = createDesk('productsDesk', {
  plugins: [
    // Active item tracking
    createActiveItemPlugin(),

    // Validation
    createValidationPlugin({
      required: ['name', 'price', 'stock'],
      validate: (data) => {
        if (data.price <= 0) return 'Price must be positive';
        if (data.stock < 0) return 'Stock cannot be negative';
        if (data.name.length < 3) return 'Name must be at least 3 characters';
        return true;
      },
    }),

    // Logging
    createLoggerPlugin({
      prefix: '[ProductsDemo]',
      verbose: false,
    }),

    // History
    createHistoryPlugin({ maxHistory: 30 }),
  ],
  debug: false,
});

// Type assertion for all plugin methods
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

// Sample products
const initialProducts = [
  { id: 'prod1', name: 'Laptop', price: 999, stock: 10 },
  { id: 'prod2', name: 'Mouse', price: 29, stock: 50 },
  { id: 'prod3', name: 'Keyboard', price: 79, stock: 25 },
];

initialProducts.forEach((p) =>
  desk.checkIn(p.id, { name: p.name, price: p.price, stock: p.stock })
);

// State
const products = ref(desk.getAll());
const formName = ref('');
const formPrice = ref<number | undefined>(undefined);
const formStock = ref<number | undefined>(undefined);
const statusMessage = ref('');

// Computed
const history = computed(() => enhancedDesk.getHistory());
const activeProduct = computed(() => {
  const active = enhancedDesk.getActive();
  return active?.data;
});

// Watch active product
watch(
  () => enhancedDesk.activeId.value,
  (id) => {
    if (id) {
      const product = desk.get(id);
      statusMessage.value = `Selected: ${product?.data.name}`;
    } else {
      statusMessage.value = '';
    }
  }
);

// Add product
const addProduct = () => {
  if (!formName.value || formPrice.value === undefined || formStock.value === undefined) {
    statusMessage.value = '❌ Please fill all fields';
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
    formName.value = '';
    formPrice.value = undefined;
    formStock.value = undefined;
    products.value = desk.getAll();
    enhancedDesk.setActive(productId);
  } else {
    statusMessage.value = '❌ Validation failed';
  }
};

// Update stock
const updateStock = (id: string | number, change: number) => {
  const product = desk.get(id);
  if (product) {
    const newStock = Math.max(0, product.data.stock + change);
    desk.update(id, { stock: newStock });
    products.value = desk.getAll();
  }
};

// Remove product
const removeProduct = (id: string | number) => {
  desk.checkOut(id);
  products.value = desk.getAll();
  if (enhancedDesk.activeId.value === id) {
    enhancedDesk.clearActive();
  }
};

// Format time
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

// Get action color
const getActionColor = (action: string) => {
  switch (action) {
    case 'check-in':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'check-out':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'update':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
</script>

<template>
  <div class="w-full max-w-7xl mx-auto p-6 space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Combined Plugins Demo</h2>
      <p class="text-sm text-muted-foreground">
        This demo shows all 4 plugins working together: Active Item + Validation + Logger + History
      </p>
    </div>

    <!-- Status Bar -->
    <div v-if="statusMessage" class="p-3 bg-muted rounded-lg text-sm">
      {{ statusMessage }}
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Products List -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Add Product Form -->
        <div class="border rounded-lg p-6 space-y-4">
          <h3 class="text-lg font-semibold">Add Product</h3>
          <div class="grid md:grid-cols-3 gap-4">
            <Input v-model="formName" placeholder="Product name (min 3 chars)" />
            <Input v-model.number="formPrice" type="number" placeholder="Price (> 0)" />
            <Input v-model.number="formStock" type="number" placeholder="Stock (≥ 0)" />
          </div>
          <Button class="w-full" @click="addProduct"> Add Product </Button>
        </div>

        <!-- Products Grid -->
        <div class="border rounded-lg p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Products ({{ products.length }})</h3>
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
                'border-primary bg-primary/5': enhancedDesk.activeId.value === product.id,
                'hover:bg-muted/30': enhancedDesk.activeId.value !== product.id,
              }"
              @click="enhancedDesk.setActive(product.id)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-semibold">{{ product.data.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    ${{ product.data.price.toFixed(2) }} · Stock: {{ product.data.stock }}
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
                  <Button variant="ghost" size="sm" @click.stop="updateStock(product.id, 1)">
                    +
                  </Button>
                  <Button variant="ghost" size="sm" @click.stop="removeProduct(product.id)">
                    ×
                  </Button>
                </div>
              </div>
            </div>

            <div v-if="products.length === 0" class="text-center py-8 text-muted-foreground">
              No products yet
            </div>
          </div>
        </div>

        <!-- Active Product Details -->
        <div v-if="activeProduct" class="border rounded-lg p-6 space-y-2 bg-primary/5">
          <h3 class="text-lg font-semibold">Active Product Details</h3>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div class="text-sm text-muted-foreground">Name</div>
              <div class="font-medium">{{ activeProduct.name }}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Price</div>
              <div class="font-medium">${{ activeProduct.price.toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Stock</div>
              <div class="font-medium">{{ activeProduct.stock }} units</div>
            </div>
          </div>
        </div>
      </div>

      <!-- History Sidebar -->
      <div class="border rounded-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">History</h3>
          <Button variant="outline" size="sm" @click="enhancedDesk.clearHistory()"> Clear </Button>
        </div>

        <div class="text-xs text-muted-foreground">{{ history.length }} operations tracked</div>

        <div class="space-y-2 max-h-[600px] overflow-y-auto">
          <div
            v-for="(entry, index) in [...history].reverse()"
            :key="index"
            class="p-2 rounded border text-xs"
            :class="getActionColor(entry.action)"
          >
            <div class="font-semibold capitalize">{{ entry.action }}</div>
            <div v-if="entry.data" class="truncate">{{ entry.data.name }}</div>
            <div class="text-xs opacity-70">{{ formatTime(entry.timestamp) }}</div>
          </div>

          <div v-if="history.length === 0" class="text-center py-8 text-muted-foreground text-sm">
            No history
          </div>
        </div>
      </div>
    </div>

    <!-- Plugins Summary -->
    <div class="border rounded-lg p-6 space-y-4">
      <h3 class="text-lg font-semibold">Active Plugins</h3>
      <div class="grid md:grid-cols-4 gap-4">
        <div class="p-4 bg-green-50 border border-green-200 rounded">
          <div class="font-semibold text-green-900">✓ Active Item</div>
          <div class="text-xs text-green-700 mt-1">Tracking selected product</div>
        </div>
        <div class="p-4 bg-blue-50 border border-blue-200 rounded">
          <div class="font-semibold text-blue-900">✓ Validation</div>
          <div class="text-xs text-blue-700 mt-1">Price > 0, Stock ≥ 0</div>
        </div>
        <div class="p-4 bg-purple-50 border border-purple-200 rounded">
          <div class="font-semibold text-purple-900">✓ Logger</div>
          <div class="text-xs text-purple-700 mt-1">Console logging enabled</div>
        </div>
        <div class="p-4 bg-orange-50 border border-orange-200 rounded">
          <div class="font-semibold text-orange-900">✓ History</div>
          <div class="text-xs text-orange-700 mt-1">{{ history.length }} / 30 entries</div>
        </div>
      </div>
    </div>
  </div>
</template>

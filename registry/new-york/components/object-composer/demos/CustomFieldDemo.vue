<script setup lang="ts">
import { ref } from 'vue';
import {
  ObjectComposer,
  ObjectComposerHeader,
  ObjectComposerTitle,
  ObjectComposerDescription,
  ObjectComposerItem,
  ObjectComposerField,
} from '~~/registry/new-york/components/object-composer';
import { Separator } from '@/components/ui/separator';
import CustomObjectComposerField from './CustomObjectComposerField.vue';

const serverMetrics = ref({
  cpu: 78,
  memory: 4096,
  disk: 512000,
  uptime: 86400,
  requests: 15234,
  errors: 12,
  latency: 45.6,
  healthy: true,
  region: 'us-east-1',
  environment: 'production',
});

const userProfile = ref({
  username: 'john.doe',
  email: 'john@example.com',
  role: 'admin',
  active: true,
  loginCount: 342,
  lastLogin: '2025-11-15',
  permissions: ['read', 'write', 'delete'],
});
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-bold mb-2">Custom ObjectComposerField (asChild Pattern)</h2>
      <p class="text-muted-foreground mb-6">
        Use the <code class="bg-muted px-1 rounded text-sm">asChild</code> pattern to replace
        ObjectComposerField rendering. Data flows via useCheckIn (desk context) - no props needed!
      </p>
    </div>

    <!-- Two column layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Server Metrics -->
      <div class="border rounded-lg p-4 bg-card">
        <ObjectComposer v-model="serverMetrics">
          <ObjectComposerHeader>
            <ObjectComposerTitle>
              <span class="flex items-center gap-2">
                <span class="text-green-600">●</span>
                Server Metrics
              </span>
            </ObjectComposerTitle>
          </ObjectComposerHeader>
          <Separator class="mb-4" />
          <ObjectComposerItem>
            <template #default="{ itemKey, value, valueType, displayValue }">
              <CustomObjectComposerField
                :item-key="itemKey"
                :value="value"
                :value-type="valueType"
                :display-value="displayValue"
              />
            </template>
          </ObjectComposerItem>
        </ObjectComposer>
      </div>

      <!-- User Profile -->
      <div class="border rounded-lg p-4 bg-card">
        <ObjectComposer v-model="userProfile">
          <ObjectComposerHeader>
            <ObjectComposerTitle>
              <span class="flex items-center gap-2">
                <span class="text-blue-600">●</span>
                User Profile
              </span>
            </ObjectComposerTitle>
          </ObjectComposerHeader>
          <Separator class="mb-4" />
          <ObjectComposerItem>
            <ObjectComposerField as-child v-slot="{}">
              <div class="flex items-center gap-2 p-2 rounded hover:bg-accent/50 transition-colors">
                <!-- Type indicator dot -->
                <div :class="cn('w-2 h-2 rounded-full', typeColor)" />

                <!-- Key with fixed width -->
                <span class="font-mono text-xs text-muted-foreground min-w-24">
                  {{ itemKey }}
                </span>

                <!-- Value as badge -->
                <Badge :variant="badgeVariant" class="font-mono text-xs">
                  {{ displayValue }}
                </Badge>

                <!-- Desk status indicator -->
                <span v-if="itemDesk" class="ml-auto text-xs text-green-600" title="Desk connected">
                  ●
                </span>
              </div>
            </ObjectComposerField>
          </ObjectComposerItem>
        </ObjectComposer>
      </div>
    </div>

    <Separator />

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="border rounded-lg p-4">
        <h4 class="font-semibold mb-2 text-sm">🎨 Custom Styling</h4>
        <p class="text-xs text-muted-foreground">
          Badge components with color-coded types, hover effects, and visual indicators
        </p>
      </div>
      <div class="border rounded-lg p-4">
        <h4 class="font-semibold mb-2 text-sm">🔌 Desk Access</h4>
        <p class="text-xs text-muted-foreground">
          Injects desk from parent item for advanced features like live updates and validation
        </p>
      </div>
      <div class="border rounded-lg p-4">
        <h4 class="font-semibold mb-2 text-sm">⚡ Type Indicators</h4>
        <p class="text-xs text-muted-foreground">
          Visual dots showing string (red), number (blue), boolean (purple), null (gray)
        </p>
      </div>
      <div class="border rounded-lg p-4">
        <h4 class="font-semibold mb-2 text-sm">🔄 Reusable</h4>
        <p class="text-xs text-muted-foreground">
          Single component works across all data types with automatic type detection
        </p>
      </div>
    </div>

    <Separator />

    <!-- Code example -->
    <div class="space-y-3">
      <h3 class="font-semibold">Usage (asChild pattern)</h3>
      <div class="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-2">
        <div>&lt;ObjectComposerItem&gt;</div>
        <div class="ml-4">&lt;template #field&gt;</div>
        <div class="ml-8">&lt;ObjectComposerField as-child&gt;</div>
        <div class="ml-12">&lt;CustomObjectComposerField /&gt;</div>
        <div class="ml-8">&lt;/ObjectComposerField&gt;</div>
        <div class="ml-4">&lt;/template&gt;</div>
        <div class="ml-0">&lt;/ObjectComposerItem&gt;</div>
      </div>
      <p class="text-sm text-muted-foreground">
        Use the <code class="bg-muted px-1 py-0.5 rounded">asChild</code> pattern with the
        <code class="bg-muted px-1 py-0.5 rounded">field</code> slot. ObjectComposerField provides
        data via useCheckIn (desk), no props needed! Your custom component receives all data via
        slot props (itemKey, value, valueType, displayValue, desk).
      </p>
    </div>
  </div>
</template>

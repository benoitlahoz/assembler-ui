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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
            <ObjectComposerField
              as-child
              v-slot="{ itemKey, displayValue, typeColor, badgeVariant, itemDesk }"
            >
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
            <ObjectComposerField
              as-child
              v-slot="{ itemKey, displayValue, typeColor, badgeVariant, itemDesk }"
            >
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
  </div>
</template>

<script setup lang="ts">
/**
 * Simple demo of ScreenShareProvider showing basic usage.
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScreenShareProvider, ScreenShareViewer } from '..';
</script>

<template>
  <div class="space-y-4">
    <ScreenShareProvider>
      <template #default="{ startShare, stopShare, isSharing, shareState, shareType, errors }">
        <div class="space-y-4">
          <!-- Controls -->
          <div class="flex gap-2">
            <Button @click="startShare()" :disabled="isSharing">
              {{ isSharing ? 'Sharing...' : 'Start Screen Share' }}
            </Button>

            <Button @click="stopShare()" :disabled="!isSharing" variant="destructive">
              Stop Sharing
            </Button>
          </div>

          <!-- Status info -->
          <div class="border rounded-lg p-4 bg-muted/30 space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="font-medium">Status:</span>
              <Badge
                :variant="
                  shareState === 'active'
                    ? 'default'
                    : shareState === 'error'
                      ? 'destructive'
                      : 'secondary'
                "
              >
                {{ shareState }}
              </Badge>
            </div>
            <div v-if="shareType" class="flex items-center gap-2">
              <span class="font-medium">Share Type:</span>
              <Badge variant="outline">{{ shareType }}</Badge>
            </div>
          </div>

          <!-- Video preview -->
          <div
            class="relative bg-black rounded-lg overflow-hidden border border-muted"
            style="aspect-ratio: 16/9"
          >
            <ScreenShareViewer
              v-if="isSharing"
              :auto-play="true"
              :muted="true"
              class="w-full h-full object-contain"
            />
            <div v-else class="absolute inset-0 flex items-center justify-center bg-muted/50">
              <p class="text-muted-foreground">Click "Start Screen Share" to begin</p>
            </div>

            <!-- Status overlay -->
            <div
              v-if="isSharing"
              class="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs"
            >
              Screen Sharing Active
            </div>
          </div>

          <!-- Errors -->
          <div
            v-if="errors && errors.length > 0"
            class="p-4 rounded border border-destructive bg-destructive/10 text-destructive"
          >
            <p class="font-bold">Errors:</p>
            <ul class="text-sm space-y-1 mt-2">
              <li v-for="(error, index) in errors" :key="index">
                {{ error.message }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </ScreenShareProvider>
  </div>
</template>

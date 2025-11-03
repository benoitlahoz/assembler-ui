<script setup lang="ts">
/**
 * Advanced demo of ScreenShareProvider showing various configuration options.
 */
import { ref, computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScreenShareProvider, ScreenShareViewer, type ScreenShareOptions } from '..';

const includeAudio = ref(false);
const preferCurrentTab = ref(false);
const surfaceSwitching = ref<'include' | 'exclude'>('include');
const systemAudio = ref<'include' | 'exclude'>('exclude');

const shareOptions = computed<ScreenShareOptions>(() => ({
  video: true,
  audio: includeAudio.value,
  preferCurrentTab: preferCurrentTab.value,
  surfaceSwitching: surfaceSwitching.value,
  systemAudio: systemAudio.value,
}));
</script>

<template>
  <div class="space-y-4">
    <ScreenShareProvider>
      <template
        #default="{ startShare, stopShare, isSharing, shareState, shareType, screenStream }"
      >
        <div class="space-y-4">
          <!-- Options panel -->
          <div class="border rounded-lg p-4 bg-muted/30 space-y-4">
            <Label class="text-sm font-bold">Screen Share Options</Label>

            <div class="grid md:grid-cols-2 gap-4">
              <!-- Audio options -->
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeAudio"
                    v-model="includeAudio"
                    :disabled="isSharing"
                    class="h-4 w-4 rounded border-gray-300"
                  />
                  <label for="includeAudio" class="text-sm font-medium leading-none">
                    Include system audio
                  </label>
                </div>

                <div class="space-y-2">
                  <Label for="systemAudio" class="text-sm">System audio option:</Label>
                  <select
                    id="systemAudio"
                    v-model="systemAudio"
                    :disabled="isSharing"
                    class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value="include">Include</option>
                    <option value="exclude">Exclude</option>
                  </select>
                </div>
              </div>

              <!-- Browser options -->
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="preferCurrentTab"
                    v-model="preferCurrentTab"
                    :disabled="isSharing"
                    class="h-4 w-4 rounded border-gray-300"
                  />
                  <label for="preferCurrentTab" class="text-sm font-medium leading-none">
                    Prefer current tab (Chrome/Edge)
                  </label>
                </div>

                <div class="space-y-2">
                  <Label for="surfaceSwitching" class="text-sm">Surface switching:</Label>
                  <select
                    id="surfaceSwitching"
                    v-model="surfaceSwitching"
                    :disabled="isSharing"
                    class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value="include">Include</option>
                    <option value="exclude">Exclude</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex gap-2">
            <Button @click="() => startShare(shareOptions)" :disabled="isSharing">
              {{ isSharing ? 'Sharing...' : 'Start Screen Share' }}
            </Button>

            <Button @click="stopShare()" :disabled="!isSharing" variant="destructive">
              Stop Sharing
            </Button>
          </div>

          <!-- Status and tracks info -->
          <div class="grid md:grid-cols-2 gap-4">
            <!-- Status -->
            <div class="border rounded-lg p-4 bg-muted/30 space-y-2">
              <h4 class="font-medium text-sm">Status:</h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <span>State:</span>
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
                  <span>Share Type:</span>
                  <Badge variant="outline">{{ shareType }}</Badge>
                </div>
              </div>
            </div>

            <!-- Track info -->
            <div class="border rounded-lg p-4 bg-muted/30">
              <h4 class="font-medium mb-2 text-sm">Stream Info:</h4>
              <div v-if="screenStream" class="text-xs space-y-1 font-mono">
                <p>Video tracks: {{ screenStream.getVideoTracks().length }}</p>
                <p>Audio tracks: {{ screenStream.getAudioTracks().length }}</p>
                <p>Total tracks: {{ screenStream.getTracks().length }}</p>
                <p v-if="screenStream.getVideoTracks().length > 0">
                  Active:
                  {{ screenStream.getVideoTracks()[0]?.enabled ? 'Yes' : 'No' }}
                </p>
              </div>
              <p v-else class="text-xs text-muted-foreground">Start sharing to see stream info</p>
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
              :muted="!includeAudio"
              :controls="includeAudio"
              class="w-full h-full object-contain"
            />
            <div v-else class="absolute inset-0 flex items-center justify-center bg-muted/50">
              <p class="text-muted-foreground">Configure options and click "Start Screen Share"</p>
            </div>

            <!-- Status overlay -->
            <div
              v-if="isSharing && shareType"
              class="absolute top-2 left-2 space-y-1 bg-black/70 text-white px-2 py-1 rounded text-xs"
            >
              <div>Sharing: {{ shareType }}</div>
              <div v-if="includeAudio && screenStream?.getAudioTracks().length">
                🎵 Audio enabled
              </div>
            </div>
          </div>
        </div>
      </template>
    </ScreenShareProvider>
  </div>
</template>

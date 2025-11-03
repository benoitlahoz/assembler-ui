# MediaDevicesProvider - Quick Examples

## 🎯 Exemples rapides et concrets

### 1. Simple Camera Preview

```vue
<script setup>
import { ref } from 'vue';
import { MediaDevicesProvider } from '@/components/media-devices-provider';

const videoRef = ref<HTMLVideoElement>();
const selectedCamera = ref<string>();
</script>

<template>
  <MediaDevicesProvider :open="true">
    <template #default="{ cameras, start, stop, isStreamActive }">
      <select v-model="selectedCamera">
        <option v-for="cam in cameras" :key="cam.deviceId" :value="cam.deviceId">
          {{ cam.label }}
        </option>
      </select>
      
      <button 
        v-if="selectedCamera && !isStreamActive(selectedCamera)"
        @click="async () => {
          const stream = await start(selectedCamera, { video: true });
          if (videoRef) videoRef.srcObject = stream;
        }"
      >
        Start Camera
      </button>
      
      <button 
        v-if="selectedCamera && isStreamActive(selectedCamera)"
        @click="() => stop(selectedCamera)"
      >
        Stop Camera
      </button>
      
      <video ref="videoRef" autoplay playsinline />
    </template>
  </MediaDevicesProvider>
</template>
```

### 2. Audio Level Meter

```vue
<script setup>
import { ref, watch } from 'vue';
import { MediaDevicesProvider } from '@/components/media-devices-provider';

const audioLevel = ref(0);
const analyser = ref<AnalyserNode>();

const setupAudioAnalysis = (stream: MediaStream) => {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  analyser.value = audioContext.createAnalyser();
  source.connect(analyser.value);
  
  const dataArray = new Uint8Array(analyser.value.frequencyBinCount);
  
  const updateLevel = () => {
    analyser.value!.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    audioLevel.value = (average / 255) * 100;
    requestAnimationFrame(updateLevel);
  };
  
  updateLevel();
};
</script>

<template>
  <MediaDevicesProvider :open="true">
    <template #default="{ microphones, start, stop }">
      <select @change="async (e) => {
        const stream = await start(e.target.value, { audio: true });
        setupAudioAnalysis(stream);
      }">
        <option v-for="mic in microphones" :key="mic.deviceId" :value="mic.deviceId">
          {{ mic.label }}
        </option>
      </select>
      
      <div class="audio-meter">
        <div class="level" :style="{ width: audioLevel + '%' }" />
      </div>
    </template>
  </MediaDevicesProvider>
</template>

<style scoped>
.audio-meter {
  width: 100%;
  height: 20px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
}

.level {
  height: 100%;
  background: linear-gradient(to right, green, yellow, red);
  transition: width 0.1s;
}
</style>
```

### 3. Multi-Camera Setup

```vue
<script setup>
import { ref } from 'vue';
import { MediaDevicesProvider } from '@/components/media-devices-provider';

const activeCameras = ref<Map<string, HTMLVideoElement>>(new Map());
</script>

<template>
  <MediaDevicesProvider :open="true">
    <template #default="{ cameras, start, stop, stopAll, activeStreamCount }">
      <div class="header">
        <h2>Active Cameras: {{ activeStreamCount }}</h2>
        <button @click="stopAll" :disabled="activeStreamCount === 0">
          Stop All
        </button>
      </div>
      
      <div class="camera-grid">
        <div v-for="camera in cameras" :key="camera.deviceId" class="camera-card">
          <h3>{{ camera.label }}</h3>
          <video 
            :ref="(el) => {
              if (el) activeCameras.set(camera.deviceId, el as HTMLVideoElement);
            }"
            autoplay 
            playsinline 
          />
          <button 
            @click="async () => {
              const stream = await start(camera.deviceId, { video: true });
              const video = activeCameras.get(camera.deviceId);
              if (video) video.srcObject = stream;
            }"
          >
            Start
          </button>
          <button @click="() => stop(camera.deviceId)">
            Stop
          </button>
        </div>
      </div>
    </template>
  </MediaDevicesProvider>
</template>

<style scoped>
.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.camera-card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
}

.camera-card video {
  width: 100%;
  height: auto;
  background: black;
}
</style>
```

### 4. Permissions Check Before Access

```vue
<script setup>
import { ref } from 'vue';
import { MediaDevicesProvider } from '@/components/media-devices-provider';

const permissionsChecked = ref(false);
const permissionsGranted = ref(false);
</script>

<template>
  <MediaDevicesProvider>
    <template #default="{ checkPermissions, cameras, start }">
      <div v-if="!permissionsChecked">
        <button @click="async () => {
          const perms = await checkPermissions();
          permissionsChecked = true;
          permissionsGranted = perms?.camera === 'granted' && perms?.microphone === 'granted';
        }">
          Check Permissions
        </button>
      </div>
      
      <div v-else-if="!permissionsGranted">
        <p>Permissions not granted. Please allow camera and microphone access.</p>
      </div>
      
      <div v-else>
        <p>✅ Permissions granted! You can now use cameras.</p>
        <!-- Your camera UI here -->
      </div>
    </template>
  </MediaDevicesProvider>
</template>
```

### 5. Using the Composable

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { MediaDevicesProvider, useMediaDevices } from '@/components/media-devices-provider';

// Ce composant doit être enfant de MediaDevicesProvider
const CameraComponent = defineComponent({
  setup() {
    const {
      cameras,
      activeStreamCount,
      start,
      stop,
      stopAll,
      isStreamActive,
      switchDevice,
    } = useMediaDevices();
    
    const selectedCameraId = ref<string>();
    
    const startSelectedCamera = async () => {
      if (!selectedCameraId.value) return;
      await start(selectedCameraId.value, {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
    };
    
    const switchToNextCamera = async () => {
      if (!selectedCameraId.value || cameras.value.length < 2) return;
      
      const currentIndex = cameras.value.findIndex(c => c.deviceId === selectedCameraId.value);
      const nextIndex = (currentIndex + 1) % cameras.value.length;
      const nextCamera = cameras.value[nextIndex];
      
      await switchDevice(selectedCameraId.value, nextCamera.deviceId, { video: true });
      selectedCameraId.value = nextCamera.deviceId;
    };
    
    return {
      cameras,
      activeStreamCount,
      selectedCameraId,
      startSelectedCamera,
      switchToNextCamera,
      stopAll,
      isStreamActive,
    };
  },
});
</script>

<template>
  <MediaDevicesProvider :open="true">
    <CameraComponent />
  </MediaDevicesProvider>
</template>
```

### 6. Error Handling with Toast Notifications

```vue
<script setup>
import { ref, watch } from 'vue';
import { MediaDevicesProvider } from '@/components/media-devices-provider';

const showToast = ref(false);
const toastMessage = ref('');
</script>

<template>
  <MediaDevicesProvider 
    :open="true"
    @error="(error) => {
      showToast = true;
      toastMessage = error.message;
      setTimeout(() => showToast = false, 3000);
    }"
  >
    <template #default="{ cameras, errors, clearErrors, lastError }">
      <!-- Your UI -->
      
      <div v-if="showToast" class="toast error">
        {{ toastMessage }}
      </div>
      
      <div v-if="errors.length > 0" class="error-panel">
        <h3>Errors ({{ errors.length }})</h3>
        <p v-if="lastError">Last: {{ lastError.message }}</p>
        <button @click="clearErrors">Clear All</button>
      </div>
    </template>
  </MediaDevicesProvider>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1rem;
  background: #ef4444;
  color: white;
  border-radius: 8px;
  animation: slideIn 0.3s;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
```

### 7. Recording with MediaRecorder

```vue
<script setup>
import { ref } from 'vue';
import { MediaDevicesProvider } from '@/components/media-devices-provider';

const mediaRecorder = ref<MediaRecorder>();
const recordedChunks = ref<Blob[]>([]);
const isRecording = ref(false);

const startRecording = (stream: MediaStream) => {
  recordedChunks.value = [];
  mediaRecorder.value = new MediaRecorder(stream);
  
  mediaRecorder.value.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.value.push(event.data);
    }
  };
  
  mediaRecorder.value.start();
  isRecording.value = true;
};

const stopRecording = () => {
  mediaRecorder.value?.stop();
  isRecording.value = false;
  
  const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'recording.webm';
  a.click();
};
</script>

<template>
  <MediaDevicesProvider :open="true">
    <template #default="{ cameras, start, getStreamInfo }">
      <select 
        @change="async (e) => {
          const stream = await start(e.target.value, { 
            video: true,
            audio: true 
          });
        }"
      >
        <option v-for="cam in cameras" :key="cam.deviceId" :value="cam.deviceId">
          {{ cam.label }}
        </option>
      </select>
      
      <button 
        v-if="!isRecording"
        @click="() => {
          const info = getStreamInfo(selectedCamera);
          if (info) {
            // Get the actual MediaStream from somewhere
            // startRecording(stream);
          }
        }"
      >
        Start Recording
      </button>
      
      <button v-else @click="stopRecording">
        Stop Recording
      </button>
    </template>
  </MediaDevicesProvider>
</template>
```

### 8. Device Stats Dashboard

```vue
<script setup>
import { ref, computed } from 'vue';
import { MediaDevicesProvider } from '@/components/media-devices-provider';
</script>

<template>
  <MediaDevicesProvider :open="true" :debug="true">
    <template #default="{ 
      devices, 
      cameras, 
      microphones, 
      speakers,
      activeStreamCount,
      getActiveDeviceIds,
      errors,
      getDefaultDevice 
    }">
      <div class="dashboard">
        <div class="stat-card">
          <h3>📊 Statistics</h3>
          <div class="stats">
            <div>Total Devices: {{ devices.length }}</div>
            <div>Cameras: {{ cameras.length }}</div>
            <div>Microphones: {{ microphones.length }}</div>
            <div>Speakers: {{ speakers.length }}</div>
            <div>Active Streams: {{ activeStreamCount }}</div>
            <div>Errors: {{ errors.length }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <h3>🎯 Default Devices</h3>
          <div>Camera: {{ getDefaultDevice('videoinput')?.label || 'None' }}</div>
          <div>Microphone: {{ getDefaultDevice('audioinput')?.label || 'None' }}</div>
          <div>Speaker: {{ getDefaultDevice('audiooutput')?.label || 'None' }}</div>
        </div>
        
        <div class="stat-card">
          <h3>🟢 Active Devices</h3>
          <ul>
            <li v-for="id in getActiveDeviceIds()" :key="id">
              <code>{{ id }}</code>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </MediaDevicesProvider>
</template>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.stat-card {
  border: 1px solid #e5e7eb;
  padding: 1rem;
  border-radius: 8px;
  background: white;
}

.stats > div {
  padding: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}
</style>
```

Ces exemples couvrent les cas d'usage les plus courants ! 🚀

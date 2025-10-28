<template>
  <div class="w-full flex justify-start items-center min-h-64 h-96 rounded p-4">
    <Dock
      expand="end"
      orientation="vertical"
    >
      <DockItem>
        <Icon
          name="vscode-icons:file-type-vscode"
          class="w-3/4 h-3/4 min-w-3/4 min-h-3/4"
        />
      </DockItem>
      <DockItem>
        <Icon
          name="vscode-icons:file-type-vue"
          class="w-3/4 h-3/4 min-w-3/4 min-h-3/4"
        />
      </DockItem>
      <DockItem>
        <Icon
          name="octicon:mark-github-16"
          class="w-3/4 h-3/4 min-w-3/4 min-h-3/4"
        />
      </DockItem>
    </Dock>
  </div>
</template>

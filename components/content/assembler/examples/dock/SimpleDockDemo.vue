<template>
  <div class="w-full grid grid-cols-3 grid-rows-3 min-h-128 rounded p-4 gap-4">
    <!-- Top: Dock horizontal, expand end -->
    <div class="col-span-3 flex justify-center items-center">
      <Dock
        expand="end"
        orientation="horizontal"
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

    <!-- Left: Dock vertical, expand end -->
    <div class="row-span-1 col-span-1 flex justify-center items-center">
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

    <!-- Center: Dock scale (expand center) -->
    <div class="row-span-1 col-span-1 flex justify-center items-center">
      <Dock
        expand="center"
        orientation="horizontal"
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

    <!-- Right: Dock vertical, expand start -->
    <div class="row-span-1 col-span-1 flex justify-center items-center">
      <Dock
        expand="start"
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

    <!-- Bottom: Dock horizontal, expand start -->
    <div class="col-span-3 flex justify-center items-center">
      <Dock
        expand="start"
        orientation="horizontal"
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
  </div>
</template>

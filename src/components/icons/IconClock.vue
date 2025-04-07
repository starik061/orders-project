<template>
  <svg
    viewBox="0 0 100 100"
    width="14"
    height="14"
    class="icon-clock"
  >
    <circle
      cx="50"
      cy="50"
      r="46"
      class="clock-stroke"
    />
    <rect
      x="20"
      y="46"
      width="30"
      height="9"
      class="clock-fill"
    />
    <rect
      x="46"
      y="20"
      width="9"
      height="30"
      class="clock-fill"
    />
    <circle
      cx="50"
      cy="50"
      r="4"
      class="clock-fill"
    />
  </svg>
</template>

<style lang="scss" scoped>
.icon-clock .clock-stroke {
  fill: none;
  stroke: var(--color-main-green);
  stroke-width: 11;
}

.icon-clock .clock-fill {
  fill: var(--color-main-green);
}
</style>

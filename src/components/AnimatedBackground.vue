<template>
  <div class="animated-bg" aria-hidden="true">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="orb orb-4"></div>
    <div class="grid-overlay"></div>
  </div>
</template>

<style scoped>
.animated-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: #0a0a0f;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent 70%);
  top: -10%;
  left: -10%;
  animation-duration: 25s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.35), transparent 70%);
  top: 40%;
  right: -15%;
  animation-duration: 22s;
  animation-delay: -5s;
}

.orb-3 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%);
  bottom: -10%;
  left: 30%;
  animation-duration: 28s;
  animation-delay: -10s;
}

.orb-4 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.25), transparent 70%);
  top: 20%;
  left: 50%;
  animation-duration: 20s;
  animation-delay: -15s;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
}
</style>

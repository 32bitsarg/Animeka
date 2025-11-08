'use client'

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Fondo negro sólido */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Grid minimalista muy sutil */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Viñeta sutil para profundidad */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30" />
    </div>
  )
}


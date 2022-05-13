import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './',     
  build: {       
     outDir: 'dist',
          },     
  publicDir: './public',
  optimizeDeps: { 
    include: [
      '@babylonjs/core/Engines/engine',
      '@babylonjs/core/scene',
      '@babylonjs/core/Maths/math.vector',
      '@babylonjs/core/Cameras/arcRotateCamera',
      '@babylonjs/core/Lights/hemisphericLight',
      '@babylonjs/core/Meshes/mesh',
      '@babylonjs/core/Meshes/meshBuilder',
      '@babylonjs/core/Materials/standardMaterial',
      '@babylonjs/core/Loading/sceneLoader',
      '@babylonjs/loaders/glTF/2.0/glTFLoader',
    ],
  },
});

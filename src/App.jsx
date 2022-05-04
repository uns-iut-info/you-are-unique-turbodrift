import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, ArcRotateCamera, StandardMaterial, Color3  } from "@babylonjs/core";
import { SceneComponent } from "./SceneComponent"; // uses above component in same directory
import './App.scss'

let box;

const onSceneReady = (scene) => {
  	// camera
 	 const camera = new ArcRotateCamera("camera1",  0, 0, 20, new Vector3(0, 0, 0), scene);
  	camera.setPosition(new Vector3(11.5, 3.5, 0));	


  const canvas = scene.getEngine().getRenderingCanvas();

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  const groundSize = 400;
  
  const ground = MeshBuilder.CreateGround("ground", {width: groundSize, height: groundSize}, scene);
  const groundMaterial = new StandardMaterial("ground", scene);
  groundMaterial.diffuseColor = new Color3(0.75, 1, 0.25);
  ground.material = groundMaterial;
  ground.position.y = -1.5;
};

/**
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender = (scene) => {
  if (box !== undefined) {
    const deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 10;
    box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  }
};

const App = () => (
  <div className="d-flex justify-content-center align-content-center w-100 h-100">
    <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
  </div>
);
export default App

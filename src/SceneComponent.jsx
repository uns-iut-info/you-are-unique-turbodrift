import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine"
import { Scene } from "@babylonjs/core/scene"
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader"

import "@babylonjs/loaders"


// import "@babylonjs/core/Loading/loadingScreen";
// import "@babylonjs/loaders/glTF";
// import "@babylonjs/core/Materials/standardMaterial";
// import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

export const SceneComponent = ({ antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady, ...rest}) => {
  const reactCanvas = useRef(null);

  // set up basic engine and scene
  useEffect(() => {
    const { current: canvas } = reactCanvas;

    if (!canvas) return;

    const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio);
    const scene = new Scene(engine, sceneOptions);

    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(scene);
      scene.render();
      
    });

    SceneLoader.ImportMesh(
      "",
      "./models/",
      "map.glb",
      scene,
      m => {
        console.log(m)
      }
    )

    scene.onNewMaterialAddedObservable.add(function(mat) {
      mat.backFaceCulling = false;
      });


    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    return () => {
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady]);

  return <canvas ref={reactCanvas} {...rest} />;
};
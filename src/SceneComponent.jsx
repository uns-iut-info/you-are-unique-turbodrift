import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/core/Physics/physicsEngineComponent";
import * as cannon from "cannon";

import {
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  ArcRotateCamera,
  StandardMaterial,
  Color3,
  PhysicsImpostor,
  CannonJSPlugin,
} from "@babylonjs/core";

import { BuildCarBody } from "./car/Car";

import "@babylonjs/loaders";

// import "@babylonjs/core/Loading/loadingScreen";
// import "@babylonjs/loaders/glTF";
// import "@babylonjs/core/Materials/standardMaterial";
// import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

export const SceneComponent = ({
  antialias,
  engineOptions,
  adaptToDeviceRatio,
  sceneOptions,
  onRender,
  onSceneReady,
  ...rest
}) => {
  const reactCanvas = useRef(null);

  // set up basic engine and scene
  useEffect(() => {
    const { current: canvas } = reactCanvas;

    if (!canvas) return;

    const engine = new Engine(
      canvas,
      antialias,
      engineOptions,
      adaptToDeviceRatio
    );
    const scene = new Scene(engine, sceneOptions);

    if (scene.isReady()) {
      onSceneReady(scene);
      scene.enablePhysics(null, new CannonJSPlugin(true, 1000, cannon));


      // camera
      const camera = new ArcRotateCamera(
        "camera1",
        0,
        0,
        20,
        new Vector3(0, 0, 0),
        scene
      );
      camera.setPosition(new Vector3(11.5, 3.5, 0));

      const importPromise = SceneLoader.ImportMeshAsync(
        "",
        "./models/",
        "akina.glb",
        scene,
        (m) => {}
      );
      importPromise.then((result) => {
        //map is loaded
        console.log(result);
        //Road material
        result.meshes[1].physicsImpostor = new PhysicsImpostor(
          result.meshes[1],
          PhysicsImpostor.BoxImpostor,
          { mass: 0 },
          scene
        );
        // result.meshes[3].physicsImpostor = new PhysicsImpostor(
        //   result.meshes[3],
        //   PhysicsImpostor.BoxImpostor,
        //   { mass: 0 },
        //   scene
        // );

        //meshes[22] is the mesh with the name "Start"
        result.meshes[22].setEnabled(false);
        // camera.setPosition(result.meshes[22].absolutePosition);
        BuildCarBody(camera, result.meshes[22].absolutePosition, scene, engine);
        
      });

      const canvas = scene.getEngine().getRenderingCanvas();
      camera.attachControl(canvas, true);
      // camera.rotate(new Vector3(0, 0, 1), -Math.PI / 2);
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(scene);
      scene.render();
    });

    scene.onNewMaterialAddedObservable.add(function (mat) {
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
  }, [
    antialias,
    engineOptions,
    adaptToDeviceRatio,
    sceneOptions,
    onRender,
    onSceneReady,
  ]);

  return <canvas ref={reactCanvas} {...rest} />;
};

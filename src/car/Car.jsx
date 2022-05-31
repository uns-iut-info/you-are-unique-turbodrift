import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import {
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  ArcRotateCamera,
  StandardMaterial,
  Texture,
  Color3,
  Mesh,
  Vector4,
  Axis,
  Space,
  SolidParticleSystem,
  ActionManager,
  ExecuteCodeAction,
  PhysicsImpostor,
} from "@babylonjs/core";

export const BuildCarBody = (camera, position, scene, engine) => {
  //Car Body Material
  const bodyMaterial = new StandardMaterial("body_mat", scene);
  bodyMaterial.diffuseColor = new Color3(1.0, 0.25, 0.25);
  bodyMaterial.backFaceCulling = false;

  //Array of points for trapezium side of car.
  const side = [
    new Vector3(-6.5, 1.5, -2),
    new Vector3(2.5, 1.5, -2),
    new Vector3(3.5, 0.5, -2),
    new Vector3(-9.5, 0.5, -2),
  ];

  side.push(side[0]); //close trapezium

  //Array of points for the extrusion path
  const extrudePath = [new Vector3(0, 0, 0), new Vector3(0, 0, 4)];

  //Create body and apply material
  const carBody = MeshBuilder.ExtrudeShape(
    "body",
    { shape: side, path: extrudePath, cap: Mesh.CAP_ALL },
    scene
  );
  carBody.material = bodyMaterial;
  camera.parent = carBody;

  //Wheel Material
  const wheelMaterial = new StandardMaterial("wheel_mat", scene);


  //set texture for flat face of wheel
  const faceUV = [];
  faceUV[0] = new Vector4(0, 0, 1, 1);
  faceUV[2] = new Vector4(0, 0, 1, 1);

  //create wheel front inside and apply material
  const wheelFI = MeshBuilder.CreateCylinder(
    "wheelFI",
    {
      diameter: 3,
      height: 1,
      tessellation: 24,
      faceUV: faceUV,
    },
    scene
  );
  wheelFI.material = wheelMaterial;

  //rotate wheel so tread in xz plane
  wheelFI.rotate(Axis.X, Math.PI / 2, Space.WORLD);

  const pivotFI = new Mesh("pivotFI", scene);
  pivotFI.parent = carBody;
  pivotFI.position = new Vector3(-6.5, 0, -2);

  const pivotFO = new Mesh("pivotFO", scene);
  pivotFO.parent = carBody;
  pivotFO.position = new Vector3(-6.5, 0, 2);
  /*------------Create other Wheels as Instances, Parent and Position----------*/

  const wheelFO = wheelFI.createInstance("FO");
  wheelFO.parent = pivotFO;
  wheelFO.position = new Vector3(0, 0, 1.8);

  const wheelRI = wheelFI.createInstance("RI");
  wheelRI.parent = carBody;
  wheelRI.position = new Vector3(0, 0, -2.8);

  const wheelRO = wheelFI.createInstance("RO");
  wheelRO.parent = carBody;
  wheelRO.position = new Vector3(0, 0, 2.8);

  wheelFI.parent = pivotFI;
  wheelFI.position = new Vector3(0, 0, -1.8);

  /*------------End Create other Wheels as Instances, Parent and Position----------*/

  /*---------------------Create Car Centre of Rotation-----------------------------*/
  const pivot = new Mesh("pivot", scene); //current centre of rotation
  pivot.scaling = new Vector3(0.5, 0.5, 0.5);
  pivot.position = new Vector3(position.x , position.y + 0, position.z);
  pivot.rotate(Axis.Y, Math.PI);
  // carBody.scaling = new Vector3(0.5, 0.5, 0.5);
  carBody.parent = pivot;
  pivot.physicsImpostor = new PhysicsImpostor(
    pivot,
    PhysicsImpostor.SphereImpostor,
    { mass: 0 },
    scene
  );
  carBody.showBoundingBox = true;
  scene.meshes[1].showBoundingBox = true;
  scene.meshes[1].physicsImpostor = new PhysicsImpostor(
    scene.meshes[1],
    PhysicsImpostor.BoxImpostor,
    { mass: 0 },
    scene
  );



  console.log(scene.meshes);


  /****************************Key Controls************************************************/

  const map = {}; //object for multiple key presses
  scene.actionManager = new ActionManager(scene);

  scene.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {
      map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    })
  );

  scene.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {
      map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    })
  );

  /****************************End Key Controls************************************************/

  /****************************Variables************************************************/

  let theta = 0;
  let deltaTheta = 0;
  let D = 0; //distance translated per second
  let R = 0; //turning radius, initial set at pivot z value
  let NR = 0; //Next turning radius on wheel turn
  let A = 4; // axel length
  let L = 4; //distance between wheel pivots
  let r = 1.5; // wheel radius
  let psi, psiRI, psiRO, psiFI , psiFO; //wheel rotations
  let phi; //rotation of car when turning

  let F; // frames per second

  /****************************End Variables************************************************/

  /****************************Animation******************************************************/

  scene.registerAfterRender(function () {
    F = engine.getFps();

    if (map[" "] && D < 15) {
      D += 1;
    }

    if (D > 0.15) {
      D -= 0.15;
    } else {
      D = 0;
    }

    const distance = D / F;
    psi = D / (r * F);

    // console.log(map)

    if ((map["q"] || map["Q"]) && -Math.PI / 6 < theta) {
      deltaTheta = -Math.PI / 252;
      theta += deltaTheta;
      pivotFI.rotate(Axis.Y, deltaTheta, Space.LOCAL);
      pivotFO.rotate(Axis.Y, deltaTheta, Space.LOCAL);
      if (Math.abs(theta) > 0.00000001) {
        NR = A / 2 + L / Math.tan(theta);
      } else {
        theta = 0;
        NR = 0;
      }
      pivot.translate(Axis.Z, NR - R, Space.LOCAL);
      carBody.translate(Axis.Z, R - NR, Space.LOCAL);
      R = NR;
    }

    if ((map["d"] || map["D"]) && theta < Math.PI / 6) {
      deltaTheta = Math.PI / 252;
      theta += deltaTheta;
      pivotFI.rotate(Axis.Y, deltaTheta, Space.LOCAL);
      pivotFO.rotate(Axis.Y, deltaTheta, Space.LOCAL);
      if (Math.abs(theta) > 0.00000001) {
        NR = A / 2 + L / Math.tan(theta);
      } else {
        theta = 0;
        NR = 0;
      }
      pivot.translate(Axis.Z, NR - R, Space.LOCAL);
      carBody.translate(Axis.Z, R - NR, Space.LOCAL);
      R = NR;
    } 

    if (D > 0) {
      phi = D / (R * F);
      if (Math.abs(theta) > 0) {
        pivot.rotate(Axis.Y, phi, Space.WORLD);
        psiRI = D / (r * F);
        psiRO = (D * (R + A)) / (r * F);
        psiFI = (D * Math.sqrt(R * R + L * L)) / (r * F);
        psiFO = (D * Math.sqrt((R + A) * (R + A) + L * L)) / (r * F);

        wheelFI.rotate(Axis.Y, psiFI, Space.LOCAL);
        wheelFO.rotate(Axis.Y, psiFO, Space.LOCAL);
        wheelRI.rotate(Axis.Y, psiRI, Space.LOCAL);
        wheelRO.rotate(Axis.Y, psiRO, Space.LOCAL);
      } else {
        pivot.translate(Axis.X, -distance, Space.LOCAL);
        wheelFI.rotate(Axis.Y, psi, Space.LOCAL);
        wheelFO.rotate(Axis.Y, psi, Space.LOCAL);
        wheelRI.rotate(Axis.Y, psi, Space.LOCAL);
        wheelRO.rotate(Axis.Y, psi, Space.LOCAL);
      }
    }
  });
};

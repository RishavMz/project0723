import * as THREE from "three";
import * as CANNON from "cannon-es";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

const characterPath = require("../../assets/walking.fbx");

class User {
  constructor(scene, clock, delta) {
    this.velx = 0.0;
    this.velz = 0.0;
    this.scene = scene;
    this.clock = clock;
    this.delta = delta;
    this.speed = 0.05;
    this.speedLimit = 0.5;
    this.damping = 0.01;
    this.scenes = [];
    this.mixer = [];
    this.rotateSpeed = 0.08;
    this.rotateOffset = 0.1;
    this.direction = 0; // 0 - Forward, 1 - Right, 2 - Reverse, 3 - Left
    this.currentDirection = 0;
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 10, 1, 1),
      new THREE.MeshBasicMaterial({ wireframe: true })
    );
    this.body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 10, 0),
      shape: new CANNON.Sphere(5),
    });
    this.body.linearDamping = 0.8;
    this.body.angularDamping = 0.8;
    this.mesh.position.z = 10;
    this.animate.bind(this.animate);
    this.move.bind(this);
    this.alignCharacter.bind(this);
    document.addEventListener("keydown", (event) => {
      this.move(event.key);
    });

    const fbxLoader = new FBXLoader();
    fbxLoader.load(
      characterPath,
      (object) => {
        object.traverse(function (child) {
          if (child.isMesh) {
            const oldMat = child.material;
            child.material = new THREE.MeshBasicMaterial({
              color: oldMat.color,
              map: oldMat.map,
            });
          }
        });
        this.mixer = new THREE.AnimationMixer(object);
        object.animations.forEach((animationFrame) => {
          this.mixer.clipAction(animationFrame).play();
        });
        object.scale.set(0.1, 0.1, 0.1);
        this.mesh = object;
        this.scene.add(this.mesh);
        if (this.mesh.object) {
          this.mesh.object.updateMatrix();
        }
        this.scenes.push(object);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log(error);
      }
    );
  }
  move(key) {
    switch (key) {
      case "ArrowUp":
        this.direction = 0;
        if (this.velz < this.speedLimit) {
          this.velz += this.speed;
        }
        break;
      case "ArrowDown":
        this.direction = 2;
        if (this.velz > -this.speedLimit) {
          this.velz -= this.speed;
        }
        break;
      case "ArrowLeft":
        this.direction = 3;
        if (this.velx < this.speedLimit) {
          this.velx += this.speed;
        }
        break;
      case "ArrowRight":
        this.direction = 1;
        if (this.velx > -this.speedLimit) {
          this.velx -= this.speed;
        }
        break;
    }

    this.alignCharacter();
  }

  alignCharacter() {
    switch (this.direction) {
      case 0:
        if (this.body.quaternion.y > this.rotateOffset) {
          this.body.quaternion.y -= this.rotateSpeed;
        } else if (this.body.quaternion.y < -this.rotateOffset) {
          this.body.quaternion.y += this.rotateSpeed;
        }
        break;
      case 1:
        if (this.body.quaternion.y > this.rotateOffset - Math.PI / 4) {
          this.body.quaternion.y -= this.rotateSpeed;
        } else if (this.body.quaternion.y < -this.rotateOffset - Math.PI / 4) {
          this.body.quaternion.y += this.rotateSpeed;
        }
        break;
      case 2:
        if (this.body.quaternion.y > this.rotateOffset + Math.PI) {
          this.body.quaternion.y -= this.rotateSpeed;
        } else if (this.body.quaternion.y < -this.rotateOffset + Math.PI) {
          this.body.quaternion.y += this.rotateSpeed;
        }
        break;
      case 3:
        if (this.body.quaternion.y > this.rotateOffset + Math.PI / 4) {
          this.body.quaternion.y -= this.rotateSpeed;
        } else if (this.body.quaternion.y < -this.rotateOffset + Math.PI / 4) {
          this.body.quaternion.y += this.rotateSpeed;
        }
        break;
    }
  }
  animate() {
    this.body.position.x += this.velx;
    this.body.position.z += this.velz;

    this.delta = this.clock.getDelta();

    if (this.mixer) {
      this.mixer.update(this.delta);
    }

    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
    if (this.velx > 0.01) this.velx -= this.damping;
    if (this.velx < 0.01) this.velx += this.damping;
    if (this.velz > 0.01) this.velz -= this.damping;
    if (this.velz < 0.01) this.velz += this.damping;
  }
}

export default User;

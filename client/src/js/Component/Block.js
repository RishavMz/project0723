import * as THREE from "three";
import * as CANNON from "cannon-es";

import blockImage from "../../assets/ground.jpg";

const boxTexture = new THREE.TextureLoader().load(blockImage);

class Block {
  constructor(posx, height, posy, width, depth, length) {
    this.width = width;
    this.depth = depth;
    this.length = length;
    this.segment = 1;
    this.mass = 1000;
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        this.width,
        this.length,
        this.depth,
        this.segment,
        this.segment,
        this.segment
      ),
      new THREE.MeshPhongMaterial({ wireframe: true })
    );
    this.body = new CANNON.Body({
      mass: this.mass,
      position: new CANNON.Vec3(posx, height, posy),
      shape: new CANNON.Box(
        new CANNON.Vec3(this.width / 2, this.length / 2, this.depth / 2)
      ),
    });
    this.body.linearDamping = 0.8;
    this.body.angularDamping = 0.8;
    this.body.sleepSpeedLimit = 1.5;
    this.mesh.position.z = height;
    this.animate.bind(this.animate);
    this.initialize.bind(this);
    this.initialize();
  }
  initialize() {
    this.mesh.material = new THREE.MeshPhongMaterial({
      map: boxTexture,
    });
  }
  animate() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}

export default Block;

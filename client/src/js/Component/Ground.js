import * as THREE from "three";
import * as CANNON from "cannon-es";
import groundImage from "../../assets/ground.jpg";

const groundTexture = new THREE.TextureLoader().load(groundImage);
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.offset.set(0, 0);
groundTexture.repeat.set(16, 16);
class Ground {
  constructor(world, size) {
    this.side = size;
    this.segments = 1;
    this.world = world;
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(
        this.side,
        this.side,
        this.segments,
        this.segments
      ),
      new THREE.MeshBasicMaterial({ wireframe: true })
    );
    this.body = new CANNON.Body({
      shape: new CANNON.Plane(),
      type: CANNON.Body.STATIC,
    });
    this.initialize = this.initialize.bind(this);
    this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

    this.initialize.bind(this);
    this.initialize();
  }
  initialize() {
    this.mesh.material = new THREE.MeshPhongMaterial({
      map: groundTexture,
    });
  }

  animate() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}

export default Ground;

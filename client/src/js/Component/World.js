import * as THREE from "three";
import Ground from "./Ground";
import * as CANNON from "cannon-es";
import User from "./User";
import Stats from "three/examples/jsm/libs/stats.module";
import Block from "./Block";
import Walls from "./walls.json";

const mode = "PROD"; // Set as PROD or DEV

class World {
  constructor(projectionAngle, nearLimit, farLimit, fps) {
    this.projectionAngle = projectionAngle;
    this.nearLimit = nearLimit;
    this.farLimit = farLimit;
    this.fps = fps;

    this.light = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.physics = null;
    this.ground = null;

    this.user = null;
    this.objects = [];
    this.clock = new THREE.Clock();
    this.delta = 1;
    this.cameraDistance = mode === "DEV" ? 250 : 50;
    this.worldSize = 2000;

    this.initialize = this.initialize.bind(this);
    this.animate = this.animate.bind(this);
    this.showStats = this.showStats.bind(this);
    this.addObjects = this.addObjects.bind(this);

    this.initialize();
    this.addObjects();
    this.showStats();
  }

  initialize() {
    const stats = new Stats();
    document.body.appendChild(stats.dom);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.projectionAngle,
      window.innerWidth / window.innerHeight,
      this.nearLimit,
      this.farLimit
    );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.physics = new CANNON.World({
      gravity: new CANNON.Vec3(0, -0, 0),
    });

    this.camera.position.z = this.cameraDistance;
    this.camera.position.y = this.cameraDistance;

    this.light = new THREE.PointLight(0xfdfaf4, 0.1);
    this.light.position.set(0.8, 1.4, 1.0);
    this.scene.add(this.light);

    this.scene.fog = new THREE.FogExp2(0x000000, mode === "DEV" ? 0 : 0.005);
  }

  addObjects() {
    this.ground = new Ground(this, this.worldSize);
    this.scene.add(this.ground.mesh);
    this.physics.addBody(this.ground.body);

    this.user = new User(this.scene, this.clock, this.delta);
    this.physics.addBody(this.user.body);

    Walls.forEach((data) => {
      const wall = new Block(
        data.posx,
        data.posy,
        data.posz,
        data.length,
        data.breadth,
        data.height
      );
      this.scene.add(wall.mesh);
      this.physics.addBody(wall.body);
      this.objects.push(wall);
    });
  }

  showStats() {
    var script = document.createElement("script");
    script.onload = function () {
      var stats = new Stats();
      document.body.appendChild(stats.dom);
      requestAnimationFrame(function loop() {
        stats.update();
        requestAnimationFrame(loop);
      });
    };
    script.src = "//mrdoob.github.io/stats.js/build/stats.min.js";
    document.head.appendChild(script);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.physics.step(1 / this.fps);
    this.objects.forEach((e) => {
      e.animate();
    });
    this.camera.position.copy(
      new THREE.Vector3(
        this.user.mesh.position.x,
        this.camera.position.y,
        this.user.mesh.position.z - this.cameraDistance
      )
    );
    this.light.position.copy(
      new THREE.Vector3(
        this.user.mesh.position.x,
        this.user.mesh.position.y + 10,
        this.user.mesh.position.z - 5
      )
    );
    this.camera.lookAt(this.user.mesh.position);
    this.user.animate();
    this.ground.animate();
    this.objects.forEach((object) => {
      object.animate();
    });
    this.renderer.render(this.scene, this.camera);
  }
}

export default World;
